from rest_framework import serializers
from .models import Article, Category, Tag


class ArticleSerializer(serializers.ModelSerializer):
    author_username = serializers.ReadOnlyField(source="author.username")

    class Meta:
        model = Article
        fields = "__all__"
        read_only_fields = ["slug", "view_count"]
