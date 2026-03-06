from rest_framework import viewsets, permissions
from rest_framework.exceptions import PermissionDenied
from .models import Comment
from .serializers import CommentSerializer


class CommentViewSet(viewsets.ModelViewSet):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        article_id = self.request.query_params.get("article") or self.kwargs.get("article")
    
    # If we are performing an action on a SPECIFIC comment (like DELETE)
    # we need to allow searching through ALL comments, including replies.
        if self.action in ['retrieve', 'destroy', 'update', 'partial_update']:
            return Comment.objects.all()

    # If we are just LISTING comments, only show top-level ones
        queryset = Comment.objects.filter(parent=None)

        if not self.request.user.is_authenticated:
            queryset = queryset.filter(status="approved")

        if article_id:
            queryset = queryset.filter(article_id=article_id)

        return queryset

    def perform_create(self, serializer):
        # drf-nested-routers uses the 'lookup' name + '_pk'
        article_id = self.kwargs.get("article")

        if not article_id:
            # Fallback check if you aren't using nested routers for some reason
            article_id = self.request.data.get("article")

        serializer.save(
            user=self.request.user if self.request.user.is_authenticated else None,
            article_id=article_id,
            status="approved"
        )

    def destroy(self, request, *args, **kwargs):
        comment = self.get_object()

        if comment.user != request.user and request.user.role != "ADMIN":
            raise PermissionDenied("You cannot delete this comment")

        return super().destroy(request, *args, **kwargs)