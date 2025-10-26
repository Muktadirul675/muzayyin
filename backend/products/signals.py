from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .models import Product
from .serializers import ProductListSerializer
from enum import Enum
from activities.utils import log_activity

def prefix_product_event(event):
    return f"product.{event}"

class ProductAction(str, Enum):
    update = prefix_product_event('update')
    create = prefix_product_event('create')
    delete = prefix_product_event('delete')

@receiver(post_save, sender=Product)
def product_saved(sender, instance, created, **kwargs):
    # Auto-toggle is_active based on stock
    if instance.stock == 0 and instance.is_active:
        instance.is_active = False
        instance.save(update_fields=['is_active'])
    # elif instance.stock > 0 and not instance.is_active:
    #     instance.is_active = True
    #     instance.save(update_fields=['is_active'])
    channel_layer = get_channel_layer()
    action = ProductAction.create if created else ProductAction.update
    data = {
        "type": "send_product_update",
        "data": {
            "type": "product",
            "action": action,
            "data": ProductListSerializer(instance).data
        }
    }
    async_to_sync(channel_layer.group_send)("products", data)

@receiver(post_delete, sender=Product)
def product_deleted(sender, instance, **kwargs):
    channel_layer = get_channel_layer()
    data = {
        "type": "send_product_update",
        "data": {
            "type": "product",
            "action": ProductAction.delete,
            "data": {"id": instance.id}
        }
    }
    async_to_sync(channel_layer.group_send)("products", data)