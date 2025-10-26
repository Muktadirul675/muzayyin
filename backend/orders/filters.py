# orders/filters.py

import django_filters
from .models import Order

class OrderFilter(django_filters.FilterSet):
    created_after = django_filters.DateTimeFilter(field_name="created_at", lookup_expr='gte')
    created_before = django_filters.DateTimeFilter(field_name="created_at", lookup_expr='lte')
    discount_min = django_filters.NumberFilter(field_name="order_discount", lookup_expr='gte')
    discount_max = django_filters.NumberFilter(field_name="order_discount", lookup_expr='lte')

    class Meta:
        model = Order
        fields = ['full_name', 'phone', 'status']