from rest_framework import serializers
from .models import UploadedImage

class UploadedImageSerializer(serializers.ModelSerializer):
    image = serializers.ImageField()
    alt_text = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = UploadedImage
        fields = ['id', 'image', 'alt_text', 'uploaded_at']
        read_only_fields = ['id', 'uploaded_at']