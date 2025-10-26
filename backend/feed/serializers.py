from rest_framework import serializers
from .models import FeedSection
from products.serializers import ProductListSerializer, CategorySerializer
from notice.serializers import NoticeSerializer
from images.serializers import UploadedImageSerializer

class FeedSectionSerializer(serializers.ModelSerializer):
    notices = NoticeSerializer(many=True, read_only=True)
    categories = CategorySerializer(many=True, read_only=True)
    products = ProductListSerializer(many=True, read_only=True)
    category = CategorySerializer(read_only=True)
    images = UploadedImageSerializer(many=True, read_only=True)

    notice_ids = serializers.PrimaryKeyRelatedField(
        queryset=FeedSection._meta.get_field('notices').remote_field.model.objects.all(),
        many=True, write_only=True, required=False, allow_empty=True, source='notices'
    )
    category_ids = serializers.PrimaryKeyRelatedField(
        queryset=FeedSection._meta.get_field('categories').remote_field.model.objects.all(),
        many=True, write_only=True, required=False, allow_empty=True, source='categories'
    )
    product_ids = serializers.PrimaryKeyRelatedField(
        queryset=FeedSection._meta.get_field('products').remote_field.model.objects.all(),
        many=True, write_only=True, required=False, allow_empty=True, source='products'
    )
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=FeedSection._meta.get_field('category').remote_field.model.objects.all(),
        write_only=True, required=False, allow_null=True, source='category'
    )
    image_ids = serializers.PrimaryKeyRelatedField(
        queryset=FeedSection._meta.get_field('images').remote_field.model.objects.all(),
        many=True, write_only=True, required=False, allow_empty=True, source='images'
    )

    # â Explicit fields
    slides = serializers.JSONField(required=False, allow_null=True)
    args = serializers.JSONField(required=False, allow_null=True)
    products_each_slide = serializers.IntegerField(required=False, allow_null=True)  # â¬ï¸ Explicitly added

    class Meta:
        model = FeedSection
        fields = [
            'id', 'type', 'title', 'subtitle',
            'notices', 'notice_ids',
            'images', 'image_ids', 'image_each_slide',
            'categories', 'category_ids',
            'products', 'product_ids',
            'category', 'category_id',
            'products_each_slide',
            'slides',
            'args',
            'is_active', 'position',
            'created_at', 'updated_at',
        ]