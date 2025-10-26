from rest_framework import serializers
from .models import Category

class CategorySerializer(serializers.ModelSerializer):
    parent_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'parent', 'parent_name', 'created_at']
        extra_kwargs = {
            'slug': {'read_only': True},
        }

    def get_parent_name(self, obj):
        return obj.parent.name if obj.parent else None