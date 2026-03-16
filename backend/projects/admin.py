from django.contrib import admin
from django.utils.html import format_html

from .models import Project, ProjectImage, AccordionItem


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

