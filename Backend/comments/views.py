from django.shortcuts import render
from rest_framework import viewsets, permissions
from .models import Comment
from .serializers import CommentSerializer

# Create your views here.
class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        # Assign the logged-in user automatically if available
        serializer.save(user=self.request.user if self.request.user.is_authenticated else None)
