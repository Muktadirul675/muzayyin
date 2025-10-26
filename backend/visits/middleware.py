# visits/middleware.py

import time
from django.utils.timezone import now
from django.conf import settings
from visits.models import Visit
from django.core.cache import cache

class VisitMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)

        if request.method != 'GET':
            return response

        session_key = request.session.session_key
        if not session_key:
            request.session.save()
            session_key = request.session.session_key
        path = request.path
        if path.startswith('/admin') or path.startswith('/static'):
            return response

        # Log visit
        source = request.GET.get('source', 'organic')
        if path == '/':
            Visit.objects.create(path=path, session_key=session_key, source=source)
        elif path.startswith('/products/'):
            try:
                product_id = int(path.strip('/').split('/')[-1])
                Visit.objects.create(path=path, session_key=session_key, source=source, product_id=product_id)
            except:
                pass

        # Realtime active users: store in Redis
        cache.set(f'active_user:{session_key}', int(time.time()), timeout=120)

        return response