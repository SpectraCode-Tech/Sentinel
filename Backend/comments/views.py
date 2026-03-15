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

    def perform_create(self, serializer):
        article_id = self.kwargs.get("article")

        if not article_id:
            article_id = self.request.data.get("article")

        # Logic check: Do you want comments to go live immediately?
        # If yes, keep status="approved". If you want to review them, use status="pending"
        comment = serializer.save(
            user=self.request.user if self.request.user.is_authenticated else None,
            article_id=article_id,
            status="approved" 
        )
        
        channel_layer = get_channel_layer()

        async_to_sync(channel_layer.group_send)(
            f"comments_{comment.article.id}",
            {
                "type": "send_comment",
                "data": {
                    "id": comment.id,
                    "article": comment.article.id,
                    "user": comment.user.username,
                    "content": comment.content,
                    "created_at": str(comment.created_at)
                }
            }
        )

    def destroy(self, request, *args, **kwargs):
        comment = self.get_object()
        
        # Ensure user is authenticated before checking role
        is_admin = getattr(request.user, 'role', None) == "ADMIN"
        
        if comment.user != request.user and not is_admin:
            raise PermissionDenied("You cannot delete this comment")

        return super().destroy(request, *args, **kwargs)