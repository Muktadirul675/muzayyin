from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver
from orders.models import Order
from .utils import create_sale_from_order, mark_sale_as_refunded

# Store previous status before saving
@receiver(pre_save, sender=Order)
def cache_old_order_status(sender, instance, **kwargs):
    if instance.pk:
        try:
            old_instance = Order.objects.get(pk=instance.pk)
            instance._old_status = old_instance.status
        except Order.DoesNotExist:
            instance._old_status = None

# After saving, compare old vs new status
@receiver(post_save, sender=Order)
def handle_order_status_change(sender, instance, created, **kwargs):
    if created:
        return  # No status change on creation

    old_status = getattr(instance, '_old_status', None)
    new_status = instance.status

    # States that indicate payment or delivery completed
    delivered_states = ['delivered', 'partially_delivered', 'partially_returned', 'paid_returned']
    refund_states = ['returned', 'partially_returned']

    # Create sale if moving into a "first-time deliverable/paid" state
    if new_status in delivered_states and (old_status not in delivered_states):
        create_sale_from_order(instance)

    # Refund logic: Only refund if moving to return state from delivered state
    if new_status in refund_states and old_status in ['delivered', 'partially_delivered']:
        mark_sale_as_refunded(instance)

