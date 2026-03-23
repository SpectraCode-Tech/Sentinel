from datetime import timedelta
from django.utils import timezone
from django.contrib.auth import get_user_model

from rest_framework import viewsets, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from analytics.models import ReadingHistory
from .models import Article, Category, Tag, ArticleView
from .serializers import ArticleSerializer, CategorySerializer, TagSerializer
from .utils import get_client_ip
from utils.email import send_email_async

User = get_user_model()

class ArticleViewSet(viewsets.ModelViewSet):
    serializer_class = ArticleSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    lookup_field = 'slug'

    filterset_fields = {
        'status': ['exact'],
        'category__slug': ['exact'],
    }

    search_fields = ['title', 'content', 'excerpt', 'category__name']

    def get_queryset(self):
        queryset = Article.objects.filter(is_deleted=False).order_by('-publish_at')
        
        author_id = self.request.query_params.get("author")
        if author_id:
            queryset = queryset.filter(author_id=author_id)

        user = self.request.user
        if not user.is_authenticated:
            return queryset.filter(status="published")

        if user.role in ["ADMIN", "EDITOR"]:
            return queryset.exclude(status="draft")

        if user.role == "JOURNALIST":
            return queryset.filter(author=user)

        return queryset.filter(status="published")

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

    def perform_create(self, serializer):
        status = self.request.data.get('status', 'review')
        article = serializer.save(
            author=self.request.user,
            status=status
        )

        if status == "review":
            editor_emails = User.objects.filter(role="EDITOR").exclude(email="").values_list('email', flat=True)
            if editor_emails:
                send_email_async(
                    subject="New Article Submission",
                    message=f"A new article '{article.title}' has been submitted for review by {self.request.user.username}.",
                    recipient_list=list(editor_emails)
                )

    def perform_update(self, serializer):
        # Capture old status before saving
        old_status = self.get_object().status
        article = serializer.save()

        # 1. Automatic Timestamping for Publishing
        if article.status == "published" and not article.publish_at:
            article.publish_at = timezone.now()
            article.save(update_fields=['publish_at'])

        # 2. Status Change Notifications
        if old_status != article.status and article.author.email:
            if article.status == "published":
                send_email_async(
                    subject="Article Approved 🎉",
                    message=f"Your article '{article.title}' has been approved and published on The Sentinel.",
                    recipient_list=[article.author.email]
                )
            elif article.status == "rejected":
                send_email_async(
                    subject="Update on your Submission",
                    message=f"Your article '{article.title}' was reviewed and is currently not accepted for publication.",
                    recipient_list=[article.author.email]
                )

        # 3. Manual Publication of Scheduled items
        if article.status == "scheduled" and article.publish_at:
            if article.publish_at <= timezone.now():
                article.status = "published"
                article.save(update_fields=['status'])

    @action(detail=False, methods=['get'])
    def recommendations(self, request):
        user = request.user
        base_queryset = Article.objects.filter(status="published", is_deleted=False)
        exclude_id = request.query_params.get('exclude')

        if not user.is_authenticated:
            recommendations = base_queryset.order_by('?')[:4]
        else:
            liked_categories = ReadingHistory.objects.filter(
                user=user,
                time_spent__gt=1
            ).values_list('article__category', flat=True).distinct()

            recommendations = base_queryset.filter(category__in=liked_categories)
            if exclude_id:
                recommendations = recommendations.exclude(id=exclude_id)
            
            recommendations = list(recommendations.order_by('?')[:4])

            if len(recommendations) < 4:
                existing_ids = [a.id for a in recommendations]
                if exclude_id:
                    try:
                        existing_ids.append(int(exclude_id))
                    except (ValueError, TypeError):
                        pass
                
                extra_needed = 4 - len(recommendations)
                extra = base_queryset.exclude(id__in=existing_ids).order_by('?')[:extra_needed]
                recommendations.extend(list(extra))

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

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]

class TagViewSet(viewsets.ModelViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [permissions.AllowAny]