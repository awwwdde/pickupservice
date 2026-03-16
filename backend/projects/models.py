from django.db import models


class ProjectImage(models.Model):
    image = models.ImageField(upload_to="projects/gallery/")
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["order", "id"]
        verbose_name = "Фото проекта"
        verbose_name_plural = "Фото проекта"

    def __str__(self) -> str:
        return f"Фото #{self.pk}"


class Project(models.Model):
    class Category(models.TextChoices):
        PREP = "prep", "Подготовка"
        REPAIR = "repair", "Ремонт"
        TUNING = "tuning", "Тюнинг"
        SERVICE = "service", "Обслуживание"

    title = models.CharField("Название проекта", max_length=255)
    description = models.TextField("Описание проекта", blank=True)
    image = models.ImageField("Обложка", upload_to="projects/covers/")
    gallery = models.ManyToManyField(
        ProjectImage,
        related_name="projects",
        blank=True,
        verbose_name="Галерея",
    )
    category = models.CharField(
        "Категория",
        max_length=32,
        choices=Category.choices,
        default=Category.PREP,
    )
    vehicle = models.CharField("Модель автомобиля", max_length=255, blank=True)
    order = models.PositiveIntegerField("Порядок отображения", default=0)
    published = models.BooleanField("Опубликован", default=True)
    created_at = models.DateTimeField("Создан", auto_now_add=True)
    updated_at = models.DateTimeField("Обновлён", auto_now=True)

    class Meta:
        ordering = ["order", "-created_at"]
        verbose_name = "Проект"
        verbose_name_plural = "Проекты"

    def __str__(self) -> str:
        return self.title


class AccordionItem(models.Model):
    title = models.CharField("Заголовок", max_length=255)
    description = models.TextField("Описание", blank=True)
    image = models.ImageField("Фото", upload_to="accordion/items/", blank=True)
    order = models.PositiveIntegerField("Порядок отображения", default=0)
    published = models.BooleanField("Опубликован", default=True)
    created_at = models.DateTimeField("Создан", auto_now_add=True)
    updated_at = models.DateTimeField("Обновлён", auto_now=True)

    class Meta:
        ordering = ["order", "-created_at"]
        verbose_name = "Пункт аккордеона"
        verbose_name_plural = "Пункты аккордеона"

    def __str__(self) -> str:
        return self.title

