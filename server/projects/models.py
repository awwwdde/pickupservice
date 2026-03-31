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


class ProjectPreparationStage(models.Model):
    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name="preparation_stages",
        verbose_name="Проект",
    )
    title = models.CharField("Заголовок", max_length=255)
    text = models.TextField("Текст")
    photo = models.ImageField(
        "Фото (необязательно)",
        upload_to="projects/preparation-stages/",
        blank=True,
        null=True,
    )
    order = models.PositiveIntegerField("Порядок отображения", default=0)
    created_at = models.DateTimeField("Создан", auto_now_add=True)
    updated_at = models.DateTimeField("Обновлён", auto_now=True)

    class Meta:
        ordering = ["order", "id"]
        verbose_name = "Этап подготовки (проекта)"
        verbose_name_plural = "Этапы подготовки (проекта)"

    def __str__(self) -> str:
        return f"{self.project_id}: {self.title}"


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


class CallbackRequest(models.Model):
    name = models.CharField("Имя", max_length=255)
    phone = models.CharField("Телефон", max_length=64)
    created_at = models.DateTimeField("Создана", auto_now_add=True)
    email_sent = models.BooleanField("Письмо отправлено", default=False)
    email_error = models.TextField("Ошибка отправки почты", blank=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Заявка на звонок"
        verbose_name_plural = "Заявки на звонок"

    def __str__(self) -> str:
        return f"{self.name} — {self.created_at:%Y-%m-%d %H:%M}"


class TelegramOutboxMessage(models.Model):
    class RequestType(models.TextChoices):
        BOOKING = "booking", "Заявка «Запись»"
        CALLBACK = "callback", "Заявка «Звонок»"

    class Status(models.TextChoices):
        PENDING = "pending", "Ожидает отправки"
        SENT = "sent", "Отправлено"
        FAILED = "failed", "Ошибка"

    request_type = models.CharField(
        "Тип заявки",
        max_length=32,
        choices=RequestType.choices,
    )
    booking_request = models.ForeignKey(
        "BookingRequest",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="telegram_outbox_messages",
        verbose_name="Заявка «Запись»",
    )
    callback_request = models.ForeignKey(
        "CallbackRequest",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="telegram_outbox_messages",
        verbose_name="Заявка «Звонок»",
    )
    target_chat_id = models.BigIntegerField("Куда отправить (chat_id)")
    message_text = models.TextField("Текст сообщения")
    status = models.CharField(
        "Статус",
        max_length=16,
        choices=Status.choices,
        default=Status.PENDING,
    )
    attempts = models.PositiveIntegerField("Попыток", default=0)
    last_error = models.TextField("Последняя ошибка", blank=True)
    created_at = models.DateTimeField("Создано", auto_now_add=True)
    sent_at = models.DateTimeField("Отправлено", null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Outbox: Telegram сообщение"
        verbose_name_plural = "Outbox: Telegram сообщения"
        indexes = [
            models.Index(fields=["status", "-created_at"]),
            models.Index(fields=["request_type", "-created_at"]),
            models.Index(fields=["target_chat_id", "-created_at"]),
        ]

    def clean(self):
        # Делаем модель самопроверяющейся: ровно одна FK должна быть выставлена
        # в зависимости от request_type. (Проверка на уровне кода; в БД оставляем мягко.)
        from django.core.exceptions import ValidationError

        if self.request_type == self.RequestType.BOOKING and not self.booking_request_id:
            raise ValidationError({"booking_request": "Обязательна для request_type=booking"})
        if self.request_type == self.RequestType.CALLBACK and not self.callback_request_id:
            raise ValidationError({"callback_request": "Обязательна для request_type=callback"})



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

    class Source(models.TextChoices):
        ADMIN = "admin", "Из админки"
        YANDEX = "yandex", "Яндекс.Карты"

    quote = models.TextField("Текст отзыва")
    author_name = models.CharField("Имя", max_length=255)
    car = models.CharField("Автомобиль", max_length=255, blank=True)
    rating = models.PositiveSmallIntegerField(
        "Рейтинг (1–5)", null=True, blank=True
    )
    source = models.CharField(
        "Источник",
        max_length=16,
        choices=Source.choices,
        default=Source.ADMIN,
        db_index=True,
    )
    yandex_review_id = models.CharField(
        "ID отзыва на Яндексе",
        max_length=255,
        blank=True,
        db_index=True,
        help_text="Заполняется автоматически при синхронизации с Яндекс.Картами.",
    )
    yandex_author_url = models.URLField(
        "Ссылка на автора (Яндекс)", blank=True
    )
    order = models.PositiveIntegerField("Порядок отображения", default=0)
    published = models.BooleanField("Опубликован", default=True)
    created_at = models.DateTimeField("Создан", auto_now_add=True)
    updated_at = models.DateTimeField("Обновлён", auto_now=True)

    class Meta:
        ordering = ["order", "-created_at"]
        verbose_name = "Отзыв на главной"
        verbose_name_plural = "Отзывы на главной"
        constraints = [
            models.UniqueConstraint(
                fields=["yandex_review_id"],
                condition=models.Q(yandex_review_id__gt=""),
                name="unique_nonempty_yandex_review_id",
            )
        ]

    def __str__(self) -> str:
        return f"{self.author_name} — {self.car or '—'}"


class YandexSyncLog(models.Model):
    """Лог одного запуска синхронизации отзывов с Яндекс.Карт."""

    class Status(models.TextChoices):
        RUNNING = "running", "Выполняется"
        SUCCESS = "success", "Успешно"
        FAILED = "failed", "Ошибка"

    status = models.CharField(
        "Статус",
        max_length=16,
        choices=Status.choices,
        default=Status.RUNNING,
        db_index=True,
    )
    org_id = models.CharField("ID организации", max_length=64)
    created = models.IntegerField("Создано", default=0)
    updated = models.IntegerField("Обновлено", default=0)
    unpublished = models.IntegerField("Снято с публикации", default=0)
    log = models.TextField("Лог", blank=True)
    started_at = models.DateTimeField("Запущено", auto_now_add=True)
    finished_at = models.DateTimeField("Завершено", null=True, blank=True)

    class Meta:
        ordering = ["-started_at"]
        verbose_name = "Лог синхронизации (Яндекс)"
        verbose_name_plural = "Логи синхронизации (Яндекс)"

    def __str__(self) -> str:
        return f"Sync {self.org_id} — {self.started_at:%Y-%m-%d %H:%M} [{self.get_status_display()}]"

    def append_log(self, line: str) -> None:
        self.log = (self.log + "\n" + line).lstrip("\n")
        self.save(update_fields=["log"])


class TestimonialsSettings(models.Model):
    """Синглтон: режим отображения отзывов и ссылка на виджет Яндекс.Карт."""

    class Mode(models.TextChoices):
        ADMIN_ONLY = "admin_only", "Только из админки"
        YANDEX_ONLY = "yandex_only", "Только Яндекс.Карты"
        MIXED = "mixed", "Смешанный (сначала с Яндекса, потом из админки)"

    mode = models.CharField(
        "Режим отображения отзывов",
        max_length=16,
        choices=Mode.choices,
        default=Mode.ADMIN_ONLY,
    )
    yandex_widget_url = models.URLField(
        "Ссылка «Все отзывы» (Яндекс.Карты)",
        blank=True,
        help_text=(
            "Вставьте URL страницы организации на Яндекс.Картах "
            "(например https://yandex.ru/maps/org/…/reviews/). "
            "Отображается на фронте как кнопка «Все отзывы»."
        ),
    )
    yandex_org_id = models.CharField(
        "ID организации на Яндекс.Картах",
        max_length=64,
        blank=True,
        help_text=(
            "Числовой ID из URL организации на картах. "
            "Используется командой manage.py sync_yandex_reviews для автоматической "
            "загрузки отзывов."
        ),
    )
    updated_at = models.DateTimeField("Обновлено", auto_now=True)

    class Meta:
        verbose_name = "Настройки отзывов"
        verbose_name_plural = "Настройки отзывов"

    def __str__(self) -> str:
        return f"Настройки отзывов ({self.get_mode_display()})"

