from django.db import models
from products.models import Product, Variant, Color


class Cart(models.Model):
    session_id = models.CharField(max_length=40, unique=True)  # Django session key length
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def total_items(self):
        return self.items.filter(
            product__is_active=True,
        ).exclude(product__stock=0).aggregate(
            models.Sum('quantity')
        )['quantity__sum'] or 0


    def total_price(self):
        total = 0
        for item in self.items.all():
            product = item.product
            variant = item.variant

            if not product.is_active or product.stock == 0:
                continue

            if variant and (variant.product_id != product.id or variant.stock == 0):
                continue

            price = product.net_price or product.price
            total += price * item.quantity

        return total

    def __str__(self):
        return f"Cart {self.session_id}"


class CartItem(models.Model):
    cart = models.ForeignKey(Cart, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, related_name="cart_items", on_delete=models.CASCADE)
    variant = models.ForeignKey(Variant, on_delete=models.SET_NULL, null=True, blank=True)
    color = models.ForeignKey(Color, on_delete=models.SET_NULL, null=True, blank=True)
    quantity = models.PositiveIntegerField(default=1)

    class Meta:
        unique_together = ('cart', 'product', 'variant', 'color')

    def __str__(self):
        variant_name = self.variant.name if self.variant else 'No variant'
        color_name = self.color.name if self.color else 'No color'
        return f"{self.quantity} x {self.product.name} ({variant_name}, {color_name})"