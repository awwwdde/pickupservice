from __future__ import annotations

from projects.models import BookingRequest, CallbackRequest


def format_booking(obj: BookingRequest) -> str:
    return "\n".join(
        [
            f"Запись #{obj.id} ({obj.created_at:%Y-%m-%d %H:%M})",
            f"Имя: {obj.name}",
            f"Телефон: {obj.phone}",
            f"Почта: {obj.email}",
            f"Марка: {obj.brand}",
            f"Модель и год: {obj.model}",
            f"Услуга: {obj.service}",
            "Сообщение:",
            (obj.message or "—"),
        ]
    )


def format_callback(obj: CallbackRequest) -> str:
    return "\n".join(
        [
            f"Звонок #{obj.id} ({obj.created_at:%Y-%m-%d %H:%M})",
            f"Имя: {obj.name}",
            f"Телефон: {obj.phone}",
        ]
    )


def join_items(items: list[str], *, header: str) -> str:
    if not items:
        return f"{header}\n\nПока пусто."
    return header + "\n\n" + "\n\n---\n\n".join(items)

