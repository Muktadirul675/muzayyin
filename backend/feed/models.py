from django.db import models
from products.models import Product, Category
from notice.models import Notice
from images.models import UploadedImage


class FeedSection(models.Model):
    SECTION_TYPES = [
        ('notice', 'Notice'),
        ('navbar', 'Navbar'),
        ('image_slider', 'Image Slider'),
        ('categories_bar', 'Categories Bar'),
        ('categories_slider','Categories Slider'),
        ('products', 'Products'),
        ('products_slider', 'Products Slider'),
        ('category', 'Category'),
        ('footer', 'Footer'),
    ]

    type = models.CharField(max_length=32, choices=SECTION_TYPES)
    title = models.CharField(max_length=255, blank=True, null=True)
    subtitle = models.TextField(blank=True, null=True)

    notices = models.ManyToManyField(Notice, blank=True)
    images = models.ManyToManyField(UploadedImage, blank=True)
    image_each_slide = models.PositiveIntegerField(blank=True, null=True)

    categories = models.ManyToManyField(Category, blank=True)
    products = models.ManyToManyField(Product, blank=True)
    category = models.ForeignKey(
        Category, null=True, blank=True,
        on_delete=models.SET_NULL, related_name='category_feed'
    )

    products_each_slide = models.PositiveIntegerField(blank=True, null=True)

    # ð¥ Complex structured slide entries
    slides = models.JSONField(blank=True, null=True)

    # â New field: arguments (custom key-value for frontend usage)
    args = models.JSONField(blank=True, null=True)

    # â Already present but explicitly kept
    is_active = models.BooleanField(default=True)
    position = models.PositiveIntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['position']

    def __str__(self):
        return self.type