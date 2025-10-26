from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from rest_framework import status
from .models import SiteSetting
from .serializers import SiteSettingSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import SiteSetting

class SiteSettingsListView(APIView):
    def get(self, request):
        settings = SiteSetting.objects.all()
        data = {s.key: s.value for s in settings}
        return Response(data)
    
class UpdateSiteSettingView(APIView):
    permission_classes = []

    def post(self, request):
        data = request.data  # { key1: value1, key2: value2 }
        updated = []
        for key, value in data.items():
            try:
                setting = SiteSetting.objects.get(key=key)
                setting.value = value
                setting.save()
                updated.append(key)
            except SiteSetting.DoesNotExist:
                continue  # skip unknown keys

        return Response({
            "message": "Settings updated.",
            "updated_keys": updated
        }, status=status.HTTP_200_OK)