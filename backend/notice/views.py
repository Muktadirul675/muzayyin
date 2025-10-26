from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from .models import Notice
from .serializers import NoticeSerializer

class NoticeViewSet(viewsets.ModelViewSet):
    queryset = Notice.objects.all().order_by('-created_at')
    serializer_class = NoticeSerializer
    permission_classes = [AllowAny]  # You can change this to IsAuthenticated or custom
    pagination_class = None