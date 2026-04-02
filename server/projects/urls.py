from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (
    ProjectViewSet,
    AccordionItemViewSet,
    NoveltyViewSet,
    ServiceGalleryImageViewSet,
    TestimonialViewSet,
    TestimonialsSettingsView,
    ContactSettingsView,
    BookingRequestView,
    CallbackRequestView,
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
    path("callback/", CallbackRequestView.as_view(), name="callback-request"),
    # до router: иначе ProjectViewSet с префиксом "" перехватит эти пути как pk проекта
    path(
        "testimonials/",
        TestimonialViewSet.as_view({"get": "list"}),
        name="testimonial-list",
    ),
    path(
        "testimonials/settings/",
        TestimonialsSettingsView.as_view(),
        name="testimonials-settings",
    ),
    # до router: иначе ProjectViewSet с pk перехватит "novinki" как id проекта
    path(
        "novinki/",
        NoveltyViewSet.as_view({"get": "list"}),
        name="novelty-list",
    ),
] + router.urls

