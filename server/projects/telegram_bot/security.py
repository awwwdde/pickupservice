from __future__ import annotations

from dataclasses import dataclass

from django.conf import settings


@dataclass(frozen=True)
class TelegramAccess:
    allowed: bool
    reason: str | None = None


def check_access(user_id: int | None, chat_id: int | None) -> TelegramAccess:
    whitelist_users = set(getattr(settings, "TELEGRAM_WHITELIST_USER_IDS", []) or [])
    whitelist_chats = set(getattr(settings, "TELEGRAM_WHITELIST_CHAT_IDS", []) or [])

    if not whitelist_users and not whitelist_chats:
        return TelegramAccess(False, "Whitelist не настроен.")

    if user_id is not None and user_id in whitelist_users:
        return TelegramAccess(True)

    if chat_id is not None and chat_id in whitelist_chats:
        return TelegramAccess(True)

    return TelegramAccess(False, "Доступ запрещён.")


def require_token() -> str:
    token = (getattr(settings, "TELEGRAM_BOT_TOKEN", "") or "").strip()
    if not token:
        raise RuntimeError(
            "TELEGRAM_BOT_TOKEN не задан. Задайте переменную окружения сервиса."
        )
    return token

