# products/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProductViewSet, StockAddView 

router = DefaultRouter()
router.register(r'', ProductViewSet, basename='products')

urlpatterns = [
    path('', include(router.urls)),
    path('stocks/add/', StockAddView.as_view(), name='stock-add'),
]