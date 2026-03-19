from rest_framework import viewsets, mixins

from .models import Project, AccordionItem
from .serializers import (
    ProjectListSerializer,
    ProjectDetailSerializer,
    AccordionItemSerializer,
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

