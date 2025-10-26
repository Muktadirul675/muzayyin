# activities/utils.py

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.contrib.contenttypes.models import ContentType
from .models import Activity


def log_activity(user, action: str, message: str, instance=None):
    # Check if user is authenticated, else store as None
    actual_user = user if user and user.is_authenticated else None

    # Content type for related object (if any)
    content_type = ContentType.objects.get_for_model(instance) if instance else None
    object_id = instance.id if instance else None

    # Create the activity record
    activity = Activity.objects.create(
        user=actual_user,
        action=action,
        message=message,
        content_type=content_type,
        object_id=object_id,
    )

    # WebSocket broadcasting
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        "activity_logs",
        {
            "type": "activity_log",
            "data": {
                "id": activity.id,
                "user": str(activity.user) if activity.user else "Anonymous",
                "action": activity.action,
                "message": activity.message,
                "created_at": str(activity.created_at),
            }
        }
    )