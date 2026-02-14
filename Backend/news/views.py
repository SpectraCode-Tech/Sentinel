# news/views.py
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticatedOrReadOnly, BasePermission
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import filters
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from django.db.models import Q, F
from datetime import timedelta
from .models import Article
from .serializers import ArticleSerializer
from rest_framework.pagination import PageNumberPagination
from .utils import notify_editors_new_draft


# ✅ Pagination class
class ArticlePagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 50


# ✅ Custom permission
class IsAuthorOrEditor(BasePermission):
    """
    Allow edit/publish only if user is author or staff.
    """
    def has_object_permission(self, request, view, obj):
        # Staff can do anything
        if request.user.is_staff:
            return True
        # Author can only modify their own article
        return obj.author == request.user


class ArticleViewSet(ModelViewSet):
    """
    Full-featured Article ViewSet:
    - Search: title, content, excerpt, tags
    - Filters: category, author, status
    - Ordering: publish_at, view_count, created_at
    - Pagination
    - Trending & Popular actions
    - Drafts accessible only to staff or authors
    - Auto increment view count on access
    - Scheduled publishing
    - Publish action for staff
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

    # 🎯 Exact filters
    filterset_fields = ['category', 'author', 'status', 'tags']

    # 🔎 Search fields
    search_fields = ['title', 'content', 'excerpt', 'tags__name']

    # ↕ Ordering
    ordering_fields = ['publish_at', 'view_count', 'created_at']
    ordering = ['-publish_at']

    # ✅ Custom queryset for drafts & scheduled publishing
    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        now = timezone.now()

        # Scheduled publishing: include published and drafts
        qs = qs.filter(Q(publish_at__lte=now) | Q(status="draft"))

        if user.is_staff:
            return qs  # Editor: see everything
        elif user.is_authenticated:
            return qs.filter(Q(status="published") | Q(author=user))  # Journalist: own drafts + all published
        else:
            return qs.filter(status="published", publish_at__lte=now)  # Public: only published

    # Auto-set author on creation
    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    # Auto increment view count when retrieving single article
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        # Increment view_count safely
        Article.objects.filter(pk=instance.pk).update(view_count=F('view_count') + 1)
        return super().retrieve(request, *args, **kwargs)

    # 🔥 Trending — high views in last 7 days, paginated
    @action(detail=False, methods=["get"])
    def trending(self, request):
        last_days = timezone.now() - timedelta(days=7)
        qs = self.get_queryset().filter(publish_at__gte=last_days).order_by('-view_count')

        # Pagination
        page = self.paginate_queryset(qs)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)

    # ⭐ Popular — highest views all time, paginated
    @action(detail=False, methods=["get"])
    def popular(self, request):
        qs = self.get_queryset().order_by('-view_count')

        # Pagination
        page = self.paginate_queryset(qs)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)

    # 📝 Publish action — only for staff
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
    
    # Inside ArticleViewSet
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

    def perform_create(self, serializer):
        article = serializer.save(author=self.request.user)
    
    # Notify editors if the article is a draft
        if article.status == "draft":
            notify_editors_new_draft(article)
            
            
    @action(detail=True, methods=['post'])
    def publish(self, request, pk=None):
        article = self.get_object()
        if not request.user.is_staff:
            return Response({"detail": "Not allowed"}, status=403)
    
        article.status = "published"
        article.publish_at = timezone.now()
        article.save(update_fields=['status', 'publish_at'])
    
    # Notify the author
        notify_author_article_published(article)
    
        serializer = self.get_serializer(article)
        return Response(serializer.data)


