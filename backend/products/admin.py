from django.contrib import admin
from .models import Product, Category, Variant, Color
# Register your models here.

admin.site.register(Product)
admin.site.register(Category)
admin.site.register(Variant)
admin.site.register(Color)
