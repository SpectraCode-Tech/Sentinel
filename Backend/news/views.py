from datetime import timedelta
import os
from django.conf import settings
from django.utils import timezone
from django.contrib.auth import get_user_model
from django.http import JsonResponse
from django.core.management import call_command

from rest_framework import viewsets, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from analytics.models import ReadingHistory
from .models import Article, Category, Tag, ArticleView
from .serializers import ArticleSerializer, CategorySerializer, TagSerializer
from .utils import get_client_ip
from utils.email import send_email
from django.db.models import Count

import re
from django.shortcuts import get_object_or_404
from django.http import HttpResponse

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
                send_email(
                    subject="New Article Submission",
                    message=f"A new article '{article.title}' has been submitted for review by {self.request.user.username}.",
                    recipient_list=list(editor_emails)
                )

    def perform_update(self, serializer):
        old_status = self.get_object().status
        article = serializer.save()

        # 1. Automatic Timestamping
        if article.status == "published" and not article.publish_at:
            article.publish_at = timezone.now()
            article.save(update_fields=['publish_at'])

        # 2. Author Notifications
        if old_status != article.status and article.author.email:
            if article.status == "published":
                send_email(
                    subject="Article Approved 🎉",
                    message=f"Your article '{article.title}' is now live on The Sentinel.",
                    recipient_list=[article.author.email]
                )
            elif article.status == "rejected":
                send_email(
                    subject="Update on your Submission",
                    message=f"Your article '{article.title}' was reviewed and is not accepted for publication.",
                    recipient_list=[article.author.email]
                )

        # 3. Handle Scheduled items
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
                    except (ValueError, TypeError): pass
                
                extra = base_queryset.exclude(id__in=existing_ids).order_by('?')[:(4 - len(recommendations))]
                recommendations.extend(list(extra))

        serializer = self.get_serializer(recommendations, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def trending(self, request):
        # 1. Define the "Trending" window (e.g., last 7 days)
        time_threshold = timezone.now() - timedelta(days=7)

        # 2. Query articles based on RECENT views, not publish date
        trending = (
            Article.objects.filter(
                status="published",
                is_deleted=False,
                # This looks at the 'viewed_at' timestamp inside the ArticleView model
                ip_views__viewed_at__gte=time_threshold 
            )
            .annotate(recent_view_count=Count('ip_views', distinct=True))
            .order_by('-recent_view_count')[:5]
        )

        # 3. Fallback: If no one read anything in 7 days, show the most popular of all time
        if not trending.exists():
            trending = Article.objects.filter(
                status="published", 
                is_deleted=False
            ).order_by('-view_count')[:5]

        return Response(self.get_serializer(trending, many=True).data)



def weekly_newsletter(request):
    """
    Instead of rewriting the logic, just trigger the 
    Management Command we already fixed!
    """
    key = os.environ.get("NEWSLETTER_KEY")
    if not key or request.GET.get("key") != key:
        return JsonResponse({"error": "Unauthorized"}, status=403)

    try:
        # This runs the 'py manage.py send_weekly_news' logic
        call_command('send_weekly_news') 
        return JsonResponse({"message": "Newsletter command triggered successfully."})
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
# --- Simple ViewSets ---

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]

class TagViewSet(viewsets.ModelViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [permissions.AllowAny]
    
    
def article_detail_seo(request, slug):
    article = get_object_or_404(
        Article,
        slug=slug,
        is_deleted=False,
        status="published"
    )

    # --- Metadata ---
    title = f"{article.title} | The Sentinel - Your Source for News"

    clean_description = re.sub(r'<[^>]+>', '', article.content or "")
    clean_description = re.sub(r'\s+', ' ', clean_description).strip()

    description = (
        article.excerpt
        if article.excerpt
        else (clean_description[:155] + "...")
    )

    if article.image:
        image_url = request.build_absolute_uri(article.image.url)
    else:
        image_url = request.build_absolute_uri(
            settings.STATIC_URL + "og-default.jpg"
        )

    canonical_url = request.build_absolute_uri()
    
    # FIX: These were under-indented (4 spaces needed)
    possible_paths = [
        os.path.join(settings.BASE_DIR, 'dist', 'index.html'),           # default
        os.path.join(settings.BASE_DIR, 'Frontend', 'dist', 'index.html'),
        os.path.join(settings.BASE_DIR, 'static', 'index', 'index.html')
    ]

    index_path = next((p for p in possible_paths if os.path.exists(p)), None)

    if not index_path:
        looked_in = ", ".join(possible_paths)
        return HttpResponse(f"Frontend build not found. Looked in: {looked_in}", status=500)

    try:
        with open(index_path, 'r', encoding='utf-8') as f:
            html_content = f.read()

        # IMPORTANT: Add the asset path fix here to avoid the 404/MIME errors we discussed
        html_content = html_content.replace('href="assets/', 'href="/assets/')
        html_content = html_content.replace('src="assets/', 'src="/assets/')

        # --- Replace placeholders ---
        html_content = html_content.replace('__TITLE__', title)
        html_content = html_content.replace('__DESCRIPTION__', description)
        html_content = html_content.replace('__IMAGE__', image_url)
        html_content = html_content.replace('__URL__', canonical_url)

        response = HttpResponse(html_content, content_type="text/html")
        response["Cache-Control"] = "no-cache"

        return response

    except FileNotFoundError:
        return HttpResponse("Frontend build not found.", status=500)