from rest_framework import serializers

from .models import (
    Project,
    ProjectImage,
    ProjectPreparationStage,
    AccordionItem,
    Novelty,
    ServiceGalleryImage,
    BookingRequest,
    CallbackRequest,
    ContactSettings,
    PrivacyPolicy,
    Testimonial,
    TestimonialsSettings,
)


class ProjectImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectImage
        fields = ("id", "image", "order")


class ProjectListSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(read_only=True)

    class Meta:
        model = Project
        fields = (
            "id",
            "title",
            "image",
            "category",
            "vehicle",
            "order",
        )


class ProjectDetailSerializer(serializers.ModelSerializer):
    gallery = ProjectImageSerializer(many=True, read_only=True)
    preparation_stages = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = (
            "id",
            "title",
            "description",
            "image",
            "category",
            "vehicle",
            "order",
            "published",
            "gallery",
            "preparation_stages",
            "created_at",
            "updated_at",
        )

    def get_preparation_stages(self, obj: Project):
        qs = getattr(obj, "preparation_stages", None)
        items = qs.all() if qs is not None else []
        return ProjectPreparationStageSerializer(items, many=True).data


class ProjectPreparationStageSerializer(serializers.ModelSerializer):
    photo = serializers.ImageField(read_only=True)

    class Meta:
        model = ProjectPreparationStage
        fields = ("id", "title", "text", "photo", "order")


class AccordionItemSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(read_only=True)

    class Meta:
        model = AccordionItem
        fields = (
            "id",
            "title",
            "description",
            "image",
            "order",
        )


class NoveltySerializer(serializers.ModelSerializer):
    image = serializers.ImageField(read_only=True)

    class Meta:
        model = Novelty
        fields = (
            "id",
            "title",
            "description",
            "image",
            "starts_at",
            "ends_at",
            "order",
        )


class ServiceGalleryImageSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(read_only=True)

    class Meta:
        model = ServiceGalleryImage
        fields = ("id", "image", "order")


class ContactSettingsSerializer(serializers.ModelSerializer):
    """Публичное чтение настроек страницы контактов."""

    class Meta:
        model = ContactSettings
        fields = (
            "email",
            "phone_display",
            "phone_tel",
            "telegram_url",
            "whatsapp_url",
            "vk_url",
            "map_embed_url",
            "coordinates_label",
        )


class PrivacyPolicySerializer(serializers.ModelSerializer):
    """Публичное чтение политики конфиденциальности."""

    class Meta:
        model = PrivacyPolicy
        fields = ("title", "content", "updated_at")


class TestimonialSerializer(serializers.ModelSerializer):
    """Публичный список отзывов для главной; имя автора в JSON — `name`."""

    name = serializers.CharField(source="author_name", read_only=True)

    class Meta:
        model = Testimonial
        fields = ("id", "quote", "name", "car", "rating", "source", "yandex_author_url", "order")


class TestimonialsSettingsSerializer(serializers.ModelSerializer):
    """Публичные настройки блока отзывов."""

    class Meta:
        model = TestimonialsSettings
        fields = ("mode", "yandex_widget_url")


class BookingRequestCreateSerializer(serializers.ModelSerializer):
    """Публичная форма записи; поле website — honeypot (должно быть пустым)."""

    website = serializers.CharField(
        required=False,
        allow_blank=True,
        write_only=True,
        max_length=256,
    )

    class Meta:
        model = BookingRequest
        fields = (
            "name",
            "phone",
            "email",
            "brand",
            "model",
            "service",
            "message",
            "website",
        )

    def validate_website(self, value: str) -> str:
        if value and value.strip():
            raise serializers.ValidationError("Некорректный запрос.")
        return value

    def validate_phone(self, value: str) -> str:
        s = (value or "").strip()
        if len(s) < 5:
            raise serializers.ValidationError(
                "Укажите корректный номер телефона."
            )
        return s

    def validate_service(self, value: str) -> str:
        s = (value or "").strip()
        if not s:
            raise serializers.ValidationError("Выберите услугу.")
        return s

    def create(self, validated_data: dict) -> BookingRequest:
        validated_data.pop("website", None)
        return super().create(validated_data)


class CallbackRequestCreateSerializer(serializers.ModelSerializer):
    """Публичная форма «заявка на звонок»; поле website — honeypot (должно быть пустым)."""

    website = serializers.CharField(
        required=False,
        allow_blank=True,
        write_only=True,
        max_length=256,
    )

    class Meta:
        model = CallbackRequest
        fields = (
            "name",
            "phone",
            "website",
        )

    def validate_website(self, value: str) -> str:
        if value and value.strip():
            raise serializers.ValidationError("Некорректный запрос.")
        return value

    def validate_phone(self, value: str) -> str:
        s = (value or "").strip()
        if len(s) < 5:
            raise serializers.ValidationError("Укажите корректный номер телефона.")
        return s

    def create(self, validated_data: dict) -> CallbackRequest:
        validated_data.pop("website", None)
        return super().create(validated_data)
