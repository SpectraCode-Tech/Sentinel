from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Sum
from .models import Article
from django.db import models

class JournalistDashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        if user.role != "JOURNALIST":
            return Response({"detail": "Unauthorized"}, status=403)

        articles = Article.objects.filter(author=user, is_deleted=False)

        stats = articles.aggregate(
            total_articles=Count("id"),
            draft=Count("id", filter=models.Q(status="draft")),
            review=Count("id", filter=models.Q(status="review")),
            published=Count("id", filter=models.Q(status="published")),
            total_views=Sum("view_count"),
        )

        stats["total_views"] = stats["total_views"] or 0

        return Response({
            "username": user.username,
            **stats
        })