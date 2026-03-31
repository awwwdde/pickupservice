from __future__ import annotations

from django.db import transaction
from django.utils import timezone

from projects.models import TelegramOutboxMessage


def mark_attempt(msg: TelegramOutboxMessage) -> None:
    TelegramOutboxMessage.objects.filter(pk=msg.pk).update(
        attempts=msg.attempts + 1,
        last_error="",
    )


def mark_sent(msg: TelegramOutboxMessage) -> None:
    TelegramOutboxMessage.objects.filter(pk=msg.pk).update(
        status=TelegramOutboxMessage.Status.SENT,
        sent_at=timezone.now(),
        last_error="",
    )


def mark_failed(msg: TelegramOutboxMessage, error: str, *, permanent: bool) -> None:
    TelegramOutboxMessage.objects.filter(pk=msg.pk).update(
        status=TelegramOutboxMessage.Status.FAILED if permanent else TelegramOutboxMessage.Status.PENDING,
        last_error=(error or "")[:1000],
    )


@transaction.atomic
def fetch_pending(limit: int = 20) -> list[TelegramOutboxMessage]:
    qs = (
        TelegramOutboxMessage.objects.select_for_update(skip_locked=True)
        .filter(status=TelegramOutboxMessage.Status.PENDING)
        .order_by("created_at")
    )
    return list(qs[:limit])

