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
        read_only_fields = ['article', 'likes', 'reports', 'created_at', 'updated_at']

    def get_replies(self, obj):
        # FIXED: Removed the 'if obj.parent is not None' check.
        # This allows Reply B to show Reply C, and so on.
        
        # Only show approved replies to the public.
        replies = obj.replies.filter(status='approved')
        
        # We pass the context along to ensure 'request' is available in nested levels
        return CommentSerializer(replies, many=True, context=self.context).data

    def validate(self, data):
        request = self.context.get('request')
        user = request.user if request else None

        if not user or not user.is_authenticated:
            if not data.get('author_name'):
                raise serializers.ValidationError(
                    {"author_name": "You must provide a name to comment anonymously."}
                )
        return data