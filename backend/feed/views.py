from django.core.cache import cache
from rest_framework.decorators import action
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

from .models import FeedSection
from .serializers import FeedSectionSerializer

class FeedSectionViewSet(viewsets.ModelViewSet):
    queryset = FeedSection.objects.filter(is_active=True)
    serializer_class = FeedSectionSerializer
    permission_classes = [AllowAny]
    pagination_class = None

    def list(self, request, *args, **kwargs):
        cache_key = 'feed_sections_cache'
        cached_data = cache.get(cache_key)

        if cached_data:
            return Response(cached_data)

        # If not cached, fetch and serialize
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        data = serializer.data

        # Cache the result (e.g. for 5 minutes)
        cache.set(cache_key, data, timeout=60 * 5)

        return Response(data)

    @action(detail=False, methods=['post'])
    def build(self, request):
        data = request.data
        if not isinstance(data, list):
            return Response({"success": False, "message": "Expected a list of sections"}, status=status.HTTP_400_BAD_REQUEST)

        # Delete all existing and clear cache
        FeedSection.objects.all().delete()
        cache.delete('feed_sections_cache')

        created_sections = []
        for index, section_data in enumerate(data):
            section_data['position'] = index + 1
            serializer = self.get_serializer(data=section_data)
            if serializer.is_valid():
                serializer.save()
                created_sections.append(serializer.data)
            else:
                return Response({
                    "success": False,
                    "message": f"Invalid data in section at index {index}",
                    "errors": serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)

        return Response({
            "success": True,
            "message": "Feed sections built successfully",
            "data": created_sections
        }, status=status.HTTP_201_CREATED)