# products/filters.py

import django_filters
from .models import Product

class ProductFilter(django_filters.FilterSet):
    price_min = django_filters.NumberFilter(field_name="price", lookup_expr='gte')
    price_max = django_filters.NumberFilter(field_name="price", lookup_expr='lte')
    stock_min = django_filters.NumberFilter(field_name="stock", lookup_expr='gte')
    stock_max = django_filters.NumberFilter(field_name="stock", lookup_expr='lte')
    created_after = django_filters.DateTimeFilter(field_name="created_at", lookup_expr='gte')
    created_before = django_filters.DateTimeFilter(field_name="created_at", lookup_expr='lte')

    class Meta:
        model = Product
        fields = ['price', 'stock', 'created_at']