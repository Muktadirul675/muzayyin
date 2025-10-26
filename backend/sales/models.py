from django.db import models
from orders.models import Order
from decimal import Decimal


class Sale(models.Model):
    order = models.OneToOneField(Order, related_name='sale', on_delete=models.CASCADE)
    ordered_price = models.DecimalField(max_digits=10, decimal_places=2)
    profit = models.DecimalField(max_digits=10, decimal_places=2)
    refunded = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Sale #{self.id} - Order #{self.order.id}"