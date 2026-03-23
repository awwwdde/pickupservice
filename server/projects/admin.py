from django.contrib import admin
from django.utils.html import format_html

from .models import (
    Project,
    ProjectImage,
    AccordionItem,
    ServiceGalleryImage,
    BookingRequest,
    ContactSettings,
    Testimonial,
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
    inlines = (ProjectImageInline,)
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
        "order",
        "published",
        "updated_at",
    )
    list_editable = ("order", "published")
    list_filter = ("published", "created_at")
    search_fields = ("quote", "author_name", "car")
    readonly_fields = ("created_at", "updated_at")
    fieldsets = (
        ("Текст отзыва", {"fields": ("quote",)}),
        (
            "Автор и автомобиль",
            {"fields": ("author_name", "car")},
        ),
        (
            "Публикация и порядок",
            {"fields": ("order", "published", "created_at", "updated_at")},
        ),
    )

    def quote_preview(self, obj: Testimonial) -> str:
        text = (obj.quote or "").strip()
        if len(text) <= 80:
            return text
        return text[:77] + "…"

    quote_preview.short_description = "Отзыв"


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

