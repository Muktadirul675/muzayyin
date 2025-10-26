# sales/admin.py
from django.contrib import admin
from .models import Sale

@admin.register(Sale)
class SaleAdmin(admin.ModelAdmin):
    list_display = ['order', 'ordered_price', 'profit', 'created_at']