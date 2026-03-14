from datetime import timedelta
from django.utils import timezone

from rest_framework import viewsets, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response

from django_filters.rest_framework import DjangoFilterBackend

from analytics.models import ReadingHistory
from .utils import notify_editors_new_draft, notify_author_article_published
from .models import Article, Category, Tag
from .serializers import ArticleSerializer, CategorySerializer, TagSerializer

from .utils import get_client_ip
from .models import ArticleView


class ArticleViewSet(viewsets.ModelViewSet):
    serializer_class = ArticleSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]

    filterset_fields = {
        'status': ['exact'],
        'category__slug': ['exact'],
    }

    search_fields = ['title', 'content', 'excerpt', 'category__name']

    def retrieve(self, request, *args, **kwargs):
        article = self.get_object()

        ip = get_client_ip(request)
        user_agent = request.META.get("HTTP_USER_AGENT", "")

        time_threshold = timezone.now() - timedelta(minutes=10)

        already_viewed = ArticleView.objects.filter(
            article=article,
            ip_address=ip,
            user_agent=user_agent,
            viewed_at__gte=time_threshold
        ).exists()

        if not already_viewed:
            ArticleView.objects.create(
                article=article,
                ip_address=ip,
                user_agent=user_agent
            )

            article.view_count += 1
            article.save(update_fields=["view_count"])

        serializer = self.get_serializer(article)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def recommendations(self, request):

        user = request.user
        base_queryset = Article.objects.filter(status="published", is_deleted=False)
        current_id = request.query_params.get('exclude')

        if not user.is_authenticated:
            # Guests get random articles
            recommendations = base_queryset.order_by('?')[:4]

        else:
            liked_categories = ReadingHistory.objects.filter(
                user=user,
                time_spent__gt=1
            ).values_list('article__category', flat=True).distinct()

            recommendations = base_queryset.filter(category__in=liked_categories)

            if current_id:
                recommendations = recommendations.exclude(id=current_id)

            recommendations = recommendations.order_by('?')[:4]

            if recommendations.count() < 4:
                existing_ids = [a.id for a in recommendations]

                if current_id:
                    existing_ids.append(int(current_id))

                extra_needed = 4 - recommendations.count()

                extra = base_queryset.exclude(
                    id__in=existing_ids
                ).order_by('?')[:extra_needed]

                recommendations = list(recommendations) + list(extra)

        serializer = self.get_serializer(recommendations, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def trending(self, request):

        time_threshold = timezone.now() - timedelta(days=7)

        trending_articles = Article.objects.filter(
            status="published",
            is_deleted=False,
            publish_at__gte=time_threshold
        ).order_by('-view_count')[:5]

        serializer = self.get_serializer(trending_articles, many=True)
        return Response(serializer.data)

    def get_queryset(self):

        queryset = Article.objects.filter(is_deleted=False).order_by('-publish_at')

        # Filter by author
        author_id = self.request.query_params.get("author")
        if author_id:
            queryset = queryset.filter(author_id=author_id)

        user = self.request.user

        # Public users → only published
        if not user.is_authenticated:
            return queryset.filter(status="published")

        # Admin & Editor → everything except drafts
        if user.role in ["ADMIN", "EDITOR"]:
            return queryset.exclude(status="draft")

        # Journalist → only their own
        if user.role == "JOURNALIST":
            return queryset.filter(author=user)

        return queryset.filter(status="published")

    def perform_create(self, serializer):

        status = self.request.data.get('status', 'review')

        article = serializer.save(
            author=self.request.user,
            status=status
        )
        if status == 'review':
            notify_editors_new_draft(article)

    def perform_update(self, serializer):

        old_status = self.get_object().status
        article = serializer.save()

        # Auto set publish date
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