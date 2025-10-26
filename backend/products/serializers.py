from rest_framework import serializers
from .models import Product, Variant, Color
from categories.serializers import CategorySerializer
from images.serializers import UploadedImageSerializer
from rest_framework import serializers
from .models import Product, Variant, Color

class VariantStockUpdateSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    quantity = serializers.IntegerField()

class ColorStockUpdateSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    quantity = serializers.IntegerField()

class ProductAddStockSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    quantity = serializers.IntegerField()
    variants = VariantStockUpdateSerializer(many=True, required=False)
    colors = ColorStockUpdateSerializer(many=True, required=False)

    def validate_id(self, value):
        if not Product.objects.filter(id=value).exists():
            raise serializers.ValidationError("Invalid product ID")
        return value

    def validate_variants(self, value):
        for item in value:
            if not Variant.objects.filter(id=item['id']).exists():
                raise serializers.ValidationError(f"Invalid variant ID: {item['id']}")
        return value

    def validate_colors(self, value):
        for item in value:
            if not Color.objects.filter(id=item['id']).exists():
                raise serializers.ValidationError(f"Invalid color ID: {item['id']}")
        return value

    def save(self, **kwargs):
        product = Product.objects.get(id=self.validated_data['id'])
        product.stock += self.validated_data['quantity']
        product.save()

        for variant_data in self.validated_data.get('variants', []):
            variant = Variant.objects.get(id=variant_data['id'], product=product)
            variant.stock += variant_data['quantity']
            variant.save()

        for color_data in self.validated_data.get('colors', []):
            color = Color.objects.get(id=color_data['id'], product=product)
            color.stock += color_data['quantity']
            color.save()

        return product

class VariantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Variant
        fields = ['id', 'name', 'stock']


class ColorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Color
        fields = ['id', 'name', 'hex_code', 'stock']

class ProductOrderReportSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    order_count = serializers.IntegerField()
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'price', 'net_price', 'compared_price',
            'discount', 'image', 'stock', 'sku', 'order_count'
        ]

    def get_image(self, obj):
        image = obj.images.first()
        return UploadedImageSerializer(image).data if image else None

class ProductListSerializer(serializers.ModelSerializer):
    categories = CategorySerializer(many=True, read_only=True)
    image = serializers.SerializerMethodField()
    variants = VariantSerializer(many=True, required=False)
    colors = ColorSerializer(many=True, required=False)
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'price', 'net_price', 'compared_price',
            'discount', 'image', 'categories', 'stock', 'is_active', 'sku','variants','colors'
        ]

    def get_image(self, obj):
        image = obj.images.first()
        return UploadedImageSerializer(image).data if image else None

class ProductDetailSerializer(serializers.ModelSerializer):
    # ð¢ For reading (nested output)
    categories = CategorySerializer(many=True, read_only=True)
    images = UploadedImageSerializer(many=True, read_only=True)

    # ð¡ For writing (IDs only)
    category_ids = serializers.PrimaryKeyRelatedField(
        queryset=Product._meta.get_field('categories').remote_field.model.objects.all(),
        many=True, write_only=True, required=False, source='categories'
    )
    image_ids = serializers.PrimaryKeyRelatedField(
        queryset=Product._meta.get_field('images').remote_field.model.objects.all(),
        many=True, write_only=True, required=False, source='images'
    )

    variants = VariantSerializer(many=True, required=False)
    colors = ColorSerializer(many=True, required=False)

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'sku', 'slug', 'description',
            'price', 'net_price', 'compared_price', 'discount', 'cost_price',
            'stock', 'is_active',
            'categories', 'category_ids',        # â¬ï¸ both included
            'images', 'image_ids',               # â¬ï¸ both included
            'variants', 'colors',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['net_price', 'created_at', 'updated_at']

    def create(self, validated_data):
        variants_data = validated_data.pop('variants', [])
        colors_data = validated_data.pop('colors', [])
        category_data = validated_data.pop('categories', [])
        image_data = validated_data.pop('images', [])

        product = Product.objects.create(**validated_data)
        product.categories.set(category_data)
        product.images.set(image_data)

        for variant_data in variants_data:
            Variant.objects.create(product=product, **variant_data)
        for color_data in colors_data:
            Color.objects.create(product=product, **color_data)

        return product
    def update(self, instance, validated_data):
        # Pop related fields if provided
        variants_data = validated_data.pop('variants', None)
        colors_data = validated_data.pop('colors', None)
        category_data = validated_data.pop('categories', None)
        image_data = validated_data.pop('images', None)

        # Update base fields (name, price, etc.)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Only update categories if explicitly provided
        if category_data is not None:
            instance.categories.set(category_data)

        # Only update images if explicitly provided
        if image_data is not None:
            instance.images.set(image_data)

        # âï¸ Update variants without removing others
# âï¸ Update variants (syncing: update, create, delete missing ones)
        if variants_data is not None:
            incoming_variant_ids = [v.get('id') for v in variants_data if v.get('id')]
            # Delete variants not in the incoming list
            instance.variants.exclude(id__in=incoming_variant_ids).delete()

            for variant_data in variants_data:
                vid = variant_data.get('id')
                if vid:
                    try:
                        variant = instance.variants.get(id=vid)
                        for attr, value in variant_data.items():
                            setattr(variant, attr, value)
                        variant.save()
                    except Variant.DoesNotExist:
                        pass  # Skip if not found
                else:
                    Variant.objects.create(product=instance, **variant_data)

        # âï¸ Update colors (syncing: update, create, delete missing ones)
        if colors_data is not None:
            incoming_color_ids = [c.get('id') for c in colors_data if c.get('id')]
            # Delete colors not in the incoming list
            instance.colors.exclude(id__in=incoming_color_ids).delete()

            for color_data in colors_data:
                cid = color_data.get('id')
                if cid:
                    try:
                        color = instance.colors.get(id=cid)
                        for attr, value in color_data.items():
                            setattr(color, attr, value)
                        color.save()
                    except Color.DoesNotExist:
                        pass
                else:
                    Color.objects.create(product=instance, **color_data)

        return instance
    
    # def update(self, instance, validated_data):
        #     variants_data = validated_data.pop('variants', [])
        #     colors_data = validated_data.pop('colors', [])
        #     category_data = validated_data.pop('categories', [])
        #     image_data = validated_data.pop('images', [])

        #     for attr, value in validated_data.items():
        #         setattr(instance, attr, value)
        #     instance.save()

        #     instance.categories.set(category_data)
        #     instance.images.set(image_data)

        #     # Handle variants
        #     variant_ids = [item.get('id') for item in variants_data if item.get('id')]
        #     instance.variants.exclude(id__in=variant_ids).delete()
        #     for variant_data in variants_data:
        #         vid = variant_data.get('id')
        #         if vid:
        #             variant = Variant.objects.get(id=vid, product=instance)
        #             for attr, value in variant_data.items():
        #                 setattr(variant, attr, value)
        #             variant.save()
        #         else:
        #             Variant.objects.create(product=instance, **variant_data)

        #     # Handle colors
        #     color_ids = [item.get('id') for item in colors_data if item.get('id')]
        #     instance.colors.exclude(id__in=color_ids).delete()
        #     for color_data in colors_data:
        #         cid = color_data.get('id')
        #         if cid:
        #             color = Color.objects.get(id=cid, product=instance)
        #             for attr, value in color_data.items():
        #                 setattr(color, attr, value)
        #             color.save()
        #         else:
        #             Color.objects.create(product=instance, **color_data)

        #     return instance
        