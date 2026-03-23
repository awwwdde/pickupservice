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


class ServiceGalleryImage(models.Model):
    image = models.ImageField("Фото", upload_to="service/gallery/")
    order = models.PositiveIntegerField("Порядок отображения", default=0)
    published = models.BooleanField("Опубликован", default=True)
    created_at = models.DateTimeField("Создан", auto_now_add=True)
    updated_at = models.DateTimeField("Обновлён", auto_now=True)

    class Meta:
        ordering = ["order", "-created_at"]
        verbose_name = "Фото ленты страницы «Сервис»"
        verbose_name_plural = "Фото ленты страницы «Сервис»"

    def __str__(self) -> str:
        return f"Фото #{self.pk}"


class BookingRequest(models.Model):
    name = models.CharField("Имя", max_length=255)
    phone = models.CharField("Телефон", max_length=64)
    email = models.EmailField("Почта")
    brand = models.CharField("Марка автомобиля", max_length=255)
    model = models.CharField("Модель и год", max_length=255)
    service = models.CharField("Услуга", max_length=255)
    message = models.TextField("Сообщение", blank=True)
    created_at = models.DateTimeField("Создана", auto_now_add=True)
    email_sent = models.BooleanField("Письмо отправлено", default=False)
    email_error = models.TextField("Ошибка отправки почты", blank=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Заявка с сайта"
        verbose_name_plural = "Заявки с сайта"

    def __str__(self) -> str:
        return f"{self.name} — {self.created_at:%Y-%m-%d %H:%M}"


class ContactSettings(models.Model):
    """Единственная запись: контакты и карта для страницы /contact."""

    email = models.EmailField("Почта")
    phone_display = models.CharField(
        "Телефон (отображение)",
        max_length=64,
        help_text='Например: +7 999 000 00 00',
    )
    phone_tel = models.CharField(
        "Телефон для ссылки tel:",
        max_length=32,
        help_text="Без префикса tel:, например +79990000000",
    )
    telegram_url = models.URLField("Telegram", blank=True)
    whatsapp_url = models.URLField("WhatsApp", blank=True)
    vk_url = models.URLField("ВКонтакте", blank=True)
    map_embed_url = models.TextField(
        "URL встраивания карты (iframe src)",
        help_text="Полная ссылка из «Поделиться» → «Встроить карту» (Google, Яндекс и т.д.).",
    )
    coordinates_label = models.CharField(
        "Подпись координат",
        max_length=128,
        blank=True,
    )
    updated_at = models.DateTimeField("Обновлено", auto_now=True)

    class Meta:
        verbose_name = "Контакты на сайте"
        verbose_name_plural = "Контакты на сайте"

    def __str__(self) -> str:
        return "Контакты и карта"


class Testimonial(models.Model):
    """Отзыв клиента для блока на главной странице."""

    quote = models.TextField("Текст отзыва")
    author_name = models.CharField("Имя", max_length=255)
    car = models.CharField("Автомобиль", max_length=255)
    order = models.PositiveIntegerField("Порядок отображения", default=0)
    published = models.BooleanField("Опубликован", default=True)
    created_at = models.DateTimeField("Создан", auto_now_add=True)
    updated_at = models.DateTimeField("Обновлён", auto_now=True)

    class Meta:
        ordering = ["order", "-created_at"]
        verbose_name = "Отзыв на главной"
        verbose_name_plural = "Отзывы на главной"

    def __str__(self) -> str:
        return f"{self.author_name} — {self.car}"

