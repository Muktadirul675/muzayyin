from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils.timezone import now
from django.db.models import Count
from .models import Visit
from .utils import get_client_ip
from django.core.cache import cache
import time
from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils.timezone import now
from .models import Visit
from django.db.models import Count
from site_settings.utils import get_setting

class VisitOriginsView(APIView):
    def get(self, request):
        today = now().date()
        data = (
            Visit.objects
            .filter(visited_at=today)
            .values('source')
            .annotate(count=Count('id'))
        )

        return Response({
            "date": str(today),
            "origins": {entry['source']: entry['count'] for entry in data}
        })
    
class ActiveUsersView(APIView):
    def get(self, request):
        ip = get_client_ip(request)
        key = f"active_user:{ip}"
        cache.set(key, int(time.time()), timeout=180)

        keys = cache.keys("active_user:*")
        active_count = len(keys)

        return Response({
            "ip": ip,
            "active_users": active_count
        })


class VisitView(APIView):
    def post(self, request):
        ip = get_client_ip(request)
        path = request.data.get('path', '/')
        source = request.data.get('source', 'organic')
        today = now().date()

        source_key = f'origin:{ip}'
        source_timeout_days = get_setting('track_origin')
        source_timeout_seconds = int(source_timeout_days) * (3600*24)

        if not cache.get(source_key):
            cache.set(source_key, source, timeout=source_timeout_seconds)

        already_visited = Visit.objects.filter(ip_address=ip, visited_at=today, path=path, source=source).exists()
        if not already_visited:
            Visit.objects.create(ip_address=ip, path=path, source=source)

        return Response({'message': 'Visit tracked'}, status=200)


class TodaysVisitStatsView(APIView):
    def get(self, request):
        today = now().date()
        visits_today = Visit.objects.filter(visited_at=today)

        total = visits_today.count()

        top_path = visits_today.values('path') \
            .annotate(count=Count('id')) \
            .order_by('-count') \
            .first()

        return Response({
            "date": today,
            "total_visits": total,
            "most_visited_page": {
                "path": top_path['path'] if top_path else None,
                "visits": top_path['count'] if top_path else 0
            }
        })