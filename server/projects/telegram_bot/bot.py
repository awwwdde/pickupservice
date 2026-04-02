from __future__ import annotations

import asyncio
import logging
from dataclasses import dataclass

from asgiref.sync import sync_to_async
from django.conf import settings
from telegram import InlineKeyboardButton, InlineKeyboardMarkup, Update
from telegram.constants import ChatAction
from telegram.ext import (
    Application,
    CallbackQueryHandler,
    CommandHandler,
    ContextTypes,
)

from projects.models import BookingRequest, CallbackRequest, TelegramOutboxMessage

from .formatters import format_booking, format_callback, join_items
from .outbox import fetch_pending, mark_attempt, mark_failed, mark_sent
from .security import check_access, require_token

logger = logging.getLogger(__name__)

PAGE_SIZE = 20
MAX_OUTBOX_ATTEMPTS = 5


@dataclass(frozen=True)
class ListQuery:
    request_type: str  # booking|callback
    page: int


def _menu_kb() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        [
            [
                InlineKeyboardButton(
                    "Последние 20: Запись", callback_data="list:booking:0"
                )
            ],
            [
                InlineKeyboardButton(
                    "Последние 20: Звонок", callback_data="list:callback:0"
                )
            ],
        ]
    )


def _pager_kb(q: ListQuery, has_prev: bool, has_next: bool) -> InlineKeyboardMarkup:
    buttons: list[InlineKeyboardButton] = []
    if has_prev:
        buttons.append(
            InlineKeyboardButton("⬅️ Назад", callback_data=f"list:{q.request_type}:{q.page - 1}")
        )
    buttons.append(
        InlineKeyboardButton("Обновить", callback_data=f"list:{q.request_type}:{q.page}")
    )
    if has_next:
        buttons.append(
            InlineKeyboardButton("Вперёд ➡️", callback_data=f"list:{q.request_type}:{q.page + 1}")
        )
    return InlineKeyboardMarkup([buttons, [InlineKeyboardButton("Меню", callback_data="menu")]])


def _parse_list_query(data: str) -> ListQuery | None:
    try:
        _, req_type, page_s = data.split(":", 2)
        if req_type not in ("booking", "callback"):
            return None
        page = int(page_s)
        if page < 0:
            return None
        return ListQuery(req_type, page)
    except Exception:
        return None


def _split_telegram(text: str, limit: int = 3900) -> list[str]:
    text = text.strip()
    if len(text) <= limit:
        return [text]
    parts: list[str] = []
    buf: list[str] = []
    size = 0
    for block in text.split("\n\n"):
        chunk = (block + "\n\n")
        if size + len(chunk) > limit and buf:
            parts.append("".join(buf).rstrip())
            buf = [chunk]
            size = len(chunk)
        else:
            buf.append(chunk)
            size += len(chunk)
    if buf:
        parts.append("".join(buf).rstrip())
    return parts


def _fetch_list_page(query: ListQuery) -> tuple[int, list[str], str]:
    """Синхронная выборка из БД (вызывать через sync_to_async из async handlers)."""
    offset = query.page * PAGE_SIZE
    if query.request_type == "booking":
        base = BookingRequest.objects.order_by("-created_at")
        total = base.count()
        items = list(base[offset : offset + PAGE_SIZE])
        blocks = [format_booking(o) for o in items]
        header = f"Последние заявки: Запись (стр. {query.page + 1})"
    else:
        base = CallbackRequest.objects.order_by("-created_at")
        total = base.count()
        items = list(base[offset : offset + PAGE_SIZE])
        blocks = [format_callback(o) for o in items]
        header = f"Последние заявки: Звонок (стр. {query.page + 1})"
    return total, blocks, header


async def _send_or_edit(update: Update, text: str, reply_markup: InlineKeyboardMarkup | None) -> None:
    if update.callback_query:
        try:
            await update.callback_query.edit_message_text(text=text, reply_markup=reply_markup)
            return
        except Exception:
            # например, если сообщение слишком старое/уже изменено
            pass
    if update.effective_message:
        await update.effective_message.reply_text(text=text, reply_markup=reply_markup)


async def start_cmd(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    access = check_access(
        user_id=getattr(update.effective_user, "id", None),
        chat_id=getattr(update.effective_chat, "id", None),
    )
    if not access.allowed:
        if update.effective_message:
            await update.effective_message.reply_text(access.reason or "Доступ запрещён.")
        return
    if update.effective_message:
        await update.effective_message.reply_text("Выберите действие:", reply_markup=_menu_kb())


async def menu_cb(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    q = update.callback_query
    if not q:
        return
    await q.answer()

    access = check_access(
        user_id=getattr(update.effective_user, "id", None),
        chat_id=getattr(update.effective_chat, "id", None),
    )
    if not access.allowed:
        await _send_or_edit(update, access.reason or "Доступ запрещён.", None)
        return
    await _send_or_edit(update, "Выберите действие:", _menu_kb())


async def list_cb(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    q = update.callback_query
    if not q:
        return
    await q.answer()

    access = check_access(
        user_id=getattr(update.effective_user, "id", None),
        chat_id=getattr(update.effective_chat, "id", None),
    )
    if not access.allowed:
        await _send_or_edit(update, access.reason or "Доступ запрещён.", None)
        return

    query = _parse_list_query(q.data or "")
    if not query:
        await _send_or_edit(update, "Некорректная команда.", _menu_kb())
        return

    await context.bot.send_chat_action(chat_id=update.effective_chat.id, action=ChatAction.TYPING)

    total, blocks, header = await sync_to_async(_fetch_list_page)(query)

    has_prev = query.page > 0
    has_next = offset + PAGE_SIZE < total
    text = join_items(blocks, header=header)
    parts = _split_telegram(text)

    # Первый кусок редактируем, остальные докидываем отдельными сообщениями (без клавиатуры)
    await _send_or_edit(update, parts[0], _pager_kb(query, has_prev=has_prev, has_next=has_next))
    for extra in parts[1:]:
        if update.effective_message:
            await update.effective_message.reply_text(extra)


def _outbox_sender_chat_ids() -> list[int]:
    explicit = getattr(settings, "TELEGRAM_NOTIFY_CHAT_IDS", None) or []
    if explicit:
        return list(dict.fromkeys(explicit))
    fallback = (
        (getattr(settings, "TELEGRAM_WHITELIST_CHAT_IDS", None) or [])
        + (getattr(settings, "TELEGRAM_WHITELIST_USER_IDS", None) or [])
    )
    return list(dict.fromkeys(fallback))


async def outbox_tick(context: ContextTypes.DEFAULT_TYPE) -> None:
    token_set = bool((getattr(settings, "TELEGRAM_BOT_TOKEN", "") or "").strip())
    if not token_set:
        return

    allowed_targets = set(_outbox_sender_chat_ids())
    if not allowed_targets:
        return

    pending = await sync_to_async(fetch_pending)(limit=30)
    for msg in pending:
        if msg.target_chat_id not in allowed_targets:
            await sync_to_async(mark_failed)(
                msg, "target_chat_id не в whitelist/notify списках", permanent=True
            )
            continue

        await sync_to_async(mark_attempt)(msg)
        try:
            await context.bot.send_message(
                chat_id=msg.target_chat_id, text=msg.message_text
            )
            await sync_to_async(mark_sent)(msg)
        except Exception as exc:
            permanent = (msg.attempts + 1) >= MAX_OUTBOX_ATTEMPTS
            await sync_to_async(mark_failed)(msg, str(exc), permanent=permanent)

        await asyncio.sleep(0)


def _apply_builder_proxy(builder, *, method_names: tuple[str, ...], proxy_url: str):
    """
    Поддержка разных имён методов в PTB (v21: proxy_url/get_updates_proxy_url,
    v22+: proxy/get_updates_proxy).
    """
    if not proxy_url:
        return builder
    for name in method_names:
        fn = getattr(builder, name, None)
        if callable(fn):
            return fn(proxy_url)
    raise RuntimeError(
        f"Установлен TELEGRAM_PROXY_URL, но в python-telegram-bot не найден метод {method_names}"
    )


async def _post_init(app: Application) -> None:
    """
    Быстрая проверка, что бот может достучаться до Telegram.
    Если сеть/прокси сломаны, это будет видно сразу в логах.
    """
    proxy_url = (getattr(settings, "TELEGRAM_PROXY_URL", "") or "").strip()
    get_updates_proxy_url = (
        (getattr(settings, "TELEGRAM_GET_UPDATES_PROXY_URL", "") or "").strip()
        or proxy_url
    )
    try:
        me = await app.bot.get_me()
        logger.info(
            "Telegram OK: @%s (id=%s). proxy=%s get_updates_proxy=%s",
            getattr(me, "username", None),
            getattr(me, "id", None),
            proxy_url or "-",
            get_updates_proxy_url or "-",
        )
    except Exception:
        logger.exception(
            "Telegram FAIL: не удалось выполнить getMe. proxy=%s get_updates_proxy=%s",
            proxy_url or "-",
            get_updates_proxy_url or "-",
        )


def build_application() -> Application:
    token = require_token()
    proxy_url = (getattr(settings, "TELEGRAM_PROXY_URL", "") or "").strip()
    get_updates_proxy_url = (
        (getattr(settings, "TELEGRAM_GET_UPDATES_PROXY_URL", "") or "").strip()
        or proxy_url
    )

    builder = Application.builder().token(token).post_init(_post_init)
    if proxy_url:
        builder = _apply_builder_proxy(
            builder, method_names=("proxy_url", "proxy"), proxy_url=proxy_url
        )
    if get_updates_proxy_url:
        builder = _apply_builder_proxy(
            builder,
            method_names=("get_updates_proxy_url", "get_updates_proxy"),
            proxy_url=get_updates_proxy_url,
        )

    app = builder.build()

    app.add_handler(CommandHandler("start", start_cmd))
    app.add_handler(CallbackQueryHandler(menu_cb, pattern=r"^menu$"))
    app.add_handler(CallbackQueryHandler(list_cb, pattern=r"^list:(booking|callback):\d+$"))

    # Отправка outbox — периодически в фоне
    if app.job_queue is None:
        logger.warning(
            "JobQueue не настроен. Установите зависимости: pip install \"python-telegram-bot[job-queue]\""
        )
    else:
        app.job_queue.run_repeating(outbox_tick, interval=2.0, first=2.0, name="outbox_tick")
    return app

