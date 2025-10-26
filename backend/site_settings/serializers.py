from rest_framework import serializers
from .models import SiteSetting

class SiteSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteSetting
        fields = ['id', 'key', 'value']
        read_only_fields = ['id']