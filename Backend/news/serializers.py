from rest_framework import serializers
from .models import Article, Category, Tag


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug']


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name']


class ArticleSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True)

    can_edit = serializers.SerializerMethodField()
    can_publish = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()

    # Add this line if you want full URL to the image
    image = serializers.SerializerMethodField()

    class Meta:
        model = Article
        fields = [
            'id',
            'title',
            'content',
            'excerpt',
            'author',
            'category',
            'tags',
            'image',       # ✅ include image here
            'status',
            'publish_at',
            'view_count',
            'created_at',
            'updated_at',
            'can_edit',
            'can_publish',
        ]
        read_only_fields = [
            'author',
            'view_count',
            'created_at',
            'updated_at',
            'can_edit',
            'can_publish',
        ]

    def get_can_edit(self, obj):
        user = self.context['request'].user
        return user.is_staff or (user.is_authenticated and obj.author == user)

    def get_can_publish(self, obj):
        user = self.context['request'].user
        return user.is_staff

    def get_status(self, obj):
        user = self.context['request'].user
        if obj.status == "published":
            return obj.status
        elif user.is_staff or (user.is_authenticated and obj.author == user):
            return obj.status
        else:
            return "published"

    def get_image(self, obj):
        request = self.context.get('request')
        if obj.image and hasattr(obj.image, 'url'):
            return request.build_absolute_uri(obj.image.url)
        return None
