from django.db import models
from django.utils.text import slugify
from categories.models import Category
from images.models import UploadedImage
from django.db.models import Manager, QuerySet

class ProductQuerySet(QuerySet):
    def active(self):
        return self.filter(is_deleted=False)

class ProductManager(Manager):
    def get_queryset(self):
        return ProductQuerySet(self.model, using=self._db).active()

class Product(models.Model):
    objects = ProductManager()
    all_objects = Manager()  # to access deleted products if needed
    name = models.CharField(max_length=255)
    sku = models.CharField(max_length=64)
    slug = models.SlugField(unique=True, blank=True)
    description = models.TextField(blank=True)

    categories = models.ManyToManyField('categories.Category', blank=True, related_name='products')
    price = models.DecimalField(max_digits=10, decimal_places=2)
    compared_price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    discount = models.IntegerField(blank=True, null=True, help_text="Flat discount amount")
    net_price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    cost_price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)

    stock = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    images = models.ManyToManyField('images.UploadedImage', blank=True, related_name='product_images')

    is_deleted = models.BooleanField(default=False)  # â Soft delete flag
    total_orders = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def get_effective_price(self):
        return self.net_price or self.price

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        if self.discount and self.discount > 0:
            self.net_price = self.price - self.discount
        else:
            self.net_price = None
        super().save(*args, **kwargs)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['sku','slug'],
                condition=models.Q(is_deleted=False),
                name='unique_active_sku_&_slug'
            )
        ]

    def __str__(self):
        return self.name


class Variant(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='variants')
    name = models.CharField(max_length=100)
    stock = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"{self.name} - {self.product.name}"


class Color(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='colors')
    name = models.CharField(max_length=50)
    hex_code = models.CharField(max_length=7, help_text="Example: #FF5733")
    stock = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"{self.name} ({self.product.name})"