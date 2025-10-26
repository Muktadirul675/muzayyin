from rest_framework import viewsets, status
from rest_framework.response import Response
from .models import Cart, CartItem
from .serializers import CartSerializer, CartItemSerializer
from rest_framework.permissions import AllowAny
from django.shortcuts import get_object_or_404
from rest_framework.decorators import action
from orders.models import Order, OrderItem
from django.db import transaction
from visits.utils import get_client_ip
from django.core.cache import cache

class CartViewSet(viewsets.ViewSet):
    permission_classes = [AllowAny]

    def get_cart(self, request):
        session_id = request.session.session_key
        if not session_id:
            request.session.create()
            session_id = request.session.session_key
        cart, created = Cart.objects.get_or_create(session_id=session_id)
        return cart

    def list(self, request):
        cart = self.get_cart(request)

        # Clean invalid items
        valid_items = []
        for item in cart.items.all():
            product = item.product
            variant = item.variant
            color = item.color

            # Skip if product is deleted, inactive, or out of stock
            if not product.is_active or product.stock == 0:
                item.delete()
                continue

            # Skip if variant exists and has no stock or doesn't belong
            if variant:
                if variant.product_id != product.id or variant.stock == 0:
                    item.delete()
                    continue

            # Skip if color exists but doesn't belong
            if color and color.product_id != product.id:
                item.delete()
                continue

            valid_items.append(item)

        # Re-fetch after cleanup
        cart.refresh_from_db()
        serializer = CartSerializer(cart)
        return Response(serializer.data)

    def add_item(self, request):
        cart = self.get_cart(request)
        serializer = CartItemSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        product = serializer.validated_data['product']
        variant = serializer.validated_data.get('variant', None)
        color = serializer.validated_data.get('color', None)
        quantity = serializer.validated_data.get('quantity', 1)

        cart_item_qs = CartItem.objects.filter(cart=cart, product=product, variant=variant, color=color)
        if cart_item_qs.exists():
            cart_item = cart_item_qs.first()
            new_quantity = cart_item.quantity + quantity

            # Determine applicable stock limits
            stock_sources = []

            if variant and variant.stock is not None:
                stock_sources.append(("Variant", variant.stock))
            if color and color.stock is not None:
                stock_sources.append(("Color", color.stock))
            if product.stock is not None:
                stock_sources.append(("Product", product.stock))

            # Find the lowest stock constraint
            if stock_sources:
                limiting_stock_label, limiting_stock = min(stock_sources, key=lambda x: x[1])
                if new_quantity > limiting_stock:
                    available = limiting_stock - cart_item.quantity
                    return Response(
                        {
                            "detail": f"Cannot add {quantity} items. Only {available} more available based on {limiting_stock_label} stock."
                        },
                        status=status.HTTP_400_BAD_REQUEST,
                    )

            # All good, update the quantity
            cart_item.quantity = new_quantity
            cart_item.save()
        else:
            CartItem.objects.create(cart=cart, product=product, variant=variant, color=color, quantity=quantity)

        cart.refresh_from_db()
        return Response(CartSerializer(cart).data, status=status.HTTP_201_CREATED)

    def update_item(self, request, pk=None):
        cart = self.get_cart(request)
        cart_item = get_object_or_404(CartItem, pk=pk, cart=cart)
        serializer = CartItemSerializer(cart_item, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        cart.refresh_from_db()
        return Response(CartSerializer(cart).data)

    def remove_item(self, request, pk=None):
        cart = self.get_cart(request)
        cart_item = get_object_or_404(CartItem, pk=pk, cart=cart)
        cart_item.delete()
        cart.refresh_from_db()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    @action(detail=False, methods=['post'])
    def checkout(self, request):
        cart = self.get_cart(request)

        if not cart.items.exists():
            return Response({"detail": "Cart is empty."}, status=status.HTTP_400_BAD_REQUEST)

        data = request.data
        full_name = data.get("full_name")
        phone = data.get("phone")
        shipping_address = data.get("shipping_address")
        note = data.get("note", "")
        ip = get_client_ip(request)
        origin = cache.get(f'origin:{ip}')
        print(f"ORIGIN: {origin}")
        source = 'organic'
        if origin:
            source = origin

        if not all([full_name, phone, shipping_address]):
            return Response(
                {"detail": "Missing required fields: full_name, phone, or shipping_address"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate stock and prepare order items
        items = []

        for item in cart.items.all():
            product = item.product
            variant = item.variant
            color = item.color
            quantity = item.quantity

            # Stock check
            stock_sources = []

            if variant and variant.stock is not None:
                stock_sources.append(("Variant", variant.stock))
            if color and color.stock is not None:
                stock_sources.append(("Color", color.stock))
            if product.stock is not None:
                stock_sources.append(("Product", product.stock))

            limiting_label, limiting_stock = min(stock_sources, key=lambda x: x[1]) if stock_sources else ("Product", 0)

            if quantity > limiting_stock:
                return Response(
                    {"detail": f"Not enough stock for {product.name}. Limited by {limiting_label} stock."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            items.append({
                "product": product,
                "variant": variant,
                "color": color,
                "quantity": quantity
            })

        num_items = 0
        product_ids = []

        # ð§  Atomic block
        with transaction.atomic():
            order = Order.objects.create(
                full_name=full_name,
                phone=phone,
                shipping_address=shipping_address,
                note=note,
                session_id=cart.session_id,
                source=source
            )

            for item in items:
                OrderItem.objects.create(
                    order=order,
                    product=item["product"],
                    variant=item["variant"],
                    color=item["color"],
                    quantity=item["quantity"],
                    price_at_purchase=item['product'].net_price or item['product'].price
                )
            order.save()
            for item in items:
                num_items += item['quantity']
                product_ids.append(item['product'].id)
            # Clear cart only after successful order creation
            cart.items.all().delete()

        return Response({
            "success": True,
            "message": "Order created successfully.",
            "order_id": order.id,
            "num_items": num_items,
            "product_ids":product_ids
        }, status=status.HTTP_201_CREATED)
