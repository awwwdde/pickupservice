import logging

from django.conf import settings
from django.core.mail import send_mail
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
)
from .serializers import (
    ProjectListSerializer,
    ProjectDetailSerializer,
    AccordionItemSerializer,
    ServiceGalleryImageSerializer,
    BookingRequestCreateSerializer,
    ContactSettingsSerializer,
    TestimonialSerializer,
)

logger = logging.getLogger(__name__)


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
    queryset = Testimonial.objects.filter(published=True).order_by(
        "order", "-created_at"
    )
    serializer_class = TestimonialSerializer
    pagination_class = None
    authentication_classes: list = []
    permission_classes = [AllowAny]


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

