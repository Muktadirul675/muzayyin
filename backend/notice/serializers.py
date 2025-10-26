from rest_framework import serializers
from .models import Notice

class NoticeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notice
        fields = ['id', 'text', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']