from urllib import request, response, response

from rest_framework import viewsets, permissions
from rest_framework.exceptions import PermissionDenied
from .models import Comment
from .serializers import CommentSerializer

from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync



class CommentViewSet(viewsets.ModelViewSet):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        article_id = self.request.query_params.get("article") or self.kwargs.get("article")
        
        # If performing an action on a SPECIFIC comment, allow access to it
        if self.action in ['retrieve', 'destroy', 'update', 'partial_update']:
            return Comment.objects.all()

        # START WITH TOP-LEVEL ONLY
        # This is crucial so the serializer can start the recursion from the root
        queryset = Comment.objects.filter(parent=None)

        # Consistency Fix: Filter by status for everyone if you want a moderated site.
        # If you want authors to see their own 'pending' comments, you'd add a Q object here.
        queryset = queryset.filter(status="approved")

        if article_id:
            queryset = queryset.filter(article_id=article_id)

        return queryset

# comments/views.py
    def perform_create(self, serializer):
        instance = serializer.save(
            user=self.request.user if self.request.user.is_authenticated else None,
            article_id=self.kwargs.get("article") or self.request.data.get("article"),
            status="approved" 
        )
    
        # Use the actual serializer for the broadcast
        serializer_data = CommentSerializer(instance).data
    
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f"comments_{instance.article.id}",
            {
                "type": "send_comment",
                "data": serializer_data  # Send the full serialized object
            }
        )

        # async_to_sync(channel_layer.group_send)(
        #     f"comments_{comment.article.id}",
        #     {
        #         "type": "send_comment",
        #         "data": {
        #             "id": comment.id,
        #             "article": comment.article.id,
        #             "user": comment.user.username,
        #             "content": comment.content,
        #             "created_at": str(comment.created_at)
        #         }
        #     }
        # )

# comments/views.py
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        article_id = instance.article.id
        comment_id = instance.id
    
    # Perform the actual delete
        response = super().destroy(request, *args, **kwargs)

    # Broadcast the deletion
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
        f"comments_{article_id}",
            {
                "type": "delete_comment", # New type
                "data": {"id": comment_id, "deleted": True}
            }
        )
        return response