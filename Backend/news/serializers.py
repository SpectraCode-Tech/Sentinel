from rest_framework import serializers
from .models import Article, Category, Tag


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = "__all__"

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = "__all__"

class ArticleSerializer(serializers.ModelSerializer):
    category_name = serializers.ReadOnlyField(source='category.name')
    author_name = serializers.SerializerMethodField()

    tags = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Tag.objects.all()
    )

    class Meta:
        model = Article
        fields = [
            "id", "title", "slug", "author", "author_name", 
            "category", "category_name", "excerpt", "content", 
            "image", "tags", "status", "view_count", "created_at", "publish_at"
        ]
        read_only_fields = ["author", "slug", "view_count", "created_at"]

    def is_valid(self, raise_exception=False):

        # 2. Cleanup: Remove fields that are empty strings but expect IDs or Objects
        # This prevents "Invalid PK" or "Must be an integer" errors
        mutable_data = self.initial_data.copy()
        for field in ['category', 'image']:
            if field in mutable_data and (mutable_data[field] in ['', 'null', 'undefined']):
                mutable_data.pop(field)
        
        self.initial_data = mutable_data
        return super().is_valid(raise_exception=raise_exception)
    
    def get_author_name(self, obj):
        full_name = f"{obj.author.first_name} {obj.author.last_name}".strip()
        return full_name if full_name else obj.author.username