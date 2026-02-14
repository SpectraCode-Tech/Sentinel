from rest_framework import serializers
from .models import Comment

class CommentSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)  # shows username instead of ID
    replies = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = [
            'id', 'article', 'user', 'author_name', 'content',
            'parent', 'replies', 'likes', 'reports',
            'status', 'created_at', 'updated_at'
        ]
        read_only_fields = ['likes', 'reports', 'created_at', 'updated_at', 'replies']

    def get_replies(self, obj):
        # Nested replies
        serializer = CommentSerializer(obj.replies.all(), many=True)
        return serializer.data
