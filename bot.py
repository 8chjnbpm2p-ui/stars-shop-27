
import os
import logging
import asyncio

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

logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    level=logging.INFO,
)
logger = logging.getLogger(__name__)

BOT_TOKEN = os.getenv("BOT_TOKEN")
ADMIN_CHAT_ID = os.getenv("ADMIN_CHAT_ID", "")
SUPPORT_USERNAME = os.getenv(
    "SUPPORT_USERNAME", "JonDayviHar1s"
).lstrip("@")

SHOP_URL = "https://8chjnbpm2p-ui.github.io/stars-shop-27/"

PACKAGES = {
    "50": {"stars": 50, "price": 10000},
    "100": {"stars": 100, "price": 20000},
    "250": {"stars": 250, "price": 50000},
    "500": {"stars": 500, "price": 100000},
}

CHOOSE_PACKAGE, ENTER_USERNAME = range(2)


def format_price(price: int) -> str:
    return f"{price:,}".replace(",", " ") + " сум"


def package_text(package_id: str) -> str:
    package = PACKAGES[package_id]
    return (
        f"{package['stars']} Telegram Stars — "
        f"{format_price(package['price'])}"
    )


async def start(
    update: Update,
    context: ContextTypes.DEFAULT_TYPE,
):
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
        "/buy — оформить заявку\n"
        "/prices — посмотреть цены\n"
        "/support — связаться с поддержкой",
        reply_markup=ReplyKeyboardMarkup(
            keyboard, resize_keyboard=True
        ),
    )


async def prices(
    update: Update,
    context: ContextTypes.DEFAULT_TYPE,
):
    lines = ["⭐ Цены Stars Shop 24\n"]

    for package_id in PACKAGES:
        lines.append("⭐ " + package_text(package_id))

    lines.append(
        "\nДля оформления заявки нажми /buy.\n"
        "⚠️ Оплата и автоматическая доставка пока не подключены."
    )

    await update.effective_message.reply_text("\n".join(lines))


async def support(
    update: Update,
    context: ContextTypes.DEFAULT_TYPE,
):
    username = SUPPORT_USERNAME

    if username:
        text = (
            "🆘 Поддержка Stars Shop 24\n\n"
            f"Написать администратору: @{username}"
        )
        keyboard = InlineKeyboardMarkup([
            [
                InlineKeyboardButton(
                    "💬 Написать в поддержку",
                    url=f"https://t.me/{username}",
                )
            ]
        ])
    else:
        text = "🆘 Контакт поддержки пока не настроен."
        keyboard = None

    await update.effective_message.reply_text(
        text, reply_markup=keyboard
    )


async def buy(
    update: Update,
    context: ContextTypes.DEFAULT_TYPE,
):
    buttons = []

    for package_id, package in PACKAGES.items():
        buttons.append([
            InlineKeyboardButton(
                f"⭐ {package['stars']} — "
                f"{format_price(package['price'])}",
                callback_data=f"pkg_{package_id}",
            )
        ])

    buttons.append([
        InlineKeyboardButton(
            "❌ Отмена", callback_data="cancel_order"
        )
    ])

    await update.effective_message.reply_text(
        "🛒 Выбери пакет звёзд и его стоимость:",
        reply_markup=InlineKeyboardMarkup(buttons),
    )

    return CHOOSE_PACKAGE


async def choose_package(
    update: Update,
    context: ContextTypes.DEFAULT_TYPE,
):
    query = update.callback_query
    await query.answer()

    if query.data == "cancel_order":
        await query.edit_message_text("Заказ отменён.")
        return ConversationHandler.END

    package_id = query.data.removeprefix("pkg_")

    if package_id not in PACKAGES:
        await query.edit_message_text(
            "Неизвестный пакет. Попробуй /buy."
        )
        return ConversationHandler.END

    context.user_data["package_id"] = package_id

    await query.edit_message_text(
        f"Ты выбрал:\n{package_text(package_id)}\n\n"
        "Теперь отправь Telegram-ник получателя, например @username.\n"
        "Не отправляй пароль или код входа от Telegram."
    )

    return ENTER_USERNAME


async def enter_username(
    update: Update,
    context: ContextTypes.DEFAULT_TYPE,
):
    username = update.effective_message.text.strip()

    if not username.startswith("@") or len(username) < 2:
        await update.effective_message.reply_text(
            "Введи ник в формате @username."
        )
        return ENTER_USERNAME

    package_id = context.user_data.get("package_id")

    if package_id not in PACKAGES:
        await update.effective_message.reply_text(
            "Сессия заказа закончилась. Начни заново: /buy"
        )
        return ConversationHandler.END

    package = PACKAGES[package_id]
    user = update.effective_user
    order_id = f"{user.id}-{update.update_id}"

    await update.effective_message.reply_text(
        "✅ Заявка создана!\n\n"
        f"Номер: {order_id}\n"
        f"Пакет: {package_text(package_id)}\n"
        f"Получатель: {username}\n\n"
        "⚠️ Это пока только заявка, а не оплаченный заказ.\n"
        "Не отправляй деньги, пока не подтверждены способ "
        "оплаты и условия заказа."
    )

    if ADMIN_CHAT_ID.isdigit():
        try:
            await context.bot.send_message(
                chat_id=int(ADMIN_CHAT_ID),
                text=(
                    f"🛒 Новая заявка {order_id}\n"
                    f"Пакет: {package_text(package_id)}\n"
                    f"Получатель: {username}\n"
                    f"Покупатель: {user.id}"
                ),
            )
        except Exception:
            logger.exception(
                "Не удалось отправить заявку администратору"
            )

    context.user_data.pop("package_id", None)
    return ConversationHandler.END


async def cancel_command(
    update: Update,
    context: ContextTypes.DEFAULT_TYPE,
):
    context.user_data.pop("package_id", None)
    await update.effective_message.reply_text("Заказ отменён.")
    return ConversationHandler.END


async def main():
    if not BOT_TOKEN:
        raise RuntimeError(
            "Не задан BOT_TOKEN в переменных окружения сервера."
        )

    app = Application.builder().token(BOT_TOKEN).build()

    order_conversation = ConversationHandler(
        entry_points=[
            CommandHandler("buy", buy),
            MessageHandler(
                filters.Regex("^🛒 Купить звёзды$"), buy
            ),
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
        fallbacks=[
            CommandHandler("cancel", cancel_command)
        ],
    )

    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("prices", prices))
    app.add_handler(CommandHandler("support", support))
    app.add_handler(order_conversation)

    app.add_handler(
        MessageHandler(filters.Regex("^💰 Цены$"), prices)
    )
    app.add_handler(
        MessageHandler(filters.Regex("^🆘 Поддержка$"), support)
    )

    await app.initialize()
    await app.start()
    await app.updater.start_polling()

    logger.info("Stars Shop 24 запущен!")

    try:
        await asyncio.Event().wait()
    finally:
        await app.updater.stop()
        await app.stop()
        await app.shutdown()


if __name__ == "__main__":
    asyncio.run(main())
