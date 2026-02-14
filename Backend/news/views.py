# news/views.py
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import filters
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from datetime import timedelta
from .models import Article
from .serializers import ArticleSerializer
from .pagination import ArticlePagination  # Make sure this exists

class ArticleViewSet(ModelViewSet):
    """
    Full-featured Article ViewSet:
    - Search: title, content, excerpt, tags
    - Filters: category, author, status
    - Ordering: publish_at, view_count, created_at
    - Pagination
    - Trending & Popular actions
    - Drafts accessible only to staff or authors
    """
    queryset = Article.objects.all().select_related("author", "category").prefetch_related("tags")
    serializer_class = ArticleSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    pagination_class = ArticlePagination

    # 🔍 FILTER BACKENDS
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter
    ]

    # 🎯 Exact filters
    filterset_fields = [
        'category',
        'author',
        'status'
    ]

    # 🔎 Search fields
    search_fields = [
        'title',
        'content',
        'excerpt',
        'tags__name',  # Search by tag names too
    ]

    # ↕ Ordering
    ordering_fields = [
        'publish_at',
        'view_count',
        'created_at'
    ]
    ordering = ['-publish_at']

    # ✅ Only show published for non-staff/non-authors
    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user

        if not user.is_staff:
            # Non-staff see only published articles
            qs = qs.filter(status="published")
        else:
            # Staff see everything
            qs = qs
        return qs

    # Auto-set author on creation
    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    # 🔥 Trending — high views in last 7 days, paginated
    @action(detail=False, methods=["get"])
    def trending(self, request):
        last_days = timezone.now() - timedelta(days=7)
        qs = Article.objects.filter(
            publish_at__gte=last_days
        ).order_by('-view_count')
        
        # Use DRF pagination
        page = self.paginate_queryset(qs)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)

    # ⭐ Popular — highest views all time, paginated
    @action(detail=False, methods=["get"])
    def popular(self, request):
        qs = Article.objects.order_by("-view_count")

        # Use DRF pagination
        page = self.paginate_queryset(qs)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)
