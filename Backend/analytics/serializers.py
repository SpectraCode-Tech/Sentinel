from rest_framework import serializers
from .models import ArticleView, ReadingHistory, AdEvent

class ArticleViewSerializer(serializers.ModelSerializer):
    class Meta:
        model = ArticleView
        fields = '__all__'

class ReadingHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ReadingHistory
        fields = '__all__'

class AdEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdEvent
        fields = '__all__'
