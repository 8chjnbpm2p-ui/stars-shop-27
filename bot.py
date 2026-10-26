
import os
import logging

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

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

BOT_TOKEN = os.getenv("BOT_TOKEN")
ADMIN_CHAT_ID = os.getenv("ADMIN_CHAT_ID", "")
SUPPORT_USERNAME = os.getenv("SUPPORT_USERNAME", "")

SHOP_URL = "https://8chjnbpm2p-ui.github.io/stars-shop-27/"

PACKAGES = {
    "50": "50 Telegram Stars",
    "100": "100 Telegram Stars",
    "250": "250 Telegram Stars",
    "500": "500 Telegram Stars",
}

CHOOSE_PACKAGE, ENTER_USERNAME = range(2)


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    keyboard = [
        [KeyboardButton(
            "⭐ Открыть магазин",
            web_app=WebAppInfo(url=SHOP_URL)
        )],
        [
            KeyboardButton("🛒 Купить звёзды"),
            KeyboardButton("💰 Цены"),
        ],
        [KeyboardButton("🆘 Поддержка")],
    ]

    await update.effective_message.reply_text(
        "Добро пожаловать в Stars Shop 24! ⭐\n\n"
        "Выбери действие в меню или используй команды ниже.\n"
        "/buy — заказать\n"
        "/prices — пакеты\n"
        "/support — поддержка",
        reply_markup=ReplyKeyboardMarkup(
            keyboard,
            resize_keyboard=True
        ),
    )


async def prices(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.effective_message.reply_text(
        "⭐ Пакеты Stars Shop 24:\n\n"
        "⭐ 50 звёзд\n"
        "⭐ 100 звёзд\n"
        "⭐ 250 звёзд\n"
        "⭐ 500 звёзд\n\n"
        "Стоимость и оплата пока не подключены.\n"
        "Для оформления заявки нажми /buy."
    )


async def support(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if SUPPORT_USERNAME:
        contact = SUPPORT_USERNAME
    else:
        contact = "Контакт поддержки пока не настроен."

    await update.effective_message.reply_text(
        f"🆘 Поддержка Stars Shop 24\n\n{contact}"
    )


async def buy(update: Update, context: ContextTypes.DEFAULT_TYPE):
    buttons = [
        [
            InlineKeyboardButton("⭐ 50", callback_data="pkg_50"),
            InlineKeyboardButton("⭐ 100", callback_data="pkg_100"),
        ],
        [
            InlineKeyboardButton("⭐ 250", callback_data="pkg_250"),
            InlineKeyboardButton("⭐ 500", callback_data="pkg_500"),
        ],
        [
            InlineKeyboardButton("❌ Отмена", callback_data="cancel_order"),
        ],
    ]

    await update.effective_message.reply_text(
        "🛒 Выбери пакет звёзд:",
        reply_markup=InlineKeyboardMarkup(buttons),
    )

    return CHOOSE_PACKAGE


async def choose_package(
    update: Update,
    context: ContextTypes.DEFAULT_TYPE
):
    query = update.callback_query
    await query.answer()

    if query.data == "cancel_order":
        await query.edit_message_text("Заказ отменён.")
        return ConversationHandler.END

    package_id = query.data.removeprefix("pkg_")

    if package_id not in PACKAGES:
        await query.edit_message_text("Неизвестный пакет. Попробуй /buy.")
        return ConversationHandler.END

    context.user_data["package_id"] = package_id

    await query.edit_message_text(
        f"Ты выбрал: {PACKAGES[package_id]}.\n\n"
        "Теперь отправь Telegram-ник получателя, например @username.\n"
        "Не отправляй пароль или код входа от Telegram."
    )

    return ENTER_USERNAME


async def enter_username(
    update: Update,
    context: ContextTypes.DEFAULT_TYPE
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

    user = update.effective_user
    order_id = f"{user.id}-{update.update_id}"

    await update.effective_message.reply_text(
        "✅ Заявка создана!\n\n"
        f"Номер: {order_id}\n"
        f"Пакет: {PACKAGES[package_id]}\n"
        f"Получатель: {username}\n\n"
        "⚠️ Это заявка, а не оплаченный заказ. "
        "Оплата и доставка ещё не подключены."
    )

    if ADMIN_CHAT_ID.isdigit():
        try:
            await context.bot.send_message(
                chat_id=int(ADMIN_CHAT_ID),
                text=(
                    f"🛒 Новая заявка {order_id}\n"
                    f"Пакет: {PACKAGES[package_id]}\n"
                    f"Получатель: {username}\n"
                    f"Покупатель: {user.id}"
                ),
            )
        except Exception:
            logger.exception("Не удалось отправить заявку администратору")

    context.user_data.pop("package_id", None)
    return ConversationHandler.END


async def cancel_command(
    update: Update,
    context: ContextTypes.DEFAULT_TYPE
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
                filters.Regex("^🛒 Купить звёзды$"),
                buy
            ),
        ],
        states={
            CHOOSE_PACKAGE: [
                CallbackQueryHandler(
                    choose_package,
                    pattern="^(pkg_|cancel_order$)"
                ),
            ],
            ENTER_USERNAME: [
                MessageHandler(
                    filters.TEXT & ~filters.COMMAND,
                    enter_username
                ),
            ],
        },
        fallbacks=[
            CommandHandler("cancel", cancel_command),
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

    import asyncio
    try:
        await asyncio.Event().wait()
    finally:
        await app.updater.stop()
        await app.stop()
        await app.shutdown()


if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
