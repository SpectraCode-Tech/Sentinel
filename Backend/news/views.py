from rest_framework import viewsets, permissions, filters
from django.utils import timezone

from .utils import notify_editors_new_draft, notify_author_article_published
from .models import Article, Category, Tag
from .serializers import ArticleSerializer, CategorySerializer, TagSerializer
from django_filters.rest_framework import DjangoFilterBackend


class ArticleViewSet(viewsets.ModelViewSet):
    serializer_class = ArticleSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    
    filterset_fields = {
        'status': ['exact'],
        'category__slug': ['exact'],
    }

    search_fields = ['title', 'content', 'excerpt', 'category__name']

    def get_queryset(self):
        queryset = Article.objects.filter(is_deleted=False)

    # Filter by author
        author_id = self.request.query_params.get("author")
        if author_id:
            queryset = queryset.filter(author_id=author_id)

        user = self.request.user

    # Public users → only published
        if not user.is_authenticated:
            return queryset.filter(status="published")

    # Admin & Editor → everything
        if user.role in ["ADMIN", "EDITOR"]:
            return queryset.exclude(status="draft")

    # Journalist → only their own
        if user.role == "JOURNALIST":
            return queryset.filter(author=user)

        return queryset.filter(status="published")
    
    def perform_create(self, serializer):
        # Check if the user specifically sent 'draft' status from the frontend
        status = self.request.data.get('status', 'review')
        article=serializer.save(
            author=self.request.user,
            status=status
        )
        if status == 'review':
            notify_editors_new_draft(article)

    def perform_update(self, serializer):
        old_status = self.get_object().status
        article = serializer.save()

        #if status changes to publish and no publish date, set it to now
        if article.status == "published" and not article.publish_at:
            article.publish_at = timezone.now()
            article.save()
            
        if old_status != "published" and article.status == "published":
            notify_author_article_published(article)
            
        if old_status == "draft" and article.status == "review":
            notify_editors_new_draft(article)
            
        # Auto publish scheduled posts
        if article.status == "scheduled" and article.publish_at:
            if article.publish_at <= timezone.now():
                article.status = "published"
                article.save()


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]


class TagViewSet(viewsets.ModelViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [permissions.AllowAny]