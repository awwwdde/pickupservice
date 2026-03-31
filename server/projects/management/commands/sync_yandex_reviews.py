"""
manage.py sync_yandex_reviews

Скрейпит отзывы со страницы организации на Яндекс.Картах с помощью Playwright
и сохраняет их в модель Testimonial (source=yandex).

Требования:
  pip install playwright
  playwright install chromium   # один раз

ID организации берётся из:
  1. --org-id
  2. TestimonialsSettings.yandex_org_id (из БД)
  3. Переменная окружения YANDEX_MAPS_ORG_ID

Примеры:
  python manage.py sync_yandex_reviews
  python manage.py sync_yandex_reviews --org-id 123456789
  python manage.py sync_yandex_reviews --max-reviews 50 --headless
  python manage.py sync_yandex_reviews --dry-run
  # С логом в БД (используется при запуске из админки):
  python manage.py sync_yandex_reviews --log-id 7
"""

import logging
import os
import shutil
import subprocess
import sys
import time

from django.core.management.base import BaseCommand, CommandError
from django.utils import timezone

logger = logging.getLogger(__name__)

# Максимальное число отзывов за один запуск (защита от бесконечного скролла)
DEFAULT_MAX_REVIEWS = 100
# Сколько раз подряд скроллим вниз без новых отзывов, прежде чем считать список конечным
SCROLL_STALE_LIMIT = 5
# Пауза между скроллами (сек)
SCROLL_DELAY = 1.5
# Таймаут первоначальной загрузки (мс)
PAGE_LOAD_TIMEOUT = 60_000


def _get_org_id_from_env() -> str:
    return os.environ.get("YANDEX_MAPS_ORG_ID", "").strip()


def _reviews_url(org_id: str) -> str:
    return f"https://yandex.ru/maps/org/{org_id}/reviews/"


def _in_async_context() -> bool:
    try:
        import asyncio

        asyncio.get_running_loop()
        return True
    except RuntimeError:
        return False


def _reexec_with_xvfb_if_needed(*, headless: bool, log) -> None:
    """
    Если DISPLAY не задан и headless=False, пытаемся перезапустить текущую
    management-команду под xvfb-run (Linux). Это позволяет работать
    в "не-headless" режиме даже на сервере без X.
    """
    if headless:
        return
    if os.name == "nt":
        return
    if os.environ.get("DISPLAY"):
        return
    if os.environ.get("YANDEX_XVFB_REEXEC") == "1":
        return

    xvfb = shutil.which("xvfb-run")
    if not xvfb:
        log("DISPLAY не задан и xvfb-run не найден — переключаемся на headless-режим.")
        os.environ["YANDEX_FORCE_HEADLESS_FALLBACK"] = "1"
        return

    log("DISPLAY не задан — перезапускаем команду под xvfb-run.")
    env = dict(os.environ)
    env["YANDEX_XVFB_REEXEC"] = "1"
    # -a: авто-выбор номера DISPLAY чтобы избежать коллизий
    cmd = [xvfb, "-a", sys.executable, *sys.argv]
    raise SystemExit(subprocess.call(cmd, env=env))


# ---------------------------------------------------------------------------
# Playwright scraper
# ---------------------------------------------------------------------------

def scrape_reviews(
    org_id: str,
    max_reviews: int,
    headless: bool,
    log_cb=None,
) -> list[dict]:
    """
    Открывает страницу отзывов организации, скроллит вниз пока не получит
    max_reviews штук или список не кончится.

    Возвращает список dict с ключами:
      yandex_review_id, quote, author_name, yandex_author_url, rating
    """
    try:
        from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeout
    except ImportError:
        raise CommandError(
            "Playwright не установлен. Выполните:\n"
            "  pip install playwright\n"
            "  playwright install chromium"
        )

    def log(msg: str):
        logger.info(msg)
        if log_cb:
            log_cb(msg)

    url = _reviews_url(org_id)
    log(f"Открываем: {url}  (headless={headless})")

    reviews: dict[str, dict] = {}  # review_id → data

    with sync_playwright() as pw:
        browser = pw.chromium.launch(
            headless=headless,
            args=[
                "--no-sandbox",
                "--disable-dev-shm-usage",
                "--disable-blink-features=AutomationControlled",
                "--disable-gpu",
            ],
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
        # Скрываем признаки automation
        ctx.add_init_script("""
            Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
            window.chrome = { runtime: {} };
        """)
        page = ctx.new_page()

        try:
            page.goto(url, timeout=PAGE_LOAD_TIMEOUT, wait_until="domcontentloaded")
        except PlaywrightTimeout:
            raise CommandError(f"Страница не загрузилась за {PAGE_LOAD_TIMEOUT // 1000}с: {url}")

        # Проверяем капчу
        if "showcaptcha" in page.url or page.locator("form.CheckboxCaptcha-Form").count():
            raise CommandError(
                "Яндекс показал капчу и заблокировал парсинг. "
                "Попробуйте позже или смените IP-адрес сервера."
            )

        # Ждём появления списка отзывов
        # Яндекс.Карты используют div[class*="reviews-list"] или ul с li[class*="review"]
        review_list_selectors = [
            "[class*='reviews-list']",
            "[class*='business-reviews-view']",
            "ul[class*='reviews']",
        ]
        list_found = False
        for sel in review_list_selectors:
            try:
                page.wait_for_selector(sel, timeout=15_000)
                list_found = True
                log(f"Список отзывов найден по селектору: {sel}")
                break
            except PlaywrightTimeout:
                continue

        if not list_found:
            # Пробуем просто подождать и поискать любой review-like элемент
            time.sleep(3)
            log("Список отзывов не найден по стандартным селекторам, пробуем generic-поиск...")

        stale_count = 0
        prev_count = 0

        while len(reviews) < max_reviews and stale_count < SCROLL_STALE_LIMIT:
            _parse_visible_reviews(page, reviews)
            current_count = len(reviews)
            log(f"  Собрано отзывов: {current_count}")

            if current_count >= max_reviews:
                break

            if current_count == prev_count:
                stale_count += 1
            else:
                stale_count = 0
                prev_count = current_count

            # Скроллим вниз внутри блока отзывов
            _scroll_reviews(page)
            time.sleep(SCROLL_DELAY)

        browser.close()

    result = list(reviews.values())
    log(f"Итого уникальных отзывов с текстом: {len(result)}")
    return result


def _scroll_reviews(page) -> None:
    """Скроллим вниз — сначала пробуем внутренний контейнер, потом всю страницу."""
    scrolled = False
    # Пробуем найти прокручиваемый контейнер отзывов
    for sel in ["[class*='reviews-list']", "[class*='scroll__container']", "[class*='sidebar']"]:
        els = page.locator(sel)
        if els.count() > 0:
            try:
                els.first.evaluate("el => el.scrollBy(0, 600)")
                scrolled = True
                break
            except Exception:
                continue
    if not scrolled:
        page.evaluate("window.scrollBy(0, 600)")


def _parse_visible_reviews(page, reviews: dict) -> None:
    """
    Парсит все видимые отзывы со страницы и добавляет в словарь reviews.
    Ключ — уникальный ID отзыва (из атрибутов DOM или генерируем хеш).
    """
    import hashlib

    # Получаем HTML страницы и парсим через BeautifulSoup если доступен,
    # иначе используем Playwright locators
    try:
        from bs4 import BeautifulSoup
        html = page.content()
        soup = BeautifulSoup(html, "html.parser")
        _parse_with_soup(soup, reviews)
    except ImportError:
        _parse_with_playwright(page, reviews)


def _parse_with_soup(soup, reviews: dict) -> None:
    """Парсит отзывы через BeautifulSoup — более надёжный метод."""
    import hashlib

    # Яндекс.Карты меняют классы, поэтому ищем по паттерну
    # Типичная структура: li[class*="review-view"] или div[class*="review"]
    review_candidates = (
        soup.find_all(attrs={"class": lambda c: c and "review-view" in " ".join(c)})
        or soup.find_all(attrs={"class": lambda c: c and "business-review" in " ".join(c)})
        or soup.find_all("li", attrs={"class": lambda c: c and "review" in " ".join(c)})
    )

    for el in review_candidates:
        # --- Текст отзыва ---
        text_el = (
            el.find(attrs={"class": lambda c: c and "review-view__body-text" in " ".join(c)})
            or el.find(attrs={"class": lambda c: c and "business-review-view__body-text" in " ".join(c)})
            or el.find(attrs={"class": lambda c: c and "review__text" in " ".join(c)})
        )
        quote = (text_el.get_text(strip=True) if text_el else "").strip()
        if not quote:
            continue

        # --- Автор ---
        author_el = (
            el.find(attrs={"class": lambda c: c and "review-view__author" in " ".join(c)})
            or el.find(attrs={"class": lambda c: c and "business-review-view__author" in " ".join(c)})
            or el.find(attrs={"class": lambda c: c and "user-icon-view__name" in " ".join(c)})
        )
        author_name = (author_el.get_text(strip=True) if author_el else "Аноним").strip() or "Аноним"

        # --- Ссылка на автора ---
        author_link_el = el.find("a", attrs={"class": lambda c: c and "user-icon-view" in " ".join(c)})
        author_url = ""
        if author_link_el and author_link_el.get("href"):
            href = author_link_el["href"]
            if href.startswith("http"):
                author_url = href
            else:
                author_url = "https://yandex.ru" + href

        # --- Рейтинг ---
        rating = None
        # Вариант 1: aria-label="5 из 5"
        rating_el = el.find(attrs={"aria-label": True, "class": lambda c: c and "rating" in " ".join(c or [])})
        if rating_el:
            label = rating_el.get("aria-label", "")
            try:
                rating = int(label.split()[0])
            except (ValueError, IndexError):
                pass
        # Вариант 2: считаем звёзды span[class*="star_full"] или icon_full
        if rating is None:
            stars = el.find_all(attrs={"class": lambda c: c and (
                "star_full" in " ".join(c)
                or "icon_full" in " ".join(c)
                or "_star_full" in " ".join(c)
            )})
            if stars:
                rating = min(len(stars), 5)
        # Вариант 3: data-rating атрибут
        if rating is None:
            for tag in el.find_all(True):
                dr = tag.get("data-rating") or tag.get("data-rate")
                if dr:
                    try:
                        rating = int(float(dr))
                        break
                    except (ValueError, TypeError):
                        pass

        # --- ID отзыва (уникальный ключ) ---
        review_id = None
        for tag in el.find_all(True):
            for attr in ("data-review-id", "data-id", "id"):
                val = tag.get(attr, "")
                if val and ("review" in val.lower() or val.isdigit()):
                    review_id = val
                    break
            if review_id:
                break
        if not review_id:
            # Генерируем стабильный хеш из текста + автора
            review_id = "hash_" + hashlib.md5(
                (quote[:200] + author_name).encode("utf-8")
            ).hexdigest()[:16]

        if review_id not in reviews:
            reviews[review_id] = {
                "yandex_review_id": review_id,
                "quote": quote,
                "author_name": author_name,
                "yandex_author_url": author_url,
                "rating": rating,
            }


def _parse_with_playwright(page, reviews: dict) -> None:
    """Запасной парсер через Playwright locators (без BeautifulSoup)."""
    import hashlib

    # Пробуем разные селекторы
    selectors = [
        "[class*='review-view']",
        "[class*='business-review-view']",
        "li[class*='review']",
    ]
    items = []
    for sel in selectors:
        loc = page.locator(sel)
        cnt = loc.count()
        if cnt > 0:
            items = [loc.nth(i) for i in range(cnt)]
            break

    for item in items:
        # Текст
        quote = ""
        for text_sel in [
            "[class*='review-view__body-text']",
            "[class*='business-review-view__body-text']",
            "[class*='review__text']",
        ]:
            t = item.locator(text_sel)
            if t.count() > 0:
                quote = (t.first.inner_text() or "").strip()
                break
        if not quote:
            continue

        # Автор
        author_name = "Аноним"
        for a_sel in ["[class*='review-view__author']", "[class*='user-icon-view__name']"]:
            a = item.locator(a_sel)
            if a.count() > 0:
                author_name = (a.first.inner_text() or "Аноним").strip() or "Аноним"
                break

        review_id = "hash_" + hashlib.md5(
            (quote[:200] + author_name).encode("utf-8")
        ).hexdigest()[:16]

        if review_id not in reviews:
            reviews[review_id] = {
                "yandex_review_id": review_id,
                "quote": quote,
                "author_name": author_name,
                "yandex_author_url": "",
                "rating": None,
            }


# ---------------------------------------------------------------------------
# Upsert helpers
# ---------------------------------------------------------------------------

def upsert_reviews(
    parsed: list[dict],
    no_unpublish: bool,
    dry_run: bool,
    log_cb=None,
) -> tuple[int, int, int]:
    """Сохраняет результаты парсинга в БД. Возвращает (created, updated, unpublished)."""
    from projects.models import Testimonial

    def log(msg: str):
        logger.info(msg)
        if log_cb:
            log_cb(msg)

    fetched_ids: set[str] = set()
    created = updated = skipped = 0

    for data in parsed:
        rid = data["yandex_review_id"]
        fetched_ids.add(rid)

        if dry_run:
            exists = Testimonial.objects.filter(yandex_review_id=rid).exists()
            log(f"  [dry-run] {'update' if exists else 'create'} id={rid!r} author={data['author_name']!r}")
            if exists:
                updated += 1
            else:
                created += 1
            continue

        obj, is_new = Testimonial.objects.get_or_create(
            yandex_review_id=rid,
            defaults={
                **data,
                "source": Testimonial.Source.YANDEX,
                "published": True,
            },
        )

        if is_new:
            created += 1
        else:
            changed = False
            for field in ("quote", "author_name", "yandex_author_url", "rating"):
                if getattr(obj, field) != data[field]:
                    setattr(obj, field, data[field])
                    changed = True
            if not obj.published:
                obj.published = True
                changed = True
            if changed:
                obj.save(update_fields=["quote", "author_name", "yandex_author_url", "rating", "published", "updated_at"])
                updated += 1
            else:
                skipped += 1

    unpublished = 0
    if not no_unpublish and not dry_run and fetched_ids:
        stale_qs = Testimonial.objects.filter(
            source=Testimonial.Source.YANDEX,
            published=True,
        ).exclude(yandex_review_id__in=fetched_ids)
        unpublished = stale_qs.count()
        if unpublished:
            stale_qs.update(published=False)
            log(f"Снято с публикации (исчезли с Яндекса): {unpublished}")

    return created, updated, unpublished


# ---------------------------------------------------------------------------
# Management command
# ---------------------------------------------------------------------------

class Command(BaseCommand):
    help = (
        "Парсит отзывы с Яндекс.Карт через Playwright и сохраняет в БД (source=yandex).\n"
        "Требует: pip install playwright && playwright install chromium"
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--org-id",
            dest="org_id",
            default="",
            help="ID организации на Яндекс.Картах.",
        )
        parser.add_argument(
            "--max-reviews",
            type=int,
            default=DEFAULT_MAX_REVIEWS,
            help=f"Максимум отзывов за запуск (по умолчанию {DEFAULT_MAX_REVIEWS}).",
        )
        parser.add_argument(
            "--headless",
            action="store_true",
            help="Запустить браузер в headless-режиме (без GUI). При капче упадёт с ошибкой.",
        )
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Только показать, что было бы сделано, без записи в БД.",
        )
        parser.add_argument(
            "--no-unpublish",
            action="store_true",
            help="Не снимать с публикации отзывы, которых больше нет на Яндексе.",
        )
        parser.add_argument(
            "--log-id",
            type=int,
            default=None,
            dest="log_id",
            help="ID записи YandexSyncLog для записи прогресса (используется при запуске из админки).",
        )

    def handle(self, *args, **options):
        from projects.models import TestimonialsSettings, YandexSyncLog

        # Если кто-то запускает команду из async-контекста (например, из ASGI),
        # Django запретит синхронный ORM. Самый надёжный путь — перезапустить
        # команду как отдельный процесс.
        if _in_async_context() and os.environ.get("YANDEX_ASYNC_REEXEC") != "1":
            env = dict(os.environ)
            env["YANDEX_ASYNC_REEXEC"] = "1"
            raise SystemExit(subprocess.call([sys.executable, *sys.argv], env=env))

        org_id = (options["org_id"] or "").strip()
        if not org_id:
            cfg = TestimonialsSettings.objects.first()
            if cfg:
                org_id = (cfg.yandex_org_id or "").strip()
        if not org_id:
            org_id = _get_org_id_from_env()
        if not org_id:
            raise CommandError(
                "ID организации не задан. Укажите --org-id, "
                "заполните поле «ID организации на Яндекс.Картах» в настройках отзывов, "
                "или задайте переменную окружения YANDEX_MAPS_ORG_ID."
            )

        max_reviews: int = max(1, options["max_reviews"])
        headless: bool = options["headless"]
        dry_run: bool = options["dry_run"]
        no_unpublish: bool = options["no_unpublish"]
        log_id: int | None = options["log_id"]

        sync_log: YandexSyncLog | None = None
        if log_id:
            try:
                sync_log = YandexSyncLog.objects.get(pk=log_id)
            except YandexSyncLog.DoesNotExist:
                pass

        def log_cb(msg: str):
            self.stdout.write(msg)
            if sync_log:
                # Если вдруг команда оказалась в async-контексте, ORM нельзя
                # вызывать напрямую. Пишем лог через thread, чтобы не падать.
                if _in_async_context():
                    from asgiref.sync import async_to_sync, sync_to_async

                    async_to_sync(sync_to_async(sync_log.append_log, thread_sensitive=True))(msg)
                else:
                    sync_log.append_log(msg)

        log_cb(
            f"Запуск sync_yandex_reviews: org_id={org_id}, max={max_reviews}, "
            f"headless={headless}, dry_run={dry_run}"
        )

        # Если просили не-headless, но DISPLAY нет — попробуем xvfb-run.
        _reexec_with_xvfb_if_needed(headless=headless, log=log_cb)
        if os.environ.get("YANDEX_FORCE_HEADLESS_FALLBACK") == "1":
            headless = True

        try:
            parsed = scrape_reviews(
                org_id=org_id,
                max_reviews=max_reviews,
                headless=headless,
                log_cb=log_cb,
            )

            if not parsed:
                msg = "Отзывов не найдено — проверьте org_id и доступность страницы."
                log_cb(msg)
                if sync_log:
                    sync_log.status = YandexSyncLog.Status.FAILED
                    sync_log.finished_at = timezone.now()
                    sync_log.save(update_fields=["status", "finished_at", "log"])
                self.stdout.write(self.style.WARNING(msg))
                return

            created, updated, unpublished = upsert_reviews(
                parsed=parsed,
                no_unpublish=no_unpublish,
                dry_run=dry_run,
                log_cb=log_cb,
            )

            result_msg = (
                f"Готово: создано={created}, обновлено={updated}, "
                f"снято с публикации={unpublished}."
            )
            log_cb(result_msg)

            if sync_log:
                sync_log.status = YandexSyncLog.Status.SUCCESS
                sync_log.created = created
                sync_log.updated = updated
                sync_log.unpublished = unpublished
                sync_log.finished_at = timezone.now()
                sync_log.save(update_fields=["status", "created", "updated", "unpublished", "finished_at", "log"])

            self.stdout.write(self.style.SUCCESS(result_msg))

        except CommandError:
            raise
        except Exception as exc:
            err_msg = f"Неожиданная ошибка: {exc}"
            logger.exception(err_msg)
            if sync_log:
                sync_log.append_log(err_msg)
                sync_log.status = YandexSyncLog.Status.FAILED
                sync_log.finished_at = timezone.now()
                sync_log.save(update_fields=["status", "finished_at", "log"])
            raise CommandError(err_msg) from exc
