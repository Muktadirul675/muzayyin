# products/views.py
from rest_framework.exceptions import NotFound
from rest_framework import viewsets,filters
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Product, Variant, Color
from .serializers import ProductListSerializer, ProductDetailSerializer, ProductAddStockSerializer
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from rest_framework import status
from django.db import transaction
from django_filters.rest_framework import DjangoFilterBackend
from .filters import ProductFilter
from authapp.permissions import in_any_group
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import NotFound
from activities.utils import log_activity
from site_settings.utils import get_setting
from rest_framework.decorators import action
from rest_framework.response import Response

class StockAddView(APIView):
    def post(self, request):
        serializer = ProductAddStockSerializer(data=request.data, many=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        try:
            with transaction.atomic():
                for product_data in serializer.validated_data:
                    product_id = product_data['id']
                    quantity = product_data['quantity']
                    variants = product_data.get('variants', [])
                    colors = product_data.get('colors', [])

                    product = Product.objects.get(id=product_id)
                    product.stock = (product.stock or 0) + quantity
                    product.save()
                    log_activity(
                        user=request.user,
                        action='product.stock.add',
                        message=f"Added stock for product {product.name} (ID: {product.id})"
                    )

                    for var in variants:
                        variant = Variant.objects.get(id=var['id'], product=product)
                        variant.stock = (variant.stock or 0) + var['quantity']
                        variant.save()

                    for col in colors:
                        color = Color.objects.get(id=col['id'], product=product)
                        color.stock = (color.stock or 0) + col['quantity']
                        color.save()

        except Product.DoesNotExist:
            return Response({"error": f"Product with id {product_id} does not exist."}, status=status.HTTP_404_NOT_FOUND)
        except Variant.DoesNotExist:
            return Response({"error": "Variant does not exist for the given id and product."}, status=status.HTTP_404_NOT_FOUND)
        except Color.DoesNotExist:
            return Response({"error": "Color does not exist for the given id and product."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response({"message": "Stocks added successfully."})

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    permission_classes = [AllowAny]

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]  
    filterset_class = ProductFilter  
    search_fields = ['name']  
    ordering_fields = ['price', 'created_at', 'name', 'stock']  
    ordering = ['-created_at']

    def perform_create(self, serializer):
        product = serializer.save()
        log_activity(
            user=self.request.user,
            action='product.create',
            message=f"Created product {product.name} (ID: {product.id})"
        )

    def perform_update(self, serializer):
        product = serializer.save()
        log_activity(
            user=self.request.user,
            action='product.update',
            message=f"Updated product {product.name} (ID: {product.id})"
        )

    def get_object(self):
        lookup_url_kwarg = self.lookup_url_kwarg or self.lookup_field or 'pk'
        lookup_value = self.kwargs.get(lookup_url_kwarg)

        if lookup_value is None:
            raise NotFound("Invalid product identifier.")
        
        if self.action == 'retrieve':
            # Try slug first
            try:
                return Product.objects.get(slug=lookup_value, is_deleted=False)
            except Product.DoesNotExist:
                pass

            # Fallback to ID
            try:
                return Product.objects.get(id=int(lookup_value), is_deleted=False)
            except (Product.DoesNotExist, ValueError):
                raise NotFound("Product not found.")
        
        else:
            # For update/delete, only use ID
            try:
                return Product.objects.get(id=int(lookup_value))
            except (Product.DoesNotExist, ValueError):
                raise NotFound("Product not found.")

    def get_queryset(self):
        user = self.request.user

        if in_any_group(user, ['Admin', 'Staff']):
            return self.queryset  # Admin sees all products (even soft-deleted)
        
        return self.queryset.filter(is_active=True, stock__gt=0, is_deleted=False)

    def get_serializer_class(self):
        if self.action in ['list', 'all']:
            return ProductListSerializer
        return ProductDetailSerializer

    def destroy(self, request, *args, **kwargs):
        """Soft delete: mark the product as is_deleted=True."""
        product = self.get_object()

        if product.is_deleted:
            return Response({'detail': 'Product is already deleted.'}, status=status.HTTP_400_BAD_REQUEST)

        product.is_deleted = True
        product.is_active = False  # Optional: deactivate the product
        product.cart_items.all().delete()
        product.order_items.all().delete()
        product.save(update_fields=['is_deleted', 'is_active'])
        log_activity(
            user=request.user,
            action='product.delete',
            message=f"Soft-deleted product {product.name} (ID: {product.id})"
        )
        return Response({'detail': 'Product soft-deleted successfully.'}, status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=['get'])
    def all(self, request):
        """Return all products (admin view)."""
        products = Product.objects.all()
        serializer = ProductListSerializer(products, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], url_path='low-stocks')
    def low_stocks(self, request):
        try:
            threshold = int(get_setting('stock_alert_at', 10))
        except ValueError:
            threshold = 10

        # Base queryset: not deleted
        base_qs = Product.objects.filter(is_deleted=False)

        # Distinct categories
        low_stock_qs = base_qs.filter(stock__lte=threshold).distinct()
        unavailable_qs = base_qs.filter(is_active=False).exclude(id__in=low_stock_qs.values_list('id', flat=True))
        out_of_stock_qs = base_qs.filter(stock=0, is_active=True).exclude(id__in=low_stock_qs.values_list('id', flat=True))

        return Response({
            'low_stock': {
                'count': low_stock_qs.count(),
                'products': ProductListSerializer(low_stock_qs, many=True).data
            },
            'unavailable': {
                'count': unavailable_qs.count(),
                'products': ProductListSerializer(unavailable_qs, many=True).data
            },
            'out_of_stock': {
                'count': out_of_stock_qs.count(),
                'products': ProductListSerializer(out_of_stock_qs, many=True).data
            }
        })
    @action(detail=True, methods=['get'], url_path='suggestions')
    def suggest_products(self, request, pk=None):
        product = self.get_object()
        product_categories = product.categories.all()

        suggestions = Product.objects.filter(
            categories__in=product_categories,
            is_active=True,
            is_deleted=False
        ).exclude(id=product.id).distinct()[:10]  # Avoid duplicates

        serializer = ProductListSerializer(suggestions, many=True)
        return Response(serializer.data)
