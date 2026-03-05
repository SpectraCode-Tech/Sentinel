from django.contrib.auth import get_user_model
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Article
from .serializers import ArticleSerializer

User = get_user_model()

class StaffDirectoryView(APIView):
    def get(self, request):
        # Get all journalists
        journalists = User.objects.filter(role="JOURNALIST", is_active=True)
        data = []
        
        for j in journalists:
            # Get their published articles
            articles = Article.objects.filter(author=j, status="published", is_deleted=False)
            data.append({
                "id": j.id,
                "username": j.username,
                "first_name": j.first_name,
                "last_name": j.last_name,
                "email": j.email,
                "article_count": articles.count(),
                "articles": ArticleSerializer(articles, many=True).data
            })
        
        return Response(data)