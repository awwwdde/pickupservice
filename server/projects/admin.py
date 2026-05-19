import subprocess
import sys
import os
import shutil

from django.contrib import admin
from django.contrib import messages
from django.http import HttpResponseRedirect
from django.urls import path, reverse
from django.utils.html import format_html

from .models import (
    Project,
    ProjectImage,
    ProjectPreparationStage,
    AccordionItem,
    Novelty,
    ServiceGalleryImage,
    BookingRequest,
    CallbackRequest,
    TelegramOutboxMessage,
    ContactSettings,
    PrivacyPolicy,
    Testimonial,
    TestimonialsSettings,
    YandexSyncLog,
)


@admin.register(ProjectImage)
class ProjectImageAdmin(admin.ModelAdmin):
    list_display = ("id", "preview", "order", "created_at")
    list_editable = ("order",)
    readonly_fields = ("preview",)
    ordering = ("order", "id")

    def preview(self, obj: ProjectImage) -> str:
        if not obj.image:
            return ""
        return format_html(
            '<img src="{}" style="max-height: 80px; max-width: 120px; object-fit: cover;" />',
            obj.image.url,
        )

    preview.short_description = "Превью"


class ProjectImageInline(admin.TabularInline):
    model = Project.gallery.through
    extra = 1
    verbose_name = "Фото"
    verbose_name_plural = "Галерея"


class ProjectPreparationStageInline(admin.TabularInline):
    model = ProjectPreparationStage
    extra = 1
    fields = ("order", "title", "text", "photo")
    ordering = ("order", "id")
    verbose_name = "Этап подготовки"
    verbose_name_plural = "Этапы подготовки"


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = (
        "thumbnail",
        "title",
        "category",
        "vehicle",
        "order",
        "published",
        "created_at",
    )
    list_editable = ("order", "published")
    list_filter = ("category", "published", "created_at")
    search_fields = ("title", "description", "vehicle")
    inlines = (ProjectPreparationStageInline, ProjectImageInline)
    readonly_fields = ("thumbnail", "created_at", "updated_at")
    fieldsets = (
        (
            "Основная информация",
            {
                "fields": (
                    "title",
                    "vehicle",
                    "category",
                    "description",
                    "image",
                    "thumbnail",
                )
            },
        ),
        (
            "Публикация и порядок",
            {"fields": ("order", "published", "created_at", "updated_at")},
        ),
        ("Этапы подготовки", {"fields": ()}),
        ("Галерея", {"fields": ()}),
    )

    def thumbnail(self, obj: Project) -> str:
        if not obj.image:
            return ""
        return format_html(
            '<img src="{}" style="max-height: 80px; max-width: 140px; object-fit: cover;" />',
            obj.image.url,
        )

    thumbnail.short_description = "Обложка"


@admin.register(AccordionItem)
class AccordionItemAdmin(admin.ModelAdmin):
    list_display = ("thumbnail", "title", "order", "published", "created_at")
    list_editable = ("order", "published")
    list_filter = ("published", "created_at")
    search_fields = ("title", "description")
    readonly_fields = ("thumbnail", "created_at", "updated_at")
    fieldsets = (
        (
            "Контент",
            {
                "fields": (
                    "title",
                    "description",
                    "image",
                    "thumbnail",
                )
            },
        ),
        (
            "Публикация и порядок",
            {"fields": ("order", "published", "created_at", "updated_at")},
        ),
    )

    def thumbnail(self, obj: AccordionItem) -> str:
        if not obj.image:
            return ""
        return format_html(
            '<img src="{}" style="max-height: 80px; max-width: 140px; object-fit: cover;" />',
            obj.image.url,
        )

    thumbnail.short_description = "Фото"


@admin.register(Novelty)
class NoveltyAdmin(admin.ModelAdmin):
    list_display = (
        "thumbnail",
        "title",
        "starts_at",
        "ends_at",
        "order",
        "published",
        "created_at",
    )
    list_editable = ("order", "published")
    list_filter = ("published", "starts_at", "ends_at")
    search_fields = ("title", "description")
    readonly_fields = ("thumbnail", "created_at", "updated_at")
    fieldsets = (
        (
            "Контент",
            {
                "fields": (
                    "title",
                    "description",
                    "image",
                    "thumbnail",
                )
            },
        ),
        (
            "Период предложения",
            {"fields": ("starts_at", "ends_at")},
        ),
        (
            "Публикация и порядок",
            {"fields": ("order", "published", "created_at", "updated_at")},
        ),
    )

    def thumbnail(self, obj: Novelty) -> str:
        if not obj.image:
            return ""
        return format_html(
            '<img src="{}" style="max-height: 80px; max-width: 140px; object-fit: cover;" />',
            obj.image.url,
        )

    thumbnail.short_description = "Фото"


@admin.register(ServiceGalleryImage)
class ServiceGalleryImageAdmin(admin.ModelAdmin):
    list_display = ("thumbnail", "order", "published", "created_at")
    list_editable = ("order", "published")
    list_filter = ("published", "created_at")
    readonly_fields = ("thumbnail", "created_at", "updated_at")
    fieldsets = (
        (
            "Контент",
            {"fields": ("image", "thumbnail")},
        ),
        (
            "Публикация и порядок",
            {"fields": ("order", "published", "created_at", "updated_at")},
        ),
    )

    def thumbnail(self, obj: ServiceGalleryImage) -> str:
        if not obj.image:
            return ""
        return format_html(
            '<img src="{}" style="max-height: 80px; max-width: 140px; object-fit: cover;" />',
            obj.image.url,
        )

    thumbnail.short_description = "Фото"


@admin.register(Testimonial)
class TestimonialAdmin(admin.ModelAdmin):
    list_display = (
        "quote_preview",
        "author_name",
        "car",
        "source",
        "rating",
        "order",
        "published",
        "updated_at",
    )
    list_editable = ("order", "published")
    list_filter = ("source", "published", "rating", "created_at")
    search_fields = ("quote", "author_name", "car", "yandex_review_id")
    readonly_fields = ("source", "yandex_review_id", "yandex_author_url", "created_at", "updated_at")
    fieldsets = (
        ("Текст отзыва", {"fields": ("quote",)}),
        (
            "Автор и автомобиль",
            {"fields": ("author_name", "car", "rating")},
        ),
        (
            "Источник",
            {
                "fields": ("source", "yandex_review_id", "yandex_author_url"),
                "description": (
                    "Поля «Источник», «ID отзыва на Яндексе» и «Ссылка на автора» "
                    "заполняются автоматически при синхронизации с Яндекс.Картами. "
                    "Для отзывов, добавленных вручную, источник всегда «Из админки»."
                ),
            },
        ),
        (
            "Публикация и порядок",
            {"fields": ("order", "published", "created_at", "updated_at")},
        ),
    )

    def get_readonly_fields(self, request, obj=None):
        # При создании нового отзыва через админку source/yandex-поля не нужны
        if obj is None:
            return ("source", "yandex_review_id", "yandex_author_url", "created_at", "updated_at")
        return super().get_readonly_fields(request, obj)

    def quote_preview(self, obj: Testimonial) -> str:
        text = (obj.quote or "").strip()
        if len(text) <= 80:
            return text
        return text[:77] + "…"

    quote_preview.short_description = "Отзыв"


@admin.register(TestimonialsSettings)
class TestimonialsSettingsAdmin(admin.ModelAdmin):
    list_display = ("__str__", "mode", "yandex_org_id", "sync_button_list", "updated_at")
    readonly_fields = ("updated_at", "sync_button_detail", "last_sync_status")
    fieldsets = (
        (
            "Режим отображения",
            {
                "fields": ("mode",),
                "description": (
                    "<b>admin_only</b> — показывать только отзывы, добавленные вручную.<br>"
                    "<b>yandex_only</b> — показывать только отзывы с Яндекс.Карт.<br>"
                    "<b>mixed</b> — сначала яндексовые, затем ручные."
                ),
            },
        ),
        (
            "Яндекс.Карты",
            {
                "fields": ("yandex_widget_url", "yandex_org_id", "updated_at"),
                "description": (
                    "Укажите <b>ID организации</b> — числовое значение из URL страницы "
                    "организации на Яндекс.Картах (например: <code>123456789</code>)."
                ),
            },
        ),
        (
            "Синхронизация с Яндекс.Картами",
            {
                "fields": ("sync_button_detail", "last_sync_status"),
                "description": (
                    "Нажмите кнопку, чтобы запустить парсер отзывов. "
                    "Браузер откроется на сервере — при необходимости нужно пройти капчу. "
                    "Статус выполнения и лог доступны в разделе "
                    "«<a href=\"../yandexsynclog/\">Логи синхронизации</a>»."
                ),
            },
        ),
    )

    def get_urls(self):
        urls = super().get_urls()
        custom = [
            path(
                "<int:pk>/sync/",
                self.admin_site.admin_view(self._trigger_sync),
                name="projects_testimonialsettings_sync",
            ),
        ]
        return custom + urls

    # --- Кнопка в списке ---
    def sync_button_list(self, obj: TestimonialsSettings):
        if not obj.yandex_org_id:
            return "—"
        url = reverse("admin:projects_testimonialsettings_sync", args=[obj.pk])
        return format_html(
            '<a class="button" href="{}" style="'
            'display:inline-block;padding:4px 12px;background:#417690;'
            'color:#fff;border-radius:4px;text-decoration:none;font-size:12px;'
            'white-space:nowrap">▶ Синхронизировать</a>',
            url,
        )

    sync_button_list.short_description = "Синхронизация"
    sync_button_list.allow_tags = True

    # --- Кнопка в форме редактирования ---
    def sync_button_detail(self, obj: TestimonialsSettings):
        if not obj or not obj.pk:
            return "Сначала сохраните запись."
        if not obj.yandex_org_id:
            return "Заполните поле «ID организации на Яндекс.Картах»."
        url = reverse("admin:projects_testimonialsettings_sync", args=[obj.pk])
        return format_html(
            '<a class="button" href="{}" style="'
            'display:inline-block;padding:6px 18px;background:#417690;'
            'color:#fff;border-radius:4px;text-decoration:none;font-weight:bold">'
            '▶ Запустить синхронизацию с Яндекс.Картами</a>',
            url,
        )

    sync_button_detail.short_description = "Запуск"

    # --- Последний статус ---
    def last_sync_status(self, obj: TestimonialsSettings):
        last = YandexSyncLog.objects.filter(org_id=obj.yandex_org_id).first()
        if not last:
            return "Синхронизация ещё не запускалась."
        status_colors = {
            "running": "#f0ad4e",
            "success": "#5cb85c",
            "failed": "#d9534f",
        }
        color = status_colors.get(last.status, "#999")
        log_url = reverse("admin:projects_yandexsynclog_change", args=[last.pk])
        return format_html(
            '<span style="color:{}">{}</span> — {} '
            '(+{} создано, +{} обновлено) '
            '&nbsp;<a href="{}">посмотреть лог</a>',
            color,
            last.get_status_display(),
            last.started_at.strftime("%d.%m.%Y %H:%M"),
            last.created,
            last.updated,
            log_url,
        )

    last_sync_status.short_description = "Последняя синхронизация"

    # --- View для запуска ---
    def _trigger_sync(self, request, pk: int):
        from django.utils import timezone

        try:
            settings_obj = TestimonialsSettings.objects.get(pk=pk)
        except TestimonialsSettings.DoesNotExist:
            messages.error(request, "Настройки не найдены.")
            return HttpResponseRedirect(reverse("admin:projects_testimonialsettings_changelist"))

        if not settings_obj.yandex_org_id:
            messages.error(request, "Укажите ID организации на Яндекс.Картах перед запуском.")
            return HttpResponseRedirect(
                reverse("admin:projects_testimonialsettings_change", args=[pk])
            )

        # Проверяем, нет ли уже запущенной синхронизации
        running = YandexSyncLog.objects.filter(
            org_id=settings_obj.yandex_org_id,
            status=YandexSyncLog.Status.RUNNING,
        ).first()
        if running:
            messages.warning(
                request,
                format_html(
                    "Синхронизация уже выполняется (запущена в {}). "
                    '<a href="{}">Посмотреть лог</a>',
                    running.started_at.strftime("%H:%M:%S"),
                    reverse("admin:projects_yandexsynclog_change", args=[running.pk]),
                ),
            )
            return HttpResponseRedirect(
                reverse("admin:projects_testimonialsettings_change", args=[pk])
            )

        # Создаём запись лога
        sync_log = YandexSyncLog.objects.create(
            org_id=settings_obj.yandex_org_id,
            status=YandexSyncLog.Status.RUNNING,
        )

        # Запускаем management command в фоне
        base_cmd = [
            _get_venv_python(),
            "manage.py",
            "sync_yandex_reviews",
            "--org-id", settings_obj.yandex_org_id,
            "--max-reviews", "50",
            "--only-new",
            "--log-id", str(sync_log.pk),
        ]
        # На сервере без DISPLAY пытаемся запускать под xvfb-run, чтобы
        # браузер мог работать в non-headless режиме.
        if os.name != "nt" and not os.environ.get("DISPLAY"):
            xvfb = shutil.which("xvfb-run")
            if xvfb:
                cmd = [xvfb, "-a", *base_cmd]
            else:
                cmd = base_cmd
        else:
            cmd = base_cmd
        try:
            subprocess.Popen(
                cmd,
                cwd=_get_manage_py_dir(),
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                close_fds=True,
            )
            messages.success(
                request,
                format_html(
                    "Синхронизация запущена в фоне. "
                    '<a href="{}">Посмотреть лог (обновите страницу через минуту)</a>',
                    reverse("admin:projects_yandexsynclog_change", args=[sync_log.pk]),
                ),
            )
        except Exception as exc:
            sync_log.status = YandexSyncLog.Status.FAILED
            sync_log.log = str(exc)
            sync_log.finished_at = timezone.now()
            sync_log.save(update_fields=["status", "log", "finished_at"])
            messages.error(request, f"Не удалось запустить процесс: {exc}")

        return HttpResponseRedirect(
            reverse("admin:projects_testimonialsettings_change", args=[pk])
        )

    def has_add_permission(self, request):
        return not TestimonialsSettings.objects.exists()

    def has_delete_permission(self, request, obj=None):
        return request.user.is_superuser


def _get_manage_py_dir() -> str:
    """Возвращает директорию, в которой лежит manage.py."""
    import os
    from django.conf import settings as dj_settings
    # BASE_DIR из settings.py — это server/
    return str(dj_settings.BASE_DIR)


def _get_venv_python() -> str:
    """
    Возвращает python из venv (server/venv/bin/python) если он существует,
    иначе — текущий sys.executable.
    """
    base_dir = _get_manage_py_dir()
    venv_python = os.path.join(base_dir, "venv", "bin", "python")
    return venv_python if os.path.exists(venv_python) else sys.executable


@admin.register(YandexSyncLog)
class YandexSyncLogAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "org_id",
        "status_badge",
        "created",
        "updated",
        "unpublished",
        "started_at",
        "finished_at",
        "duration",
    )
    list_filter = ("status", "org_id", "started_at")
    readonly_fields = (
        "org_id",
        "status",
        "created",
        "updated",
        "unpublished",
        "started_at",
        "finished_at",
        "duration",
        "log_formatted",
    )
    fieldsets = (
        (
            "Результат",
            {
                "fields": (
                    "org_id",
                    "status",
                    "created",
                    "updated",
                    "unpublished",
                    "started_at",
                    "finished_at",
                    "duration",
                )
            },
        ),
        (
            "Лог",
            {"fields": ("log_formatted",), "classes": ("collapse",)},
        ),
    )

    def status_badge(self, obj: YandexSyncLog) -> str:
        colors = {"running": "#f0ad4e", "success": "#5cb85c", "failed": "#d9534f"}
        color = colors.get(obj.status, "#999")
        return format_html(
            '<span style="color:{};font-weight:bold">{}</span>',
            color,
            obj.get_status_display(),
        )

    status_badge.short_description = "Статус"

    def duration(self, obj: YandexSyncLog) -> str:
        if not obj.finished_at:
            return "—"
        delta = obj.finished_at - obj.started_at
        secs = int(delta.total_seconds())
        return f"{secs // 60}м {secs % 60}с"

    duration.short_description = "Длительность"

    def log_formatted(self, obj: YandexSyncLog) -> str:
        if not obj.log:
            return "—"
        return format_html(
            '<pre style="white-space:pre-wrap;font-size:12px;max-height:400px;'
            'overflow:auto;background:#f8f8f8;padding:8px;border:1px solid #ddd">{}</pre>',
            obj.log,
        )

    log_formatted.short_description = "Полный лог"

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return True

    def has_delete_permission(self, request, obj=None):
        return request.user.is_superuser


@admin.register(PrivacyPolicy)
class PrivacyPolicyAdmin(admin.ModelAdmin):
    list_display = ("title", "updated_at")
    readonly_fields = ("updated_at",)
    fields = ("title", "content", "updated_at")

    def has_add_permission(self, request):
        return not PrivacyPolicy.objects.exists()

    def has_delete_permission(self, request, obj=None):
        return request.user.is_superuser


@admin.register(ContactSettings)
class ContactSettingsAdmin(admin.ModelAdmin):
    list_display = ("__str__", "email", "phone_display", "updated_at")
    readonly_fields = ("updated_at",)

    fieldsets = (
        (
            "Контакты",
            {
                "fields": (
                    "email",
                    "phone_display",
                    "phone_tel",
                )
            },
        ),
        (
            "Соцсети",
            {
                "fields": (
                    "telegram_url",
                    "whatsapp_url",
                    "vk_url",
                )
            },
        ),
        (
            "Карта",
            {
                "fields": (
                    "map_embed_url",
                    "coordinates_label",
                    "updated_at",
                )
            },
        ),
    )

    def has_add_permission(self, request):
        return not ContactSettings.objects.exists()

    def has_delete_permission(self, request, obj=None):
        return request.user.is_superuser


@admin.register(BookingRequest)
class BookingRequestAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "phone",
        "email",
        "service",
        "email_sent",
        "created_at",
    )
    list_filter = ("email_sent", "created_at")
    search_fields = ("name", "email", "phone", "brand", "model")
    readonly_fields = (
        "name",
        "phone",
        "email",
        "brand",
        "model",
        "service",
        "message",
        "created_at",
        "email_sent",
        "email_error",
    )
    ordering = ("-created_at",)

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return True

    def has_delete_permission(self, request, obj=None):
        return request.user.is_superuser


@admin.register(CallbackRequest)
class CallbackRequestAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "phone",
        "email_sent",
        "created_at",
    )
    list_filter = ("email_sent", "created_at")
    search_fields = ("name", "phone")
    readonly_fields = (
        "name",
        "phone",
        "created_at",
        "email_sent",
        "email_error",
    )
    ordering = ("-created_at",)

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return True

    def has_delete_permission(self, request, obj=None):
        return request.user.is_superuser


@admin.register(TelegramOutboxMessage)
class TelegramOutboxMessageAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "request_type",
        "status",
        "target_chat_id",
        "attempts",
        "created_at",
        "sent_at",
    )
    list_filter = ("request_type", "status", "created_at", "sent_at")
    search_fields = ("message_text", "last_error", "target_chat_id")
    readonly_fields = (
        "request_type",
        "booking_request",
        "callback_request",
        "target_chat_id",
        "message_text",
        "status",
        "attempts",
        "last_error",
        "created_at",
        "sent_at",
    )
    ordering = ("-created_at",)

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return True

    def has_delete_permission(self, request, obj=None):
        return request.user.is_superuser

