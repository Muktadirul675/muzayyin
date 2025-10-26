from django.urls import path
from .views import CityListAPIView, ZoneListAPIView, AreaListAPIView, get_delivery_charge, CourierWebhookView

urlpatterns = [
    path('cities/', CityListAPIView.as_view()),
    path('zones/', ZoneListAPIView.as_view()),
    path('areas/', AreaListAPIView.as_view()),
    path("delivery-charge/", get_delivery_charge),
    path('hook/',CourierWebhookView.as_view()),
]