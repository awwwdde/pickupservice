"""
manage.py debug_yandex_page

Открывает страницу отзывов Яндекс.Карт, ждёт 15 секунд и сохраняет
HTML + скриншот в /tmp/ для диагностики.

Пример:
  python manage.py debug_yandex_page --org-id 121304824267
"""

import os
import time

from django.core.management.base import BaseCommand, CommandError


class Command(BaseCommand):
    help = "Диагностика: сохраняет HTML и скриншот страницы отзывов Яндекс.Карт в /tmp/"

    def add_arguments(self, parser):
        parser.add_argument("--org-id", dest="org_id", default="")
        parser.add_argument("--wait", type=int, default=15, help="Секунд ждать после загрузки")

    def handle(self, *args, **options):
        try:
            from playwright.sync_api import sync_playwright
        except ImportError:
            raise CommandError("pip install playwright && playwright install chromium")

        org_id = options["org_id"].strip()
        if not org_id:
            from projects.models import TestimonialsSettings
            cfg = TestimonialsSettings.objects.first()
            org_id = (cfg.yandex_org_id if cfg else "") or os.environ.get("YANDEX_MAPS_ORG_ID", "")
        if not org_id:
            raise CommandError("Укажите --org-id")

        url = f"https://yandex.ru/maps/org/{org_id}/reviews/"
        wait_sec = options["wait"]

        self.stdout.write(f"URL: {url}")
        self.stdout.write(f"Ждём {wait_sec}с после загрузки...")

        headless = not os.environ.get("DISPLAY")
        self.stdout.write(f"headless={headless}")

        with sync_playwright() as pw:
            browser = pw.chromium.launch(
                headless=headless,
                args=["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
            )
            ctx = browser.new_context(
                viewport={"width": 1280, "height": 900},
                user_agent=(
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                    "AppleWebKit/537.36 (KHTML, like Gecko) "
                    "Chrome/121.0.0.0 Safari/537.36"
                ),
                locale="ru-RU",
                timezone_id="Europe/Moscow",
            )
            ctx.add_init_script("""
                Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
                window.chrome = { runtime: {} };
            """)
            page = ctx.new_page()
            page.goto(url, timeout=60_000, wait_until="domcontentloaded")

            self.stdout.write(f"Текущий URL после goto: {page.url}")
            self.stdout.write(f"Заголовок: {page.title()}")

            time.sleep(wait_sec)

            self.stdout.write(f"URL после ожидания: {page.url}")

            # Сохраняем HTML
            html_path = "/tmp/yandex_reviews_debug.html"
            html = page.content()
            with open(html_path, "w", encoding="utf-8") as f:
                f.write(html)
            self.stdout.write(f"HTML сохранён: {html_path}  ({len(html)} байт)")

            # Скриншот
            screenshot_path = "/tmp/yandex_reviews_debug.png"
            page.screenshot(path=screenshot_path, full_page=True)
            self.stdout.write(f"Скриншот: {screenshot_path}")

            # Показываем первые 3000 символов HTML
            self.stdout.write("\n--- HTML (первые 3000 символов) ---")
            self.stdout.write(html[:3000])
            self.stdout.write("---")

            # Ищем ключевые слова
            keywords = ["review", "отзыв", "captcha", "капча", "SmartCaptcha", "showcaptcha"]
            self.stdout.write("\n--- Ключевые слова в HTML ---")
            html_lower = html.lower()
            for kw in keywords:
                count = html_lower.count(kw.lower())
                self.stdout.write(f"  '{kw}': {count} вхождений")

            # Все классы содержащие 'review'
            import re
            classes_with_review = re.findall(r'class="([^"]*review[^"]*)"', html, re.IGNORECASE)
            if classes_with_review:
                self.stdout.write(f"\n--- Классы с 'review' (первые 20) ---")
                for cls in classes_with_review[:20]:
                    self.stdout.write(f"  {cls}")
            else:
                self.stdout.write("\nКлассов с 'review' не найдено.")

            browser.close()

        self.stdout.write(self.style.SUCCESS("\nДиагностика завершена."))
        self.stdout.write(f"Скачайте файлы для анализа:")
        self.stdout.write(f"  scp root@<IP>:{html_path} .")
        self.stdout.write(f"  scp root@<IP>:{screenshot_path} .")
