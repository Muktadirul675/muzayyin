# feed/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FeedSectionViewSet

router = DefaultRouter()
router.register('', FeedSectionViewSet, basename='feed-sections')

urlpatterns = [
    path('', include(router.urls)),
]