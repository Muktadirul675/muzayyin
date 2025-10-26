# backend/asgi.py
import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
import products.routing # where websocket routes are
import orders.routing
import activities.routing

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(
            products.routing.websocket_urlpatterns +
            orders.routing.websocket_urlpatterns +
            activities.routing.websocket_urlpatterns
        )
    ),
})