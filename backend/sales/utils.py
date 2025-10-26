from .models import Sale
from orders.models import Order
from decimal import Decimal

def create_sale_from_order(order):
    if Sale.objects.filter(order=order).exists():
        return  # Avoid duplicate
    amount_got = order.collected_amount - order.delivery_charge
    if amount_got > 0:
        total_revenue = Decimal('0')
        total_cost = Decimal('0')

        for item in order.items.all():
            item_total_price = item.price_at_purchase * item.quantity
            item_cost_price = item.product.cost_price * item.quantity  # Assuming cost_price is on Product

            total_revenue += item_total_price
            total_cost += item_cost_price

        # Ensure discount and delivery charge are handled safely
        order_discount = order.order_discount if order.order_discount is not None else Decimal('0')
        delivery_charge = order.delivery_charge if order.delivery_charge is not None else Decimal('0')

        profit = total_revenue - total_cost - order_discount - delivery_charge

        Sale.objects.create(
            order=order,
            ordered_price=order.total_price - order.delivery_charge,
            profit=profit
        )
        
def mark_sale_as_refunded(order: Order):
    try:
        sale = order.sale
        sale.refunded = True
        sale.save()
    except Sale.DoesNotExist:
        pass