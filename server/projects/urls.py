from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (
    ProjectViewSet,
    AccordionItemViewSet,
    ServiceGalleryImageViewSet,
    TestimonialViewSet,
    ContactSettingsView,
    BookingRequestView,
)


router = DefaultRouter()
router.register("", ProjectViewSet, basename="project")
router.register("accordion", AccordionItemViewSet, basename="accordion-item")
router.register(
    "service-gallery",
    ServiceGalleryImageViewSet,
    basename="service-gallery",
)

urlpatterns = [
    path("contact/", ContactSettingsView.as_view(), name="contact-settings"),
    path("booking/", BookingRequestView.as_view(), name="booking-request"),
    # до router: иначе ProjectViewSet с префиксом "" перехватит "testimonials" как pk проекта
    path(
        "testimonials/",
        TestimonialViewSet.as_view({"get": "list"}),
        name="testimonial-list",
    ),
] + router.urls

