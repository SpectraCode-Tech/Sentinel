# news/serializers.py
from rest_framework import serializers
from .models import Article

class ArticleSerializer(serializers.ModelSerializer):
    can_edit = serializers.SerializerMethodField()
    can_publish = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()  # Override status dynamically

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
            'status',       # Dynamically filtered
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
        """
        Only show drafts to staff or the author.
        Public and other users see 'published' if it's published, else hide status.
        """
        user = self.context['request'].user
        if obj.status == "published":
            return obj.status
        elif user.is_staff or (user.is_authenticated and obj.author == user):
            return obj.status
        else:
            return "published"  # Force public to see only 'published'
