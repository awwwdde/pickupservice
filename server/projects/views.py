import logging

from django.conf import settings
from django.core.mail import send_mail
from django.db import transaction
from rest_framework import status, viewsets, mixins
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import (
    Project,
    AccordionItem,
    ServiceGalleryImage,
    ContactSettings,
    Testimonial,
    TestimonialsSettings,
    BookingRequest,
    CallbackRequest,
    TelegramOutboxMessage,
)
from .serializers import (
    ProjectListSerializer,
    ProjectDetailSerializer,
    AccordionItemSerializer,
    ServiceGalleryImageSerializer,
    BookingRequestCreateSerializer,
    CallbackRequestCreateSerializer,
    ContactSettingsSerializer,
    TestimonialSerializer,
    TestimonialsSettingsSerializer,
)

logger = logging.getLogger(__name__)


def _telegram_notify_targets() -> list[int]:
    explicit = getattr(settings, "TELEGRAM_NOTIFY_CHAT_IDS", None) or []
    if explicit:
        return list(dict.fromkeys(explicit))
    fallback = (
        (getattr(settings, "TELEGRAM_WHITELIST_CHAT_IDS", None) or [])
        + (getattr(settings, "TELEGRAM_WHITELIST_USER_IDS", None) or [])
    )
    return list(dict.fromkeys(fallback))


def _enqueue_telegram_outbox_for_booking(obj: BookingRequest) -> None:
    targets = _telegram_notify_targets()
    if not targets:
        return
    text = "\n".join(
        [
            "Новая заявка: Запись",
            f"ID: {obj.id}",
            f"Создано: {obj.created_at:%Y-%m-%d %H:%M}",
            "",
            f"Имя: {obj.name}",
            f"Телефон: {obj.phone}",
            f"Почта: {obj.email}",
            f"Марка: {obj.brand}",
            f"Модель и год: {obj.model}",
            f"Услуга: {obj.service}",
            "",
            "Сообщение:",
            (obj.message or "—"),
        ]
    )
    TelegramOutboxMessage.objects.bulk_create(
        [
            TelegramOutboxMessage(
                request_type=TelegramOutboxMessage.RequestType.BOOKING,
                booking_request=obj,
                target_chat_id=chat_id,
                message_text=text,
            )
            for chat_id in targets
        ]
    )


def _enqueue_telegram_outbox_for_callback(obj: CallbackRequest) -> None:
    targets = _telegram_notify_targets()
    if not targets:
        return
    text = "\n".join(
        [
            "Новая заявка: Звонок",
            f"ID: {obj.id}",
            f"Создано: {obj.created_at:%Y-%m-%d %H:%M}",
            "",
            f"Имя: {obj.name}",
            f"Телефон: {obj.phone}",
        ]
    )
    TelegramOutboxMessage.objects.bulk_create(
        [
            TelegramOutboxMessage(
                request_type=TelegramOutboxMessage.RequestType.CALLBACK,
                callback_request=obj,
                target_chat_id=chat_id,
                message_text=text,
            )
            for chat_id in targets
        ]
    )


class ProjectViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    queryset = (
        Project.objects.filter(published=True)
        .select_related()
        .prefetch_related("gallery")
        .order_by("order", "-created_at")
    )

    def get_serializer_class(self):
        if self.action == "retrieve":
            return ProjectDetailSerializer
        return ProjectListSerializer


class AccordionItemViewSet(
    mixins.ListModelMixin,
    viewsets.GenericViewSet,
):
    queryset = AccordionItem.objects.filter(published=True).order_by(
        "order", "-created_at"
    )
    serializer_class = AccordionItemSerializer

    # отключаем пагинацию только для этого списка, чтобы вернуть простой массив
    pagination_class = None


class ServiceGalleryImageViewSet(
    mixins.ListModelMixin,
    viewsets.GenericViewSet,
):
    queryset = ServiceGalleryImage.objects.filter(published=True).order_by(
        "order", "-created_at"
    )
    serializer_class = ServiceGalleryImageSerializer
    pagination_class = None


class TestimonialViewSet(
    mixins.ListModelMixin,
    viewsets.GenericViewSet,
):
    """
    GET /api/projects/testimonials/
    Возвращает отзывы согласно режиму в TestimonialsSettings:
      - admin_only  → только source=admin
      - yandex_only → только source=yandex
      - mixed       → сначала yandex, затем admin (оба списка по order/created_at)
    Дополнительные поля ответа: settings (mode, yandex_widget_url).
    """

    serializer_class = TestimonialSerializer
    pagination_class = None
    authentication_classes: list = []
    permission_classes = [AllowAny]

    def _get_settings(self) -> TestimonialsSettings:
        obj = TestimonialsSettings.objects.first()
        if obj is None:
            obj = TestimonialsSettings()
        return obj

    def get_queryset(self):
        cfg = self._get_settings()
        base = Testimonial.objects.filter(published=True)
        if cfg.mode == TestimonialsSettings.Mode.ADMIN_ONLY:
            return base.filter(source=Testimonial.Source.ADMIN).order_by("order", "-created_at")
        if cfg.mode == TestimonialsSettings.Mode.YANDEX_ONLY:
            return base.filter(source=Testimonial.Source.YANDEX).order_by("order", "-created_at")
        # mixed: yandex first, then admin — сортируем внутри каждой группы
        from itertools import chain
        yandex_qs = list(
            base.filter(source=Testimonial.Source.YANDEX).order_by("order", "-created_at")
        )
        admin_qs = list(
            base.filter(source=Testimonial.Source.ADMIN).order_by("order", "-created_at")
        )
        # возвращаем chain как queryset не выйдет, зато list будет сериализован в list()
        return list(chain(yandex_qs, admin_qs))

    def list(self, request, *args, **kwargs):
        cfg = self._get_settings()
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        settings_serializer = TestimonialsSettingsSerializer(cfg)
        return Response({
            "settings": settings_serializer.data,
            "results": serializer.data,
        })


class TestimonialsSettingsView(APIView):
    """
    GET /api/projects/testimonials/settings/
    Возвращает только настройки блока отзывов (mode, yandex_widget_url).
    """

    authentication_classes: list = []
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        obj = TestimonialsSettings.objects.first()
        if obj is None:
            obj = TestimonialsSettings()
        serializer = TestimonialsSettingsSerializer(obj)
        return Response(serializer.data)


class ContactSettingsView(APIView):
    authentication_classes: list = []
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        instance = ContactSettings.objects.first()
        if instance is None:
            return Response(
                {"detail": "Настройки контактов не заданы."},
                status=status.HTTP_404_NOT_FOUND,
            )
        serializer = ContactSettingsSerializer(instance)
        return Response(serializer.data)


class BookingRequestView(APIView):
    authentication_classes: list = []
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = BookingRequestCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        instance = serializer.save()
        try:
            transaction.on_commit(
                lambda: _enqueue_telegram_outbox_for_booking(instance)
            )
        except Exception:
            logger.exception(
                "Не удалось поставить booking-заявку %s в telegram outbox",
                instance.pk,
            )
        to_email = settings.BOOKING_TO_EMAIL
        email_delivered = False
        if not to_email:
            instance.email_error = "BOOKING_TO_EMAIL не задан"
            instance.save(update_fields=["email_error"])
        else:
            try:
                send_mail(
                    subject=f"Новая заявка с сайта: {instance.name}",
                    message=self._email_body(instance),
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[to_email],
                    fail_silently=False,
                )
                instance.email_sent = True
                instance.save(update_fields=["email_sent"])
                email_delivered = True
            except Exception as exc:
                logger.exception("Не удалось отправить письмо по заявке %s", instance.pk)
                err = str(exc)[:500]
                instance.email_error = err
                instance.save(update_fields=["email_error"])
        return Response(
            {
                "id": instance.id,
                "status": "created",
                "email_delivered": email_delivered,
            },
            status=status.HTTP_201_CREATED,
        )

    def _email_body(self, obj) -> str:
        lines = [
            f"Имя: {obj.name}",
            f"Телефон: {obj.phone}",
            f"Почта: {obj.email}",
            f"Марка: {obj.brand}",
            f"Модель и год: {obj.model}",
            f"Услуга: {obj.service}",
            "",
            "Сообщение:",
            obj.message or "—",
        ]
        return "\n".join(lines)


class CallbackRequestView(APIView):
    authentication_classes: list = []
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = CallbackRequestCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        instance: CallbackRequest = serializer.save()
        try:
            transaction.on_commit(
                lambda: _enqueue_telegram_outbox_for_callback(instance)
            )
        except Exception:
            logger.exception(
                "Не удалось поставить callback-заявку %s в telegram outbox",
                instance.pk,
            )
        to_email = settings.BOOKING_TO_EMAIL
        email_delivered = False
        if not to_email:
            instance.email_error = "BOOKING_TO_EMAIL не задан"
            instance.save(update_fields=["email_error"])
        else:
            try:
                send_mail(
                    subject=f"Новая заявка на звонок: {instance.name}",
                    message=self._email_body(instance),
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[to_email],
                    fail_silently=False,
                )
                instance.email_sent = True
                instance.save(update_fields=["email_sent"])
                email_delivered = True
            except Exception as exc:
                logger.exception(
                    "Не удалось отправить письмо по callback-заявке %s",
                    instance.pk,
                )
                err = str(exc)[:500]
                instance.email_error = err
                instance.save(update_fields=["email_error"])
        return Response(
            {
                "id": instance.id,
                "status": "created",
                "email_delivered": email_delivered,
            },
            status=status.HTTP_201_CREATED,
        )

    def _email_body(self, obj: CallbackRequest) -> str:
        lines = [
            f"Имя: {obj.name}",
            f"Телефон: {obj.phone}",
        ]
        return "\n".join(lines)

