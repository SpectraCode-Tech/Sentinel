from rest_framework import viewsets, permissions
from rest_framework.exceptions import PermissionDenied
from .models import Comment
from .serializers import CommentSerializer

from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from utils.email import send_email

class CommentViewSet(viewsets.ModelViewSet):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        article_id = self.request.query_params.get("article") or self.kwargs.get("article")
        
        # Access specific comments for actions
        if self.action in ['retrieve', 'destroy', 'update', 'partial_update']:
            return Comment.objects.all()

        # Get top-level approved comments for the article
        queryset = Comment.objects.filter(parent=None, status="approved")
        if article_id:
            queryset = queryset.filter(article_id=article_id)

        return queryset

    def perform_create(self, serializer):
        # 1. Save the comment
        comment = serializer.save(
            user=self.request.user if self.request.user.is_authenticated else None,
            article_id=self.kwargs.get("article") or self.request.data.get("article"),
            status="approved" 
        )
    
        # 2. WebSocket Broadcast for real-time UI updates
        serializer_data = CommentSerializer(comment).data
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f"comments_{comment.article.id}",
            {
                "type": "send_comment",
                "data": serializer_data 
            }
        )
        
        # 3. Handle Reply Notifications (Email)
        if comment.parent and comment.parent.user:
            parent_user = comment.parent.user
            # Only email if the parent commenter isn't the one replying to themselves
            if parent_user.email and parent_user != self.request.user:
                send_email(
                    subject="New Reply to Your Comment",
                    message=f"{comment.user.username if comment.user else 'A guest'} replied:\n\n{comment.content}",
                    recipient_list=[parent_user.email]
                )

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        
        # Optional: Safety check to ensure only owners or admins can delete
        if instance.user != request.user and not request.user.is_staff:
            raise PermissionDenied("You do not have permission to delete this comment.")

        article_id = instance.article.id
        comment_id = instance.id
    
        response = super().destroy(request, *args, **kwargs)

        # Broadcast the deletion so the comment vanishes from everyone's screen
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f"comments_{article_id}",
            {
                "type": "delete_comment",
                "data": {"id": comment_id, "deleted": True}
            }
        )
        return response