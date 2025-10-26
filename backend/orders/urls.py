from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import OrderViewSet
from django.urls import path
from .views import ReadyForCourierListView

router = DefaultRouter()
router.register('', OrderViewSet, basename='orders')

urlpatterns = [
    path('ready-for-courier/', ReadyForCourierListView.as_view(), name='ready-for-courier-list'),
]
urlpatterns += [
    path('', include(router.urls)),
]
