from rest_framework import serializers

from .models import Project, ProjectImage, AccordionItem


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
            "created_at",
            "updated_at",
        )


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
