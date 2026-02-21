from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticatedOrReadOnly, BasePermission, IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import filters, status
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from django.db.models import Q, F
from datetime import timedelta
from .models import Article, Category
from .serializers import ArticleSerializer, CategorySerializer
from rest_framework.pagination import PageNumberPagination
from rest_framework import viewsets

# ✅ Pagination class
class ArticlePagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 50

# ✅ Custom permission
class IsAuthorOrEditor(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return True
        if request.user.is_staff:
            return True
        return obj.author == request.user

class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

class ArticleViewSet(ModelViewSet):
    """
    ArticleViewSet for journalists + editors.
    Handles drafts, review, publish, trending, popular, dashboard mode, and category filtering.
    """
    queryset = Article.objects.all().select_related("author", "category").prefetch_related("tags")
    serializer_class = ArticleSerializer
    permission_classes = [IsAuthenticatedOrReadOnly, IsAuthorOrEditor]
    pagination_class = ArticlePagination

    # 🔍 FILTER BACKENDS
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter
    ]

    # Exact filters (author, status, tags)
    filterset_fields = ['author', 'status', 'tags']

    search_fields = ['title', 'content', 'excerpt', 'tags__name', 'author__username']
    ordering_fields = ['publish_at', 'view_count', 'created_at']
    ordering = ['-publish_at']

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        now = timezone.now()

        # 🔥 CATEGORY FILTER (id or slug)
        category_param = self.request.query_params.get('category')
        if category_param:
            if category_param.isdigit():
                qs = qs.filter(category__id=category_param)
            else:
                qs = qs.filter(category__slug=category_param)

        # 🔹 Dashboard mode (only author's own articles)
        dashboard = self.request.query_params.get("dashboard")
        if dashboard and user.is_authenticated:
            return qs.filter(author=user)

        # 🔹 Staff see everything
        if user.is_staff:
            return qs

        # 🔹 Journalists see only their own + published
        if user.is_authenticated and getattr(user, 'role', None) == "WRITER":
            return qs.filter(Q(author=user) | Q(status="published", publish_at__lte=now))

        # 🔹 Public users
        return qs.filter(status="published", publish_at__lte=now)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        # Increment view count
        Article.objects.filter(pk=instance.pk).update(view_count=F('view_count') + 1)
        return super().retrieve(request, *args, **kwargs)

    @action(detail=False, methods=["get"])
    def trending(self, request):
        last_days = timezone.now() - timedelta(days=7)
        qs = self.get_queryset().filter(publish_at__gte=last_days).order_by('-view_count')
        page = self.paginate_queryset(qs)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def popular(self, request):
        qs = self.get_queryset().order_by('-view_count')
        page = self.paginate_queryset(qs)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def publish(self, request, pk=None):
        article = self.get_object()
        if not request.user.is_staff:
            return Response({"detail": "Not allowed"}, status=403)
        article.status = "published"
        article.publish_at = timezone.now()
        article.save(update_fields=['status', 'publish_at'])
        serializer = self.get_serializer(article)
        return Response(serializer.data)
    
    def update(self, request, *args, **kwargs):
        article = self.get_object()
        if not request.user.is_staff and article.author != request.user:
            return Response({"detail": "You cannot edit this article"}, status=403)
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        article = self.get_object()
        if not request.user.is_staff and article.author != request.user:
            return Response({"detail": "You cannot edit this article"}, status=403)
        return super().partial_update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        article = self.get_object()
        if not request.user.is_staff and article.author != request.user:
            return Response({"detail": "You cannot delete this article"}, status=403)
        return super().destroy(request, *args, **kwargs)

    # ✅ Always start as draft for journalists, staff can override
    def perform_create(self, serializer):
        if self.request.user.is_staff:
            serializer.save()
        else:
            serializer.save(
                author=self.request.user,
                status="draft"  # force draft
            )
            
    def perform_update(self, serializer):
        if self.request.user.is_staff:
            serializer.save()
        else:
            serializer.save(status="review")  # force review after edit

    # ✅ Submit action for journalist workflow
    @action(detail=True, methods=["post"])
    def submit(self, request, pk=None):
        article = self.get_object()
        if article.author != request.user:
            return Response(status=status.HTTP_403_FORBIDDEN)

        article.status = "review"
        article.save()
        return Response({"message": "Submitted for review"})