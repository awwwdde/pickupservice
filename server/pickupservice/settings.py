from pathlib import Path
import os

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY", "dev-secret-key-change-me")

# Прод: DJANGO_DEBUG=0 или false; локально по умолчанию включён
DEBUG = os.environ.get("DJANGO_DEBUG", "true").lower() in ("1", "true", "yes")

_hosts = os.environ.get("DJANGO_ALLOWED_HOSTS", "").strip()
if _hosts:
    ALLOWED_HOSTS = [h.strip() for h in _hosts.split(",") if h.strip()]
else:
    ALLOWED_HOSTS = ["*"]

_csrf_origins = os.environ.get("CSRF_TRUSTED_ORIGINS", "").strip()
CSRF_TRUSTED_ORIGINS = [
    o.strip() for o in _csrf_origins.split(",") if o.strip()
]

if os.environ.get("DJANGO_BEHIND_PROXY", "").lower() in ("1", "true", "yes"):
    SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
    USE_X_FORWARDED_HOST = True

if not DEBUG:
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    # Third-party
    "rest_framework",
    "corsheaders",
    "django_filters",
    # Local
    "projects",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "pickupservice.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "pickupservice.wsgi.application"

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]

LANGUAGE_CODE = "ru-ru"

TIME_ZONE = "Europe/Moscow"

USE_I18N = True

USE_TZ = True

STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "static"

MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# CORS — базовый список + опционально CORS_ALLOWED_ORIGINS (через запятую)
_cors_extra = os.environ.get("CORS_ALLOWED_ORIGINS", "").strip()
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
if _cors_extra:
    CORS_ALLOWED_ORIGINS.extend(
        o.strip() for o in _cors_extra.split(",") if o.strip()
    )

# Почта: в деве без SMTP — вывод в консоль
_email_host = os.environ.get("EMAIL_HOST", "").strip()
if _email_host:
    EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
    EMAIL_HOST = _email_host
    EMAIL_PORT = int(os.environ.get("EMAIL_PORT", "587"))
    EMAIL_HOST_USER = os.environ.get("EMAIL_HOST_USER", "")
    EMAIL_HOST_PASSWORD = os.environ.get("EMAIL_HOST_PASSWORD", "")
    EMAIL_USE_TLS = os.environ.get("EMAIL_USE_TLS", "1") not in ("0", "false", "False")
else:
    EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"

DEFAULT_FROM_EMAIL = os.environ.get(
    "DEFAULT_FROM_EMAIL", "noreply@pickupservice.local"
)
BOOKING_TO_EMAIL = os.environ.get("BOOKING_TO_EMAIL", "").strip()

# Яндекс.Карты — ID организации для sync_yandex_reviews
YANDEX_MAPS_ORG_ID = os.environ.get("YANDEX_MAPS_ORG_ID", "").strip()


def _parse_int_list(value: str) -> list[int]:
    items = []
    for raw in (value or "").split(","):
        s = raw.strip()
        if not s:
            continue
        try:
            items.append(int(s))
        except ValueError:
            # игнорируем мусорные элементы, чтобы не падать при старте
            continue
    return items


# Telegram bot (токен хранится только в окружении сервиса)
TELEGRAM_BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN", "").strip()
TELEGRAM_WHITELIST_USER_IDS = _parse_int_list(
    os.environ.get("TELEGRAM_WHITELIST_USER_IDS", "")
)
TELEGRAM_WHITELIST_CHAT_IDS = _parse_int_list(
    os.environ.get("TELEGRAM_WHITELIST_CHAT_IDS", "")
)
TELEGRAM_NOTIFY_CHAT_IDS = _parse_int_list(
    os.environ.get("TELEGRAM_NOTIFY_CHAT_IDS", "")
)

# Telegram proxy (актуально для серверов, где api.telegram.org недоступен)
# Формат: http://user:pass@host:port или socks5://user:pass@host:port
# Если указан только TELEGRAM_PROXY_URL, он применяется и к Bot API, и к getUpdates (polling).
TELEGRAM_PROXY_URL = os.environ.get("TELEGRAM_PROXY_URL", "").strip()
TELEGRAM_GET_UPDATES_PROXY_URL = os.environ.get(
    "TELEGRAM_GET_UPDATES_PROXY_URL", ""
).strip()

# DRF
REST_FRAMEWORK = {
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 100,
    "DEFAULT_FILTER_BACKENDS": [
        "django_filters.rest_framework.DjangoFilterBackend",
    ],
}

