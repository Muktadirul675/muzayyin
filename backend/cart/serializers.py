from rest_framework import serializers
from .models import Cart, CartItem
from products.serializers import ProductListSerializer, VariantSerializer, ColorSerializer
from products.models import Product, Color, Variant

class CartItemSerializer(serializers.ModelSerializer):
    product = ProductListSerializer(read_only=True)
    variant = VariantSerializer(read_only=True)
    color = ColorSerializer(read_only=True)

    product_id = serializers.PrimaryKeyRelatedField(source='product', write_only=True, queryset=Product.objects.none())
    variant_id = serializers.PrimaryKeyRelatedField(source='variant', write_only=True, allow_null=True, required=False, queryset=Variant.objects.none())
    color_id = serializers.PrimaryKeyRelatedField(source='color', write_only=True, allow_null=True, required=False, queryset=Color.objects.none())

    class Meta:
        model = CartItem
        fields = ['id', 'product', 'variant', 'color', 'quantity', 'product_id', 'variant_id', 'color_id']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        from products.models import Product, Variant, Color
        self.fields['product_id'].queryset = Product.objects.filter(is_active=True)
        self.fields['variant_id'].queryset = Variant.objects.all()
        self.fields['color_id'].queryset = Color.objects.all()

    def validate(self, data):
        product = data.get('product')
        variant = data.get('variant', None)
        color = data.get('color', None)
        quantity = data.get('quantity', 1)

        if not product.is_active:
            raise serializers.ValidationError("Product is not active.")

        if variant and variant.product_id != product.id:
            raise serializers.ValidationError("Variant does not belong to the specified product.")

        if color and color.product_id != product.id:
            raise serializers.ValidationError("Color does not belong to the specified product.")

        available_stock = variant.stock if variant else product.stock

        if quantity < 1:
            raise serializers.ValidationError("Quantity must be at least 1.")

        if quantity > available_stock:
            raise serializers.ValidationError(f"Only {available_stock} items available in stock.")

        return data


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total_items = serializers.IntegerField(read_only=True)
    total_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = Cart
        fields = ['id', 'session_id', 'items', 'total_items', 'total_price']