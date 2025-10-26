from django.db import transaction
from .models import Order, ReadyForCourier
from courier.pathao_client import get_pathao_client
from django.db import transaction
from .models import Order, ReadyForCourier
from courier.pathao_client import get_pathao_client
from django.conf import settings
import random
from site_settings.utils import get_setting

NEGATIVE_STATUSES = ['cancelled', 'returned', 'failed']
CONFIRM_STATUS = 'confirmed'
DELIVERY_TYPE = 48
ITEM_TYPE = '2'
STORE_ID = settings.PATHAO_STORE_ID # Or fetch from settings if dynamic

def is_order_ready(order):
    if order.status == CONFIRM_STATUS:
        # return (
        #     order.full_name and order.shipping_address and order.phone
        #     and order.city_id and order.zone_id
        #     and order.items.exists()
        # )
        return True
    return False

def send_order_to_courier(order_id):
    client = get_pathao_client()
    consignment_id = None
    with transaction.atomic():
        try:
            order = Order.objects.select_for_update().get(pk=order_id)
        except Order.DoesNotExist:
            return {
                "success": False,
                "message": "Order not found.",
                "order_id": order_id
            }

        if order.sent_to_courier:
            return {
                "success": True,
                "already_sent": True,
                "order_id": order_id,
                "consignment_id": order.c_id
            }
        if not is_order_ready(order):
            return{
                "success": False,
                "message": "Order isn't ready for courier.",
                "order_id": order_id
            }
        try:
            courier_response = client.create_order(
                order_id=str(order.id),
                recipient_name=order.full_name,
                recipient_phone=order.phone,
                recipient_address=order.shipping_address,
                special_instruction=order.note if hasattr(order, 'note') else 'None',
                item_quantity=str(sum(item.quantity for item in order.items.all())),
                amount_to_collect=float(order.total_price),
                item_description='None'
            )
            consignment_id = courier_response.get('data').get("consignment_id")
            # consignment_id = str(random.randint(1000,5000))
            # pass
        except Exception as e:
            return {
                "success": False,
                "message": f"Courier API error: {str(e)}",
                "order_id": order_id
            }

        if consignment_id:
            order.sent_to_courier = True
            order.c_id = consignment_id
            order.status = 'processing'
            order.save(update_fields=['sent_to_courier', 'c_id','status'])

            ReadyForCourier.objects.filter(order=order).delete()

            return {
                "success": True,
                "already_sent": False,
                "order_id": order_id,
                "consignment_id": consignment_id
            }
        return {
            "success":False,
            "order_id": order_id,
            "message":"Consignment ID not found"
        }

def get_stock_action(old_status: str, new_status: str, has_item_changes: bool = False) -> str:
    """
    Decide stock action based on status transition or item change.

    Returns: "increase", "decrease", or "none"
    """
    was_negative = old_status in NEGATIVE_STATUSES
    is_negative = new_status in NEGATIVE_STATUSES

    if has_item_changes:
        if is_negative:
            return 'none'
        return 'decrease'

    if not was_negative and is_negative:
        return 'increase'
    elif was_negative and not is_negative:
        return 'decrease'

    return 'none'

def adjust_stock(items, action: str):
    """
    Adjust stock for items based on action: 'increase' or 'decrease'
    """
    for item in items:
        product = item.product
        variant = item.variant
        color = item.color
        qty = item.quantity

        if action == 'increase':
            product.stock += qty
            if variant:
                variant.stock += qty
            if color:
                color.stock += qty
        elif action == 'decrease':
            product.stock = max(product.stock - qty, 0)
            if variant:
                variant.stock = max(variant.stock - qty, 0)
            if color:
                color.stock = max(color.stock - qty, 0)

        product.save()
        if variant:
            variant.save()
        if color:
            color.save()