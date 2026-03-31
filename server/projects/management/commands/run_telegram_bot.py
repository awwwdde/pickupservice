import logging

from django.core.management.base import BaseCommand

from projects.telegram_bot.bot import build_application

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = "Запустить Telegram-бота (long polling) для заявок сайта"

    def handle(self, *args, **options):
        app = build_application()
        self.stdout.write(self.style.SUCCESS("Telegram bot started (polling)"))
        app.run_polling(close_loop=False)

