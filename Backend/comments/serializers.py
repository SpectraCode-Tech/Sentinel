from rest_framework import serializers
from .models import Comment

class CommentSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    replies = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = [
            'id', 'article', 'user', 'author_name', 'content',
            'parent', 'replies', 'likes', 'reports',
            'status', 'created_at', 'updated_at'
        ]
        read_only_fields = ['likes', 'reports', 'created_at', 'updated_at']

    def get_replies(self, obj):
        # 1. FIXED: Recursion Control
        # If this comment is already a reply, we don't nest further.
        # This prevents deep recursion that crashes the server.
        if obj.parent is not None:
            return []

        # 2. FIXED: Filtered Visibility
        # Only show approved replies to the public.
        replies = obj.replies.filter(status='approved')
        return CommentSerializer(replies, many=True, context=self.context).data

    def validate(self, data):
        # 3. FIXED: Anonymous Comment Logic
        # Ensure that if the user is not logged in, they MUST provide an author_name.
        request = self.context.get('request')
        user = request.user if request else None

        if not user or not user.is_authenticated:
            if not data.get('author_name'):
                raise serializers.ValidationError(
                    {"author_name": "You must provide a name to comment anonymously."}
                )
        return data