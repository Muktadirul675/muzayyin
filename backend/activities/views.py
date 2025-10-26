# activities/views.py

from rest_framework import generics, filters
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.permissions import IsAdminUser
from .models import Activity
from .serializers import ActivitySerializer
from django_filters import rest_framework as dj_filters


class ActivityFilterSet(dj_filters.FilterSet):
    start_date = dj_filters.DateFilter(field_name="created_at", lookup_expr='gte')
    end_date = dj_filters.DateFilter(field_name="created_at", lookup_expr='lte')

    class Meta:
        model = Activity
        fields = ['start_date', 'end_date', 'action', 'user']


class ActivityListView(generics.ListAPIView):
    queryset = Activity.objects.select_related('user').all()
    serializer_class = ActivitySerializer
    permission_classes = []

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = ActivityFilterSet
    search_fields = ['action', 'message', 'user__username']
    ordering_fields = ['created_at']
    ordering = ['-created_at']