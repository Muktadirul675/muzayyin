from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from .models import Order
from .utils import is_order_ready
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .models import Order, OrderItem
from .serializers import OrderSerializer
from enum import Enum
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import Order, OrderItem, ReadyForCourier

NEGATIVE_STATUSES = [
    'pending',
    'cancelled', 
    'returned', 
    'hold',
    'failed',
    'partially_returned',
    'partially_delivered',
    'paid_returned',    
]

POSITIVE_STATUSES = [
    'confirmed',
    'processing',
    'shipped',
    'delivered',
]

@receiver([post_save, post_delete], sender=OrderItem)
@receiver(post_save, sender=Order)
def manage_ready_for_courier(sender, instance, **kwargs):
    order = instance.order if isinstance(instance, OrderItem) else instance
    ready = is_order_ready(order)

    if ready:
        ReadyForCourier.objects.get_or_create(order=order)
    else:
        ReadyForCourier.objects.filter(order=order).delete()

def prefix_order_event(event):
    return f"order.{event}"

class OrderAction(str, Enum):
    update = prefix_order_event('update')
    create = prefix_order_event('create')
    delete = prefix_order_event('delete')

@receiver(post_save, sender=Order)
def order_saved(sender, instance, created, **kwargs):
    print("ORDER SAVED")
    channel_layer = get_channel_layer()
    action = OrderAction.create if created else OrderAction.update
    data = {
        "type": "send_order_update",
        "data": {
            "type": "order",
            "action": action,
            "data": OrderSerializer(instance).data
        }
    }
    async_to_sync(channel_layer.group_send)("orders", data)


@receiver(post_delete, sender=Order)
def order_deleted(sender, instance, **kwargs):
    channel_layer = get_channel_layer()
    data = {
        "type": "send_order_update",
        "data": {
            "type": "order",
            "action": OrderAction.delete,
            "data": {"id": instance.id}
        }
    }
    async_to_sync(channel_layer.group_send)("orders", data)

def reduce_stock(item):
    item.product.stock -= item.quantity
    item.product.save(update_fields=["stock"])

    if item.variant:
        item.variant.stock -= item.quantity
        item.variant.save(update_fields=["stock"])

    if item.color:
        item.color.stock -= item.quantity
        item.color.save(update_fields=["stock"])


def increase_stock(item):
    item.product.stock += item.quantity
    item.product.save(update_fields=["stock"])

    if item.variant:
        item.variant.stock += item.quantity
        item.variant.save(update_fields=["stock"])

    if item.color:
        item.color.stock += item.quantity
        item.color.save(update_fields=["stock"])

@receiver(post_save, sender=OrderItem)
def reduce_stock_on_item_create(sender, instance, created, **kwargs):
    order = instance.order
    if created and order.status in POSITIVE_STATUSES:
        reduce_stock(instance)

@receiver(post_delete, sender=OrderItem)
def return_stock_on_item_delete(sender, instance, **kwargs):
    order = instance.order
    if order.status not in ['delivered'] and order.status in POSITIVE_STATUSES:
        increase_stock(instance)

@receiver(pre_save, sender=Order)
def capture_old_status(sender, instance, **kwargs):
    if instance.pk:
        old = Order.objects.get(pk=instance.pk)
        instance.old_status = old.status
    else:
        instance.old_status = None

@receiver(post_save, sender=Order)
def adjust_stock_on_status_change(sender, instance, created, **kwargs):
    if created:
        return  # already handled by OrderItem creation

    old = instance.old_status
    new = instance.status
    if old != new:
        if old in NEGATIVE_STATUSES and new in POSITIVE_STATUSES:
            # Stock is consumed for all order items
            for item in instance.items.all():
                reduce_stock(item)

        elif old in POSITIVE_STATUSES and new in NEGATIVE_STATUSES:
            # Stock is returned for all order items
            for item in instance.items.all():
                increase_stock(item)
