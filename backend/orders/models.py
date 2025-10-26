from django.db import models
from products.models import Product, Variant, Color
from decimal import Decimal

ORDER_STATUS_CHOICES = [
    ('pending', 'Pending'),
    ('confirmed', 'Confirmed'),
    ('hold', 'Hold'),
    ('processing', 'Processing'),
    ('shipped', 'Shipped'),
    ('delivered', 'Delivered'),
    ('partially_delivered', 'Partially Delivered'),
    ('cancelled', 'Cancelled'),
    ('returned', 'Returned'),
    ('failed', 'Failed'),
    ('partially_returned', 'Partially Returned'),
    ('paid_returned', 'Paid Returned'),
]

class Order(models.Model):
    session_id = models.CharField(max_length=40, db_index=True)
    full_name = models.CharField(max_length=255)
    phone = models.CharField(max_length=20)
    shipping_address = models.TextField()
    
    order_discount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    delivery_charge = models.DecimalField(max_digits=10, decimal_places=2, default=0, null=True, blank=True)

    courier = models.CharField(max_length=255, null=True, blank=True, default="pathao")
    sent_to_courier = models.BooleanField(default=False)
    c_id = models.CharField(max_length=255, null=True, blank=True)
    courier_status = models.CharField(
        max_length=20,
        default='pending'
    )
    city_id = models.PositiveIntegerField(null=True, blank=True)
    zone_id = models.PositiveIntegerField(null=True, blank=True)
    area_id = models.PositiveIntegerField(null=True, blank=True)
    note = models.TextField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=ORDER_STATUS_CHOICES, default='pending')
    total_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    collected_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    source = models.CharField(max_length=20, default='organic')
    courier_reason = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def calculate_total_price(self):
        items_total = sum([item.total_price() for item in self.items.all()])
        total = items_total + (self.delivery_charge or 0)
        return total - self.order_discount if total > self.order_discount else 0

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)  # Save first to ensure order has an ID for items
        self.total_price = self.calculate_total_price()
        super().save(update_fields=['total_price'])

    def __str__(self):
        return f"Order #{self.id} - {self.full_name}"

class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, related_name="order_items", on_delete=models.PROTECT)
    variant = models.ForeignKey(Variant, null=True, blank=True, on_delete=models.SET_NULL)
    color = models.ForeignKey(Color, null=True, blank=True, on_delete=models.SET_NULL)
    quantity = models.PositiveIntegerField()
    price_at_purchase = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    def total_price(self):
        return Decimal(self.price_at_purchase * self.quantity)

class ReadyForCourier(models.Model):
    order = models.OneToOneField('Order', on_delete=models.CASCADE, related_name='ready_status')
    created_at = models.DateTimeField(auto_now_add=True)
