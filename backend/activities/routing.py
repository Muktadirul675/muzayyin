# activities/routing.py

from django.urls import re_path
from .consumers import ActivityConsumer

websocket_urlpatterns = [
    re_path(r'ws/activities/', ActivityConsumer.as_asgi()),
]