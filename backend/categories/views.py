from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.exceptions import NotFound
from authapp.permissions import in_any_group
from .models import Category
from .serializers import CategorySerializer
from products.serializers import ProductListSerializer

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    pagination_class = None
    permission_classes = [AllowAny]

    def get_object(self):
        lookup_value = self.kwargs.get('pk')  # 'pk' is used even if route is /category/<slug or id>/
        try:
            if lookup_value.isdigit():
                return Category.objects.get(pk=int(lookup_value))
            return Category.objects.get(slug=lookup_value)
        except Category.DoesNotExist:
            raise NotFound('Category not found')

    @action(detail=True, methods=['get'], url_path='products')
    def products(self, request, pk=None):
        category = self.get_object()
        if in_any_group(self.request.user, ['Admin','Group']):
            products = category.products.filter()
        else:    
            products = category.products.filter(is_active=True)
        serializer = ProductListSerializer(products, many=True, context={'request': request})
        return Response(serializer.data)