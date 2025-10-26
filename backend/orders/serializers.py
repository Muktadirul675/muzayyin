from rest_framework import serializers
from django.db import transaction
from decimal import Decimal
from .models import Order, OrderItem
from products.models import Product, Variant, Color
from products.serializers import ProductListSerializer, VariantSerializer, ColorSerializer
from .utils import adjust_stock, get_stock_action, NEGATIVE_STATUSES
# serializers.py
from rest_framework import serializers
from .models import ReadyForCourier

class ReadyForCourierSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReadyForCourier
        fields = ['id', 'order', 'created_at']  # include related fields as needed

    # Optional: nested order details
    order = serializers.SerializerMethodField()

    def get_order(self, obj):
        order = obj.order
        return {
            'id': order.id,
            'full_name': order.full_name,
            'phone': order.phone,
            'shipping_address': order.shipping_address,
            'city_id': order.city_id,
            'zone_id': order.zone_id,
        }

class OrderItemSerializer(serializers.ModelSerializer):
    product = ProductListSerializer(read_only=True)
    variant = VariantSerializer(read_only=True)
    color = ColorSerializer(read_only=True)

    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.filter(is_active=True),
        source='product',
        write_only=True
    )
    variant_id = serializers.PrimaryKeyRelatedField(
        queryset=Variant.objects.all(),
        source='variant',
        write_only=True,
        allow_null=True,
        required=False
    )
    color_id = serializers.PrimaryKeyRelatedField(
        queryset=Color.objects.all(),
        source='color',
        write_only=True,
        allow_null=True,
        required=False
    )

    class Meta:
        model = OrderItem
        fields = [
            'id', 'product', 'variant', 'color', 'quantity', 'price_at_purchase',
            'product_id', 'variant_id', 'color_id'
        ]


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)
    total_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'session_id', 'full_name', 'phone', 'shipping_address',
            'order_discount', 'delivery_charge', 'status', 'courier', 'c_id', 'courier_status','collected_amount',
            'total_price','courier_reason', 'created_at', 'updated_at', 'items', 'note','source'
        ]
        read_only_fields = ['created_at', 'updated_at', 'session_id', 'total_price','courier_reason','courier', 'c_id', 'courier_status']

    def validate(self, data):
        items = data.get('items', [])
        target_status = data.get('status', 'pending')

        if target_status in NEGATIVE_STATUSES:
            return data

        errors = []
        for item in items:
            product = item['product']
            variant = item.get('variant')
            color = item.get('color')
            quantity = item['quantity']

            if product.stock < quantity:
                errors.append(f"Not enough stock for product '{product.name}'")
            if variant and variant.stock < quantity:
                errors.append(f"Not enough stock for variant '{variant.name}'")
            if color and color.stock < quantity:
                errors.append(f"Not enough stock for color '{color.name}'")

        if errors:
            raise serializers.ValidationError({'stock_errors': errors})

        return data

    def calculate_total(self, order):
        total = Decimal('0.00')
        for item in order.items.all():
            total += Decimal(item.price_at_purchase) * item.quantity

        if order.delivery_charge:
            total += Decimal(order.delivery_charge)
        if order.order_discount:
            total -= Decimal(order.order_discount)

        # Ensure non-negative total
        return total if total > 0 else Decimal('0.00')

    @transaction.atomic
    def create(self, validated_data):
        items_data = validated_data.pop('items')
        order = Order.objects.create(**validated_data)

        for item_data in items_data:
            OrderItem.objects.create(order=order, **item_data)

        order.total_price = self.calculate_total(order)
        order.save(update_fields=['total_price'])

        return order

    @transaction.atomic
    def update(self, instance, validated_data):
        items_data = validated_data.pop('items', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if items_data is not None:
            instance.items.all().delete()
            for item_data in items_data:
                OrderItem.objects.create(order=instance, **item_data)

        instance.total_price = self.calculate_total(instance)
        instance.save(update_fields=['total_price'])

        return instance