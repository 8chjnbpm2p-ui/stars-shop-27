import os
import re
import json
import hmac
import time
import uuid
import hashlib
import logging
import asyncio
import sqlite3
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import parse_qsl

import aiohttp
from aiohttp import web
from telegram import (
    Update, InlineKeyboardButton, InlineKeyboardMarkup,
    ReplyKeyboardMarkup, KeyboardButton, WebAppInfo,
)
from telegram.ext import (
    Application, CommandHandler, CallbackQueryHandler, MessageHandler,
    ConversationHandler, ContextTypes, filters,
)

# ---------------- CONFIG ----------------
logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    level=logging.INFO,
)
logger = logging.getLogger(__name__)

BOT_TOKEN = os.getenv("BOT_TOKEN", "")
ADMIN_CHAT_ID = os.getenv("ADMIN_CHAT_ID", "")
SUPPORT_USERNAME = os.getenv("SUPPORT_USERNAME", "JonDayviHar1s").lstrip("@")
IFRAGMENT_API_KEY = os.getenv("IFRAGMENT_API_KEY", "")
IFRAGMENT_WEBHOOK_SECRET = os.getenv("IFRAGMENT_WEBHOOK_SECRET", "")
IFRAGMENT_BASE_URL = os.getenv(
    "IFRAGMENT_BASE_URL", "https://api.ifragment.com/v1"
).rstrip("/")
PAYMENT_DETAILS = os.getenv("PAYMENT_DETAILS", "")
SHOP_URL = "https://8chjnbpm2p-ui.github.io/stars-shop-27/"
SHOP_ORIGIN = "https://8chjnbpm2p-ui.github.io"
DB_PATH = os.getenv("DB_PATH", "orders.db")
WEBHOOK_PATH = "/ifragment/webhook"

PACKAGES = {
    "50": {"stars": 50, "price": 10500},
    "100": {"stars": 100, "price": 21000},
    "250": {"stars": 250, "price": 52000},
    "500": {"stars": 500, "price": 105000},
}

PREMIUM_PACKAGES = {
    "3": {"months": 3, "price": 165000, "package_id": "premium_3"},
    "6": {"months": 6, "price": 225000, "package_id": "premium_6"},
    "12": {"months": 12, "price": 399000, "package_id": "premium_12"},
}

CHOOSE_PACKAGE, ENTER_USERNAME, CHOOSE_PREMIUM, ENTER_PREMIUM_USERNAME = range(4)
telegram_app = None

# ---------------- DATABASE ----------------
def db():
    connection = sqlite3.connect(DB_PATH, timeout=20)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA busy_timeout = 20000")
    return connection


def init_db():
    parent = Path(DB_PATH).parent
    if str(parent) not in ("", "."):
        parent.mkdir(parents=True, exist_ok=True)

    with db() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS orders (
                id TEXT PRIMARY KEY,
                buyer_id INTEGER NOT NULL,
                username TEXT NOT NULL,
                package_id TEXT NOT NULL,
                quantity INTEGER NOT NULL,
                price INTEGER NOT NULL,
                status TEXT NOT NULL,
                ifragment_id TEXT,
                created_at TEXT NOT NULL
            )
        """)

        # Миграция: старые заказы Stars сохраняются.
        columns = {
            row[1]
            for row in conn.execute("PRAGMA table_info(orders)").fetchall()
        }

        if "product" not in columns:
            conn.execute(
                "ALTER TABLE orders ADD COLUMN product TEXT NOT NULL DEFAULT 'STARS'"
            )

        if "months" not in columns:
            conn.execute(
                "ALTER TABLE orders ADD COLUMN months INTEGER"
            )

        conn.execute("""
            CREATE TABLE IF NOT EXISTS webhook_events (
                event_id TEXT PRIMARY KEY,
                received_at TEXT NOT NULL
            )
        """)


def get_order(order_id):
    with db() as conn:
        return conn.execute(
            "SELECT * FROM orders WHERE id = ?",
            (order_id,),
        ).fetchone()


def update_order(order_id, status, ifragment_id=None):
    with db() as conn:
        if ifragment_id:
            conn.execute("""
                UPDATE orders
                SET status = ?, ifragment_id = ?
                WHERE id = ?
            """, (status, ifragment_id, order_id))
        else:
            conn.execute("""
                UPDATE orders
                SET status = ?
                WHERE id = ?
            """, (status, order_id))


def order_to_dict(order):
    product = (order["product"] or "STARS").upper()

    return {
        "id": order["id"],
        "username": order["username"],
        "package_id": order["package_id"],
        "product": product,
        "quantity": order["quantity"] if product == "STARS" else None,
        "months": order["months"],
        "price": order["price"],
        "status": order["status"],
        "ifragment_id": order["ifragment_id"],
        "created_at": order["created_at"],
    }


# ---------------- HELPERS ----------------
def format_price(price):
    return f"{price:,}".replace(",", " ") + " сум"


def package_text(package_id):
    package = PACKAGES[package_id]
    return (
        f"{package['stars']} Telegram Stars — "
        f"{format_price(package['price'])}"
    )


def product_text(order):
    product = (order["product"] or "STARS").upper()

    if product == "PREMIUM":
        return f"Telegram Premium — {order['months']} мес."

    return f"{order['quantity']} Telegram Stars"


def admin_id():
    try:
        return int(ADMIN_CHAT_ID)
    except (TypeError, ValueError):
        return None


async def send_admin_message(text, reply_markup=None):
    target = admin_id()

    if not target:
        logger.error("ADMIN_CHAT_ID не настроен.")
        raise RuntimeError("ADMIN_CHAT_ID не настроен.")

    await telegram_app.bot.send_message(
        chat_id=target,
        text=text,
        reply_markup=reply_markup,
    )


def valid_username(value):
    username = str(value or "").strip().lstrip("@")

    if not re.fullmatch(r"[A-Za-z0-9_]{5,32}", username):
        return None

    return "@" + username


def valid_order_id(value):
    return bool(re.fullmatch(r"[a-f0-9]{32}", str(value or "")))


# ---------------- TELEGRAM WEB APP AUTH ----------------
def verify_telegram_init_data(init_data):
    if not BOT_TOKEN or not init_data:
        return None

    try:
        parsed = dict(parse_qsl(init_data, keep_blank_values=True))
        received_hash = parsed.pop("hash", None)

        if not received_hash:
            return None

        data_check_string = "\n".join(
            f"{key}={value}"
            for key, value in sorted(parsed.items())
        )

        secret_key = hmac.new(
            b"WebAppData",
            BOT_TOKEN.encode(),
            hashlib.sha256,
        ).digest()

        calculated_hash = hmac.new(
            secret_key,
            data_check_string.encode(),
            hashlib.sha256,
        ).hexdigest()

        if not hmac.compare_digest(calculated_hash, received_hash):
            return None

        auth_date = int(parsed.get("auth_date", "0"))
        now = int(time.time())

        if auth_date <= 0 or auth_date > now + 60:
            return None

        if now - auth_date > 86400:
            return None

        user_data = json.loads(parsed.get("user", "{}"))
        user_id = int(user_data.get("id", 0))

        if user_id <= 0:
            return None

        return {
            "id": user_id,
            "first_name": user_data.get("first_name", ""),
            "username": user_data.get("username", ""),
        }

    except (ValueError, TypeError, json.JSONDecodeError):
        return None


def get_webapp_user(request):
    authorization = request.headers.get("Authorization", "")
    init_data = ""

    if authorization.startswith("tma "):
        init_data = authorization[4:].strip()

    if not init_data:
        init_data = request.headers.get(
            "X-Telegram-Init-Data",
            "",
        )

    return verify_telegram_init_data(init_data)


# ---------------- HTTP / CORS ----------------
@web.middleware
async def api_middleware(request, handler):
    origin = request.headers.get("Origin", "")

    if origin and origin != SHOP_ORIGIN:
        return web.json_response(
            {"error": "Origin not allowed"},
            status=403,
        )

    if request.method == "OPTIONS":
        response = web.Response(status=204)
    else:
        try:
            response = await handler(request)
        except web.HTTPException as exc:
            response = exc
        except Exception:
            logger.exception("Ошибка HTTP endpoint")
            response = web.json_response(
                {"error": "Внутренняя ошибка сервера"},
                status=500,
            )

    if origin == SHOP_ORIGIN:
        response.headers["Access-Control-Allow-Origin"] = SHOP_ORIGIN
        response.headers["Vary"] = "Origin"
        response.headers["Access-Control-Allow-Methods"] = (
            "GET, POST, OPTIONS"
        )
        response.headers["Access-Control-Allow-Headers"] = (
            "Content-Type, Authorization, X-Telegram-Init-Data"
        )

    return response


def api_user_or_error(request):
    user = get_webapp_user(request)

    if not user:
        return None, web.json_response(
            {
                "error": "Не удалось проверить Telegram. "
                         "Открой магазин внутри Telegram."
            },
            status=401,
        )

    return user, None


async def read_json(request):
    try:
        data = await request.json()

        if not isinstance(data, dict):
            raise ValueError("JSON должен быть объектом")

        return data

    except (json.JSONDecodeError, ValueError, TypeError):
        raise web.HTTPBadRequest(text="Некорректный JSON")


# ---------------- IFRAGMENT API ----------------
async def ifragment_request(method, path, **kwargs):
    if not IFRAGMENT_API_KEY:
        raise RuntimeError("Не настроен IFRAGMENT_API_KEY.")

    headers = kwargs.pop("headers", {})
    headers["X-API-Key"] = IFRAGMENT_API_KEY
    timeout = aiohttp.ClientTimeout(total=20)

    async with aiohttp.ClientSession(timeout=timeout) as session:
        async with session.request(
            method,
            IFRAGMENT_BASE_URL + path,
            headers=headers,
            **kwargs,
        ) as response:
            body = await response.text()

            if response.status < 200 or response.status >= 300:
                logger.error(
                    "iFragment API error %s: %s",
                    response.status,
                    body[:1000],
                )
                raise RuntimeError(
                    f"iFragment API вернул ошибку {response.status}"
                )

            try:
                return json.loads(body) if body else {}
            except json.JSONDecodeError:
                raise RuntimeError("iFragment вернул некорректный JSON.")


async def check_recipient(username, product="STARS", months=None):
    product = str(product or "STARS").upper()

    params = {
        "username": username.lstrip("@"),
        "product": product,
    }

    if product == "PREMIUM":
        if months not in (3, 6, 12):
            raise ValueError("Для Premium выбери 3, 6 или 12 месяцев.")
        params["months"] = months

    elif product != "STARS":
        raise ValueError("Неизвестный продукт.")

    result = await ifragment_request(
        "GET",
        "/recipients/lookup",
        params=params,
    )

    data = result.get("data", result)

    return (
        bool(data.get("found") and data.get("eligible")),
        data.get("name"),
    )


async def create_ifragment_order(order):
    order_id = order["id"]
    product = (order["product"] or "STARS").upper()

    payload = {
        "product": product,
        "username": order["username"].lstrip("@"),
        "externalId": order_id,
    }

    if product == "PREMIUM":
        payload["months"] = int(order["months"])
    else:
        payload["quantity"] = int(order["quantity"])

    result = await ifragment_request(
        "POST",
        "/orders",
        headers={
            "Idempotency-Key": f"stars-shop-{order_id}",
            "Content-Type": "application/json",
        },
        json=payload,
    )

    data = result.get("data", result)
    supplier_order_id = data.get("id")
    status = str(data.get("status", "QUEUED")).upper()

    update_order(order_id, status, supplier_order_id)

    return status, supplier_order_id
    
    # ---------------- MINI APP API ----------------
async def api_check_recipient(request):
    user, error = api_user_or_error(request)
    if error:
        return error

    body = await read_json(request)
    username = valid_username(body.get("username"))
    product = str(body.get("product", "STARS")).upper()
    months = body.get("months")

    if not username:
        return web.json_response(
            {"error": "Проверь Telegram username."},
            status=400,
        )

    if product not in ("STARS", "PREMIUM"):
        return web.json_response(
            {"error": "Неизвестный продукт."},
            status=400,
        )

    if product == "PREMIUM":
        try:
            months = int(months)
        except (TypeError, ValueError):
            months = 0

        if str(months) not in PREMIUM_PACKAGES:
            return web.json_response(
                {"error": "Выбери Premium на 3, 6 или 12 месяцев."},
                status=400,
            )

    try:
        eligible, recipient_name = await check_recipient(
            username,
            product,
            months,
        )
    except Exception:
        logger.exception("Ошибка проверки получателя через Mini App")
        return web.json_response(
            {"error": "Не удалось проверить получателя. Попробуй позже."},
            status=502,
        )

    if not eligible:
        message = (
            "Premium нельзя подарить этому аккаунту. "
            "Возможно, Premium уже активен или аккаунт не подходит."
            if product == "PREMIUM"
            else "Получатель не найден или не подходит для Stars."
        )

        return web.json_response(
            {
                "eligible": False,
                "username": username,
                "name": recipient_name,
                "product": product,
                "months": months,
                "error": message,
            },
            status=404,
        )

    return web.json_response({
        "eligible": True,
        "username": username,
        "name": recipient_name,
        "product": product,
        "months": months,
        "message": "Получатель проверен.",
    })


async def api_create_order(request):
    user, error = api_user_or_error(request)
    if error:
        return error

    if not PAYMENT_DETAILS:
        return web.json_response(
            {"error": "Оплата временно не настроена. Не отправляй деньги."},
            status=503,
        )

    body = await read_json(request)
    product = str(body.get("product", "STARS")).upper()
    username = valid_username(body.get("username"))

    if not username:
        return web.json_response(
            {"error": "Проверь Telegram username."},
            status=400,
        )

    if product == "STARS":
        package_id = str(body.get("package_id", ""))

        if package_id not in PACKAGES:
            return web.json_response(
                {"error": "Неизвестный пакет Stars."},
                status=400,
            )

        package = PACKAGES[package_id]
        quantity = package["stars"]
        months = None
        price = package["price"]

    elif product == "PREMIUM":
        try:
            months = int(body.get("months", 0))
        except (TypeError, ValueError):
            months = 0

        if months not in (3, 6, 12):
            return web.json_response(
                {"error": "Выбери Premium на 3, 6 или 12 месяцев."},
                status=400,
            )

        package = PREMIUM_PACKAGES[str(months)]
        package_id = package["package_id"]
        quantity = 0
        price = package["price"]

    else:
        return web.json_response(
            {"error": "Неизвестный продукт."},
            status=400,
        )

    # Повторная проверка получателя на сервере.
    try:
        eligible, recipient_name = await check_recipient(
            username,
            product,
            months,
        )
    except Exception:
        logger.exception(
            "Ошибка проверки получателя при создании заказа"
        )
        return web.json_response(
            {"error": "Не удалось проверить получателя. Заказ не создан."},
            status=502,
        )

    if not eligible:
        message = (
            "Premium нельзя подарить этому аккаунту. "
            "Возможно, Premium уже активен или аккаунт не подходит."
            if product == "PREMIUM"
            else "Получатель не найден или не подходит для Stars."
        )

        return web.json_response(
            {"error": message},
            status=400,
        )

    order_id = uuid.uuid4().hex

    with db() as conn:
        conn.execute("""
            INSERT INTO orders (
                id, buyer_id, username, package_id, quantity, price,
                status, created_at, product, months
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            order_id,
            user["id"],
            username,
            package_id,
            quantity,
            price,
            "WAITING_PAYMENT",
            datetime.now(timezone.utc).isoformat(),
            product,
            months,
        ))

    order_info = {
        "id": order_id,
        "username": username,
        "product": product,
        "quantity": quantity if product == "STARS" else None,
        "months": months,
        "price": price,
        "status": "WAITING_PAYMENT",
        "recipient_name": recipient_name,
    }

    return web.json_response({
        "success": True,
        "order": order_info,
        "payment_details": PAYMENT_DETAILS,
        "message": "Заказ создан. После перевода сообщи об оплате.",
    }, status=201)


async def notify_admin_payment(order):
    keyboard = InlineKeyboardMarkup([[
        InlineKeyboardButton(
            "✅ Оплата получена — выполнить заказ",
            callback_data=f"paid_{order['id']}",
        ),
        InlineKeyboardButton(
            "❌ Отклонить",
            callback_data=f"reject_{order['id']}",
        ),
    ]])

    await send_admin_message(
        "💳 Покупатель сообщил об оплате!\n\n"
        f"Заказ: {order['id']}\n"
        f"Товар: {product_text(order)}\n"
        f"Сумма: {format_price(order['price'])}\n"
        f"Получатель: {order['username']}\n"
        f"Покупатель Telegram ID: {order['buyer_id']}\n\n"
        "⚠️ Проверь реальное поступление денег в банке "
        "перед подтверждением.",
        reply_markup=keyboard,
    )


async def api_report_payment(request):
    user, error = api_user_or_error(request)
    if error:
        return error

    order_id = request.match_info.get("order_id", "")

    if not valid_order_id(order_id):
        return web.json_response(
            {"error": "Некорректный номер заказа."},
            status=400,
        )

    order = get_order(order_id)

    if not order or order["buyer_id"] != user["id"]:
        return web.json_response(
            {"error": "Заказ не найден."},
            status=404,
        )

    with db() as conn:
        result = conn.execute("""
            UPDATE orders
            SET status = 'PAYMENT_REPORTED'
            WHERE id = ?
            AND buyer_id = ?
            AND status = 'WAITING_PAYMENT'
        """, (order_id, user["id"]))

        if result.rowcount != 1:
            current = get_order(order_id)

            return web.json_response(
                {
                    "error": "Заявка уже отправлена или заказ обработан.",
                    "status": current["status"] if current else "UNKNOWN",
                },
                status=409,
            )

    try:
        await notify_admin_payment(get_order(order_id))
    except Exception:
        logger.exception(
            "Не удалось отправить заявку администратору"
        )
        update_order(order_id, "WAITING_PAYMENT")

        return web.json_response(
            {"error": "Не удалось отправить заявку. Попробуй ещё раз."},
            status=503,
        )

    return web.json_response({
        "success": True,
        "status": "PAYMENT_REPORTED",
        "message": "Заявка отправлена администратору.",
    })


async def api_order_history(request):
    user, error = api_user_or_error(request)
    if error:
        return error

    try:
        limit = int(request.query.get("limit", "30"))
    except ValueError:
        limit = 30

    limit = max(1, min(limit, 50))

    with db() as conn:
        rows = conn.execute("""
            SELECT * FROM orders
            WHERE buyer_id = ?
            ORDER BY created_at DESC
            LIMIT ?
        """, (user["id"], limit)).fetchall()

    return web.json_response({
        "orders": [order_to_dict(row) for row in rows],
    })


async def api_order_status(request):
    user, error = api_user_or_error(request)
    if error:
        return error

    order_id = request.match_info.get("order_id", "")

    if not valid_order_id(order_id):
        return web.json_response(
            {"error": "Некорректный номер заказа."},
            status=400,
        )

    order = get_order(order_id)

    if not order or order["buyer_id"] != user["id"]:
        return web.json_response(
            {"error": "Заказ не найден."},
            status=404,
        )

    return web.json_response({
        "order": order_to_dict(order),
    })


# ---------------- TELEGRAM MENU ----------------
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    keyboard = [
    [KeyboardButton("⭐ Открыть магазин", web_app=WebAppInfo(url=SHOP_URL))],
    [KeyboardButton("🛒 Купить звёзды"), KeyboardButton("💎 Купить Premium")],
    [KeyboardButton("💰 Цены")],
    [KeyboardButton("🆘 Поддержка")],
]

    await update.effective_message.reply_text(
        "Добро пожаловать в Stars Shop 27! ⭐\n\n"
        "Выбери действие в меню.\n\n"
        "/buy — оформить заказ\n"
        "/prices — цены\n"
        "/support — поддержка",
        reply_markup=ReplyKeyboardMarkup(
            keyboard,
            resize_keyboard=True,
        ),
    )


async def prices(update: Update, context: ContextTypes.DEFAULT_TYPE):
    lines = ["⭐ Цены Stars Shop 27\n"]

    for package_id in PACKAGES:
        lines.append("⭐ " + package_text(package_id))

    lines += ["", "⭐ Telegram Premium"]

    for months, package in PREMIUM_PACKAGES.items():
        lines.append(
            f"⭐ {months} мес. — {format_price(package['price'])}"
        )

    await update.effective_message.reply_text("\n".join(lines))


async def support(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if SUPPORT_USERNAME:
        keyboard = InlineKeyboardMarkup([[
            InlineKeyboardButton(
                "💬 Написать в поддержку",
                url=f"https://t.me/{SUPPORT_USERNAME}",
            )
        ]])

        text = (
            "🆘 Поддержка Stars Shop 27\n\n"
            f"@{SUPPORT_USERNAME}"
        )
    else:
        keyboard = None
        text = "Контакт поддержки пока не настроен."

    await update.effective_message.reply_text(
        text,
        reply_markup=keyboard,
    )
    
    # ---------------- OPTIONAL BOT PURCHASE FLOW (STARS ONLY) ----------------
async def buy(update: Update, context: ContextTypes.DEFAULT_TYPE):
    buttons = []

    for package_id, package in PACKAGES.items():
        buttons.append([
            InlineKeyboardButton(
                f"⭐ {package['stars']} — {format_price(package['price'])}",
                callback_data=f"pkg_{package_id}",
            )
        ])

    buttons.append([
        InlineKeyboardButton(
            "❌ Отмена",
            callback_data="cancel_order",
        )
    ])

    await update.effective_message.reply_text(
        "🛒 Выбери пакет звёзд:",
        reply_markup=InlineKeyboardMarkup(buttons),
    )

    return CHOOSE_PACKAGE


async def choose_package(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()

    if query.data == "cancel_order":
        await query.edit_message_text("Заказ отменён.")
        return ConversationHandler.END

    package_id = query.data.removeprefix("pkg_")

    if package_id not in PACKAGES:
        await query.edit_message_text("Неизвестный пакет.")
        return ConversationHandler.END

    context.user_data["package_id"] = package_id

    await query.edit_message_text(
        f"Выбрано: {package_text(package_id)}\n\n"
        "Отправь Telegram username получателя.\n"
        "Например: @username\n\n"
        "Не отправляй пароль или код входа."
    )

    return ENTER_USERNAME


async def enter_username(update: Update, context: ContextTypes.DEFAULT_TYPE):
    username = valid_username(update.effective_message.text)

    if not username:
        await update.effective_message.reply_text(
            "Проверь username. Отправь его в формате @username."
        )
        return ENTER_USERNAME

    package_id = context.user_data.get("package_id")

    if package_id not in PACKAGES:
        await update.effective_message.reply_text(
            "Сессия заказа закончилась. Начни заново: /buy"
        )
        return ConversationHandler.END

    await update.effective_message.reply_text(
        "⏳ Проверяю получателя через iFragment..."
    )

    try:
        eligible, recipient_name = await check_recipient(
            username,
            "STARS",
        )
    except Exception:
        logger.exception("Ошибка проверки получателя")
        await update.effective_message.reply_text(
            "Не удалось проверить получателя. Попробуй позже."
        )
        return ConversationHandler.END

    if not eligible:
        await update.effective_message.reply_text(
            "❌ Этот получатель не найден или не подходит для Stars."
        )
        return ConversationHandler.END

    if not PAYMENT_DETAILS:
        await update.effective_message.reply_text(
            "Оплата пока не настроена. Не отправляй деньги."
        )
        return ConversationHandler.END

    package = PACKAGES[package_id]
    order_id = uuid.uuid4().hex

    with db() as conn:
        conn.execute("""
            INSERT INTO orders (
                id, buyer_id, username, package_id, quantity,
                price, status, created_at, product, months
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'STARS', NULL)
        """, (
            order_id,
            update.effective_user.id,
            username,
            package_id,
            package["stars"],
            package["price"],
            "WAITING_PAYMENT",
            datetime.now(timezone.utc).isoformat(),
        ))

    buyer_keyboard = InlineKeyboardMarkup([[
        InlineKeyboardButton(
            "✅ Я оплатил",
            callback_data=f"buyer_paid_{order_id}",
        )
    ]])

    await update.effective_message.reply_text(
        "✅ Получатель проверен!\n\n"
        f"Номер заказа: {order_id}\n"
        f"Пакет: {package_text(package_id)}\n"
        f"Получатель: {username}\n"
        f"Имя получателя: {recipient_name or 'не указано'}\n\n"
        "💳 Способ оплаты:\n"
        f"{PAYMENT_DETAILS}\n\n"
        "После перевода нажми «Я оплатил». "
        "Администратор проверит поступление денег.",
        reply_markup=buyer_keyboard,
    )

    context.user_data.pop("package_id", None)
    return ConversationHandler.END


async def buyer_paid_action(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()

    order_id = query.data.removeprefix("buyer_paid_")
    order = get_order(order_id)

    if not order or query.from_user.id != order["buyer_id"]:
        await query.message.reply_text("Заказ не найден.")
        return

    with db() as conn:
        result = conn.execute("""
            UPDATE orders
            SET status = 'PAYMENT_REPORTED'
            WHERE id = ?
            AND buyer_id = ?
            AND status = 'WAITING_PAYMENT'
        """, (order_id, query.from_user.id))

        if result.rowcount != 1:
            await query.message.reply_text(
                "Заявка уже отправлена или заказ обработан."
            )
            return

    try:
        await notify_admin_payment(get_order(order_id))
    except Exception:
        logger.exception("Не удалось отправить заявку администратору")
        update_order(order_id, "WAITING_PAYMENT")
        await query.message.reply_text(
            "Не удалось отправить заявку. Попробуй ещё раз."
        )
        return

    try:
        await query.edit_message_reply_markup(reply_markup=None)
    except Exception:
        logger.exception("Не удалось убрать кнопку оплаты")

    await query.message.reply_text(
        "✅ Заявка на проверку оплаты отправлена. "
        "Ожидай подтверждения администратора."
    )


# ---------------- ADMIN ACTIONS ----------------
async def admin_order_action(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()

    if not admin_id() or query.from_user.id != admin_id():
        await query.message.reply_text("Нет доступа.")
        return

    action, order_id = query.data.split("_", 1)
    order = get_order(order_id)

    if not order:
        await query.message.reply_text("Заказ не найден.")
        return

    if order["status"] != "PAYMENT_REPORTED":
        await query.message.reply_text(
            "Этот заказ уже обработан или не ожидает подтверждения оплаты."
        )
        return

    if action == "reject":
        update_order(order_id, "REJECTED")

        await query.edit_message_text(
            f"❌ Заказ {order_id} отклонён."
        )

        await telegram_app.bot.send_message(
            chat_id=order["buyer_id"],
            text=(
                f"❌ Заказ {order_id} отклонён.\n"
                "Если ты уже оплатил, свяжись с поддержкой."
            ),
        )
        return

    if action == "paid":
        with db() as conn:
            result = conn.execute("""
                UPDATE orders
                SET status = 'SUBMITTING'
                WHERE id = ?
                AND status = 'PAYMENT_REPORTED'
            """, (order_id,))

            if result.rowcount != 1:
                await query.edit_message_text(
                    "Заказ уже обрабатывается."
                )
                return

        await query.edit_message_text(
            f"⏳ Отправляю заказ {order_id} в iFragment..."
        )

        try:
            status, supplier_id = await create_ifragment_order(order)
        except Exception:
            logger.exception("Не удалось создать заказ iFragment")
            update_order(order_id, "API_ERROR")

            await query.message.reply_text(
                "⚠️ Ошибка iFragment. Проверь кабинет и статус заказа. "
                "Не создавай повторный заказ, пока не проверишь "
                "состояние предыдущего."
            )
            return

        await query.message.reply_text(
            "✅ Заказ передан в iFragment.\n"
            f"Статус: {status}\n"
            f"ID поставщика: {supplier_id or 'ожидается'}\n\n"
            "Это ещё не подтверждение доставки."
        )

        await telegram_app.bot.send_message(
            chat_id=order["buyer_id"],
            text=(
                f"⏳ Оплата заказа {order_id} подтверждена.\n"
                f"Товар: {product_text(order)}\n"
                "Заказ передан поставщику.\n"
                f"Текущий статус: {status}\n\n"
                "Мы сообщим, когда доставка будет подтверждена."
            ),
        )


# ---------------- IFRAGMENT WEBHOOK ----------------
def verify_signature(raw_body, header, secret):
    if not secret or not header:
        return False

    try:
        parts = dict(
            item.split("=", 1)
            for item in header.split(",")
        )

        timestamp = parts["t"]
        signature = parts["v1"]

        if abs(time.time() - int(timestamp)) > 300:
            return False

        signed_payload = timestamp.encode() + b"." + raw_body

        expected = hmac.new(
            secret.encode(),
            signed_payload,
            hashlib.sha256,
        ).hexdigest()

        return hmac.compare_digest(expected, signature)

    except (ValueError, KeyError, TypeError):
        return False


async def process_webhook_event(event):
    event_id = event.get("id")

    if not event_id:
        logger.warning("Webhook без event id")
        return

    with db() as conn:
        existing = conn.execute(
            "SELECT event_id FROM webhook_events WHERE event_id = ?",
            (event_id,),
        ).fetchone()

    if existing:
        logger.info("Повтор webhook event: %s", event_id)
        return

    event_type = event.get("type", "")
    data = event.get("data", {}) or {}

    if event_type == "supplier_account.health_changed":
        logger.warning("Supplier Account health: %s", data)

        await send_admin_message(
            "⚠️ Изменился статус Supplier Account:\n"
            + json.dumps(data, ensure_ascii=False)
        )

    else:
        external_id = data.get("externalId")

        if not external_id:
            logger.warning("Webhook без externalId: %s", event_id)
            return

        order = get_order(external_id)

        if not order:
            logger.warning(
                "Webhook для неизвестного заказа: %s",
                external_id,
            )
            return

        status = str(data.get("status", "")).upper()

        if event_type.endswith(".succeeded"):
            status = "SUCCEEDED"
        elif event_type.endswith(".failed"):
            status = "FAILED"
        elif event_type.endswith(".needs_review"):
            status = "NEEDS_REVIEW"

        if status in ("SUCCEEDED", "FAILED", "NEEDS_REVIEW"):
            update_order(
                external_id,
                status,
                data.get("id"),
            )

        item_text = product_text(order)

        if status == "SUCCEEDED":
            buyer_text = (
                f"🎉 Заказ {external_id} успешно выполнен!\n"
                f"⭐ {item_text} отправлен(о) на {order['username']}."
            )

            await telegram_app.bot.send_message(
                chat_id=order["buyer_id"],
                text=buyer_text,
            )

            await send_admin_message(
                f"✅ Заказ {external_id} успешно выполнен: "
                f"{item_text} для {order['username']}."
            )

        elif status == "FAILED":
            failure = data.get("failure") or {}

            await telegram_app.bot.send_message(
                chat_id=order["buyer_id"],
                text=(
                    f"❌ Не удалось выполнить заказ {external_id}.\n"
                    f"Товар: {item_text}. "
                    "Обратись в поддержку для решения вопроса."
                ),
            )

            await send_admin_message(
                f"❌ Заказ {external_id} завершился ошибкой.\n"
                f"Товар: {item_text}\n"
                f"Причина: {failure.get('code', 'не указана')}"
            )

        elif status == "NEEDS_REVIEW":
            await telegram_app.bot.send_message(
                chat_id=order["buyer_id"],
                text=(
                    f"⏳ Заказ {external_id} проверяется "
                    "поддержкой поставщика. "
                    f"Товар: {item_text}. Пока ожидаем результат."
                ),
            )

            await send_admin_message(
                f"⚠️ Заказ {external_id} требует проверки iFragment "
                f"({item_text})."
            )

    with db() as conn:
        conn.execute(
            "INSERT OR IGNORE INTO webhook_events VALUES (?, ?)",
            (
                event_id,
                datetime.now(timezone.utc).isoformat(),
            ),
        )


async def webhook_handler(request):
    raw_body = await request.read()

    signature = request.headers.get(
        "X-IFragment-Signature",
        "",
    )

    if not verify_signature(
        raw_body,
        signature,
        IFRAGMENT_WEBHOOK_SECRET,
    ):
        return web.Response(
            status=401,
            text="Invalid signature",
        )

    try:
        event = json.loads(raw_body)
    except json.JSONDecodeError:
        return web.Response(
            status=400,
            text="Invalid JSON",
        )

    try:
        await process_webhook_event(event)
    except Exception:
        logger.exception("Ошибка обработки webhook")
        return web.Response(
            status=500,
            text="Webhook processing failed",
        )

    return web.Response(status=200, text="OK")


# ---------------- HEALTH / CANCEL ----------------
async def health_handler(request):
    return web.json_response({
        "status": "ok",
        "service": "Stars Shop 27",
    })


async def options_handler(request):
    return web.Response(status=204)


async def cancel_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    context.user_data.pop("package_id", None)

    await update.effective_message.reply_text(
        "Заказ отменён."
    )

    return ConversationHandler.END


# ---------------- START SERVER ----------------
async def main():
    global telegram_app

    if not BOT_TOKEN:
        raise RuntimeError("Не задан BOT_TOKEN.")

    init_db()

    telegram_app = (
        Application.builder()
        .token(BOT_TOKEN)
        .build()
    )

    conversation = ConversationHandler(
        entry_points=[
            CommandHandler("buy", buy),
            MessageHandler(
                filters.Regex("^🛒 Купить звёзды$"),
                buy,
            ),
        ],
        states={
    CHOOSE_PACKAGE: [
        CallbackQueryHandler(
            choose_package,
            pattern=r"^(pkg_(50|100|250|500)|cancel_order)$"
        )
    ],
    ENTER_USERNAME: [
        MessageHandler(filters.TEXT & ~filters.COMMAND, enter_username)
    ],
    CHOOSE_PREMIUM: [
        CallbackQueryHandler(
            choose_premium,
            pattern=r"^(premium_(3|6|12)|cancel_premium)$"
        )
    ],
    ENTER_PREMIUM_USERNAME: [
        MessageHandler(filters.TEXT & ~filters.COMMAND, enter_premium_username)
    ],
},

    telegram_app.add_handler(CommandHandler("start", start))
    telegram_app.add_handler(CommandHandler("prices", prices))
    telegram_app.add_handler(CommandHandler("support", support))
    telegram_app.add_handler(conversation)

    telegram_app.add_handler(
        CallbackQueryHandler(
            buyer_paid_action,
            pattern=r"^buyer_paid_[a-f0-9]{32}$",
        )
    )

    telegram_app.add_handler(
        CallbackQueryHandler(
            admin_order_action,
            pattern=r"^(paid|reject)_[a-f0-9]{32}$",
        )
    )

    telegram_app.add_handler(
        MessageHandler(filters.Regex("^💰 Цены$"), prices)
    )

    telegram_app.add_handler(
        MessageHandler(filters.Regex("^🆘 Поддержка$"), support)
    )

    await telegram_app.initialize()
    await telegram_app.start()
    await telegram_app.updater.start_polling()

    web_app = web.Application(
        middlewares=[api_middleware],
        client_max_size=1024 * 1024,
    )

    web_app.router.add_route(
        "OPTIONS",
        "/api/{tail:.*}",
        options_handler,
    )

    web_app.router.add_post(
        "/api/recipient/check",
        api_check_recipient,
    )

    web_app.router.add_post(
        "/api/orders",
        api_create_order,
    )

    web_app.router.add_post(
        "/api/orders/{order_id}/paid",
        api_report_payment,
    )

    web_app.router.add_get(
        "/api/orders",
        api_order_history,
    )

    web_app.router.add_get(
        "/api/orders/{order_id}",
        api_order_status,
    )

    web_app.router.add_post(
        WEBHOOK_PATH,
        webhook_handler,
    )

    web_app.router.add_get(
        "/health",
        health_handler,
    )

    runner = web.AppRunner(web_app)
    await runner.setup()

    port = int(os.getenv("PORT", "10000"))

    site = web.TCPSite(
        runner,
        "0.0.0.0",
        port,
    )

    await site.start()

    logger.info("Stars Shop 27 запущен на порту %s", port)

    try:
        await asyncio.Event().wait()
    finally:
        await runner.cleanup()
        await telegram_app.updater.stop()
        await telegram_app.stop()
        await telegram_app.shutdown()


if __name__ == "__main__":
    asyncio.run(main())