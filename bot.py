
import os
import re
import json
import hmac
import uuid
import time
import hashlib
import logging
import asyncio
import sqlite3

from datetime import datetime, timezone
from pathlib import Path

import aiohttp
from aiohttp import web

from telegram import (
    Update,
    InlineKeyboardButton,
    InlineKeyboardMarkup,
    ReplyKeyboardMarkup,
    KeyboardButton,
    WebAppInfo,
)
from telegram.ext import (
    Application,
    CommandHandler,
    CallbackQueryHandler,
    MessageHandler,
    ConversationHandler,
    ContextTypes,
    filters,
)

# ---------------- CONFIG ----------------

logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    level=logging.INFO,
)
logger = logging.getLogger(__name__)

BOT_TOKEN = os.getenv("BOT_TOKEN", "")
ADMIN_CHAT_ID = os.getenv("ADMIN_CHAT_ID", "")
SUPPORT_USERNAME = os.getenv(
    "SUPPORT_USERNAME", "JonDayviHar1s"
).lstrip("@")

IFRAGMENT_API_KEY = os.getenv("IFRAGMENT_API_KEY", "")
IFRAGMENT_WEBHOOK_SECRET = os.getenv("IFRAGMENT_WEBHOOK_SECRET", "")
IFRAGMENT_BASE_URL = os.getenv(
    "IFRAGMENT_BASE_URL", "https://api.ifragment.com/v1"
).rstrip("/")

PAYMENT_DETAILS = os.getenv("PAYMENT_DETAILS", "")
SHOP_URL = "https://8chjnbpm2p-ui.github.io/stars-shop-27/"

DB_PATH = os.getenv("DB_PATH", "orders.db")
WEBHOOK_PATH = "/ifragment/webhook"

PACKAGES = {
    "50": {"stars": 50, "price": 10000},
    "100": {"stars": 100, "price": 20000},
    "250": {"stars": 250, "price": 50000},
    "500": {"stars": 500, "price": 100000},
}

CHOOSE_PACKAGE, ENTER_USERNAME = range(2)
telegram_app = None


# ---------------- DATABASE ----------------

def db():
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
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
        conn.execute("""
            CREATE TABLE IF NOT EXISTS webhook_events (
                event_id TEXT PRIMARY KEY,
                received_at TEXT NOT NULL
            )
        """)


def get_order(order_id):
    with db() as conn:
        return conn.execute(
            "SELECT * FROM orders WHERE id = ?", (order_id,)
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
                UPDATE orders SET status = ? WHERE id = ?
            """, (status, order_id))


# ---------------- HELPERS ----------------

def format_price(price):
    return f"{price:,}".replace(",", " ") + " сум"


def package_text(package_id):
    package = PACKAGES[package_id]
    return (
        f"{package['stars']} Telegram Stars — "
        f"{format_price(package['price'])}"
    )


def admin_id():
    try:
        return int(ADMIN_CHAT_ID)
    except (TypeError, ValueError):
        return None


async def send_admin_message(text, reply_markup=None):
    target = admin_id()
    if not target:
        logger.error("ADMIN_CHAT_ID не настроен.")
        return

    await telegram_app.bot.send_message(
        chat_id=target,
        text=text,
        reply_markup=reply_markup,
    )


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


async def check_recipient(username):
    result = await ifragment_request(
        "GET",
        "/recipients/lookup",
        params={
            "username": username.lstrip("@"),
            "product": "STARS",
        },
    )

    data = result.get("data", result)

    if not data.get("found") or not data.get("eligible"):
        return False, data.get("name")

    return True, data.get("name")


async def create_ifragment_order(order):
    order_id = order["id"]

    # Один и тот же ключ используется при повторе этой заявки.
    result = await ifragment_request(
        "POST",
        "/orders",
        headers={
            "Idempotency-Key": f"stars-shop-{order_id}",
            "Content-Type": "application/json",
        },
        json={
            "product": "STARS",
            "quantity": order["quantity"],
            "username": order["username"].lstrip("@"),
            "externalId": order_id,
        },
    )

    data = result.get("data", result)
    supplier_order_id = data.get("id")
    status = data.get("status", "QUEUED")

    update_order(order_id, status, supplier_order_id)

    return status, supplier_order_id


# ---------------- TELEGRAM MENU ----------------

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    keyboard = [
        [
            KeyboardButton(
                "⭐ Открыть магазин",
                web_app=WebAppInfo(url=SHOP_URL),
            )
        ],
        [
            KeyboardButton("🛒 Купить звёзды"),
            KeyboardButton("💰 Цены"),
        ],
        [KeyboardButton("🆘 Поддержка")],
    ]

    await update.effective_message.reply_text(
        "Добро пожаловать в Stars Shop 24! ⭐\n\n"
        "Выбери действие в меню.\n\n"
        "/buy — оформить заказ\n"
        "/prices — цены\n"
        "/support — поддержка",
        reply_markup=ReplyKeyboardMarkup(
            keyboard, resize_keyboard=True
        ),
    )


async def prices(update: Update, context: ContextTypes.DEFAULT_TYPE):
    lines = ["⭐ Цены Stars Shop 24\n"]
    for package_id in PACKAGES:
        lines.append("⭐ " + package_text(package_id))

    await update.effective_message.reply_text("\n".join(lines))


async def support(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if SUPPORT_USERNAME:
        keyboard = InlineKeyboardMarkup([[
            InlineKeyboardButton(
                "💬 Написать в поддержку",
                url=f"https://t.me/{SUPPORT_USERNAME}",
            )
        ]])
        text = f"🆘 Поддержка Stars Shop 24\n\n@{SUPPORT_USERNAME}"
    else:
        keyboard = None
        text = "Контакт поддержки пока не настроен."

    await update.effective_message.reply_text(
        text, reply_markup=keyboard
    )


# ---------------- ORDER CREATION ----------------

async def buy(update: Update, context: ContextTypes.DEFAULT_TYPE):
    buttons = []

    for package_id, package in PACKAGES.items():
        buttons.append([InlineKeyboardButton(
            f"⭐ {package['stars']} — {format_price(package['price'])}",
            callback_data=f"pkg_{package_id}",
        )])

    buttons.append([InlineKeyboardButton(
        "❌ Отмена", callback_data="cancel_order"
    )])

    await update.effective_message.reply_text(
        "🛒 Выбери пакет звёзд:",
        reply_markup=InlineKeyboardMarkup(buttons),
    )
    return CHOOSE_PACKAGE


async def choose_package(
    update: Update, context: ContextTypes.DEFAULT_TYPE
):
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


async def enter_username(
    update: Update, context: ContextTypes.DEFAULT_TYPE
):
    username = update.effective_message.text.strip()

    if not re.fullmatch(r"@?[A-Za-z0-9_]{5,32}", username):
        await update.effective_message.reply_text(
            "Проверь username. Отправь его в формате @username."
        )
        return ENTER_USERNAME

    if not username.startswith("@"):
        username = "@" + username

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
        eligible, recipient_name = await check_recipient(username)
    except Exception:
        logger.exception("Ошибка проверки получателя")
        await update.effective_message.reply_text(
            "Не удалось проверить получателя. Попробуй позже "
            "или обратись в поддержку. Деньги пока не отправляй."
        )
        return ConversationHandler.END

    if not eligible:
        await update.effective_message.reply_text(
            "❌ Этот получатель не найден или не подходит "
            "для получения Stars. Проверь username."
        )
        return ConversationHandler.END

    package = PACKAGES[package_id]
    order_id = uuid.uuid4().hex
    user = update.effective_user

    with db() as conn:
        conn.execute("""
            INSERT INTO orders (
                id, buyer_id, username, package_id,
                quantity, price, status, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            order_id,
            user.id,
            username,
            package_id,
            package["stars"],
            package["price"],
            "WAITING_PAYMENT",
            datetime.now(timezone.utc).isoformat(),
        ))

    payment_text = (
        "\n\n💳 Способ оплаты:\n" + PAYMENT_DETAILS
        if PAYMENT_DETAILS
        else "\n\n⚠️ Способ оплаты ещё не настроен. "
             "Пока не отправляй деньги."
    )

    await update.effective_message.reply_text(
        "✅ Получатель проверен!\n\n"
        f"Номер заказа: {order_id}\n"
        f"Пакет: {package_text(package_id)}\n"
        f"Получатель: {username}\n"
        f"Имя получателя: {recipient_name or 'не указано'}"
        + payment_text
        + "\n\nПосле оплаты администратор проверит перевод. "
          "Stars отправятся только после подтверждения."
    )

    admin_keyboard = InlineKeyboardMarkup([[
        InlineKeyboardButton(
            "✅ Оплата получена — отправить Stars",
            callback_data=f"paid_{order_id}",
        ),
        InlineKeyboardButton(
            "❌ Отклонить",
            callback_data=f"reject_{order_id}",
        ),
    ]])

    await send_admin_message(
        "🛒 Новая заявка Stars Shop 24\n\n"
        f"Заказ: {order_id}\n"
        f"Пакет: {package_text(package_id)}\n"
        f"Получатель: {username}\n"
        f"Покупатель Telegram ID: {user.id}\n\n"
        "Подтверждай оплату только после проверки "
        "реального поступления денег.",
        reply_markup=admin_keyboard,
    )

    context.user_data.pop("package_id", None)
    return ConversationHandler.END


# ---------------- ADMIN ACTIONS ----------------

async def admin_order_action(
    update: Update, context: ContextTypes.DEFAULT_TYPE
):
    query = update.callback_query
    await query.answer()

    if not admin_id() or query.from_user.id != admin_id():
        await query.answer("Нет доступа.", show_alert=True)
        return

    action, order_id = query.data.split("_", 1)
    order = get_order(order_id)

    if not order:
        await query.edit_message_text("Заказ не найден.")
        return

    if action == "reject":
        if order["status"] != "WAITING_PAYMENT":
            await query.edit_message_text(
                "Этот заказ уже обработан."
            )
            return

        update_order(order_id, "REJECTED")
        await query.edit_message_text(
            f"❌ Заказ {order_id} отклонён."
        )
        await telegram_app.bot.send_message(
            chat_id=order["buyer_id"],
            text=f"Заказ {order_id} отклонён. "
                 "Если ты уже оплатил, свяжись с поддержкой.",
        )
        return

    if action == "paid":
        if order["status"] != "WAITING_PAYMENT":
            await query.edit_message_text(
                "Заказ уже обрабатывается или завершён."
            )
            return

        # Блокируем повторное нажатие до обращения к API.
        update_order(order_id, "SUBMITTING")

        await query.edit_message_text(
            f"⏳ Отправляю заказ {order_id} в iFragment..."
        )

        try:
            status, supplier_id = await create_ifragment_order(order)
        except Exception:
            logger.exception("Не удалось создать заказ iFragment")
            update_order(order_id, "API_ERROR")

            await query.edit_message_text(
                "⚠️ Ошибка iFragment. Заказ не подтверждён.\n"
                "Проверь кабинет и API. Не нажимай повторно, "
                "пока администратор не проверит статус."
            )
            return

        await query.edit_message_text(
            f"Заказ отправлен в iFragment.\n"
            f"Статус: {status}\n"
            f"ID поставщика: {supplier_id or 'ожидается'}\n\n"
            "Это ещё не подтверждение доставки."
        )

        await telegram_app.bot.send_message(
            chat_id=order["buyer_id"],
            text=(
                f"⏳ Оплата заказа {order_id} подтверждена.\n"
                "Заказ передан поставщику.\n"
                f"Текущий статус: {status}\n\n"
                "Мы сообщим, когда доставка будет подтверждена."
            ),
        )


# ---------------- WEBHOOK ----------------

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
        return

    with db() as conn:
        try:
            conn.execute(
                "INSERT INTO webhook_events VALUES (?, ?)",
                (
                    event_id,
                    datetime.now(timezone.utc).isoformat(),
                ),
            )
        except sqlite3.IntegrityError:
            logger.info("Повтор webhook event: %s", event_id)
            return

    event_type = event.get("type")
    data = event.get("data", {})
    external_id = data.get("externalId")

    if event_type == "supplier_account.health_changed":
        logger.warning("Supplier Account health: %s", data)
        await send_admin_message(
            "⚠️ Изменился статус Supplier Account:\n"
            + json.dumps(data, ensure_ascii=False)
        )
        return

    if not external_id:
        return

    order = get_order(external_id)
    if not order:
        logger.warning("Webhook для неизвестного заказа: %s", external_id)
        return

    status = data.get("status", "")

    if status in ("SUCCEEDED", "FAILED", "NEEDS_REVIEW"):
        update_order(external_id, status, data.get("id"))

    if status == "SUCCEEDED":
        await telegram_app.bot.send_message(
            chat_id=order["buyer_id"],
            text=(
                f"🎉 Заказ {external_id} успешно выполнен!\n"
                f"⭐ {order['quantity']} Telegram Stars "
                f"отправлены на {order['username']}."
            ),
        )
        await send_admin_message(
            f"✅ Заказ {external_id} успешно выполнен."
        )

    elif status == "FAILED":
        failure = data.get("failure") or {}
        await telegram_app.bot.send_message(
            chat_id=order["buyer_id"],
            text=(
                f"❌ Не удалось выполнить заказ {external_id}.\n"
                "Обратись в поддержку для решения вопроса."
            ),
        )
        await send_admin_message(
            f"❌ Заказ {external_id} завершился ошибкой.\n"
            f"Причина: {failure.get('code', 'не указана')}"
        )

    elif status == "NEEDS_REVIEW":
        await telegram_app.bot.send_message(
            chat_id=order["buyer_id"],
            text=(
                f"⏳ Заказ {external_id} проверяется поддержкой "
                "поставщика. Пока ожидаем результат."
            ),
        )
        await send_admin_message(
            f"⚠️ Заказ {external_id} требует проверки iFragment."
        )


async def webhook_handler(request):
    raw_body = await request.read()
    signature = request.headers.get("X-IFragment-Signature", "")

    if not verify_signature(
        raw_body, signature, IFRAGMENT_WEBHOOK_SECRET
    ):
        return web.Response(status=401, text="Invalid signature")

    try:
        event = json.loads(raw_body)
    except json.JSONDecodeError:
        return web.Response(status=400, text="Invalid JSON")

    # Быстро отвечаем iFragment, обработка продолжается отдельно.
    asyncio.create_task(process_webhook_event(event))
    return web.Response(status=200, text="OK")


async def health_handler(request):
    return web.Response(text="Stars Shop 24 is running")


# ---------------- START ----------------

async def main():
    global telegram_app

    if not BOT_TOKEN:
        raise RuntimeError("Не задан BOT_TOKEN.")

    init_db()

    telegram_app = Application.builder().token(BOT_TOKEN).build()

    conversation = ConversationHandler(
        entry_points=[
            CommandHandler("buy", buy),
            MessageHandler(filters.Regex("^🛒 Купить звёзды$"), buy),
        ],
        states={
            CHOOSE_PACKAGE: [
                CallbackQueryHandler(
                    choose_package,
                    pattern=r"^(pkg_(50|100|250|500)|cancel_order)$",
                )
            ],
            ENTER_USERNAME: [
                MessageHandler(
                    filters.TEXT & ~filters.COMMAND,
                    enter_username,
                )
            ],
        },
        fallbacks=[CommandHandler("cancel", cancel_command)],
    )

    telegram_app.add_handler(CommandHandler("start", start))
    telegram_app.add_handler(CommandHandler("prices", prices))
    telegram_app.add_handler(CommandHandler("support", support))
    telegram_app.add_handler(conversation)
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

    web_app = web.Application()
    web_app.router.add_post(WEBHOOK_PATH, webhook_handler)
    web_app.router.add_get("/health", health_handler)

    runner = web.AppRunner(web_app)
    await runner.setup()

    port = int(os.getenv("PORT", "10000"))
    site = web.TCPSite(runner, "0.0.0.0", port)
    await site.start()

    logger.info("Stars Shop 24 запущен на порту %s", port)

    try:
        await asyncio.Event().wait()
    finally:
        await runner.cleanup()
        await telegram_app.updater.stop()
        await telegram_app.stop()
        await telegram_app.shutdown()


async def cancel_command(
    update: Update, context: ContextTypes.DEFAULT_TYPE
):
    context.user_data.pop("package_id", None)
    await update.effective_message.reply_text("Заказ отменён.")
    return ConversationHandler.END


if __name__ == "__main__":
    asyncio.run(main())
