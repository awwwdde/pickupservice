from rest_framework.routers import DefaultRouter

from .views import ProjectViewSet, AccordionItemViewSet


router = DefaultRouter()
router.register("", ProjectViewSet, basename="project")
router.register("accordion", AccordionItemViewSet, basename="accordion-item")

urlpatterns = router.urls

