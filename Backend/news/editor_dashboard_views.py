from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count
from django.utils import timezone
from django.db import models
from accounts.models import User
from .models import Article


class EditorDashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        if user.role not in ["EDITOR", "ADMIN"]:
            return Response({"detail": "Unauthorized"}, status=403)

        stats = Article.objects.filter(is_deleted=False).aggregate(
            pending_review=Count(
                "id",
                filter=models.Q(status="review")
            ),
            total_published=Count(
                "id",
                filter=models.Q(status="published")
            )
        )

        active_journalists = User.objects.filter(
            role="JOURNALIST",
            is_active=True
        ).count()

        return Response({
            "username": user.username,
            "pending_review": stats["pending_review"],
            "total_published": stats["total_published"],
            "active_journalists": active_journalists
        })