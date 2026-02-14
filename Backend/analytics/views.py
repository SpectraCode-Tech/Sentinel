from django.shortcuts import render
from rest_framework import viewsets
from .models import ArticleView, ReadingHistory, AdEvent
from .serializers import ArticleViewSerializer, ReadingHistorySerializer, AdEventSerializer

# Create your views here.

class ArticleViewViewSet(viewsets.ModelViewSet):
    queryset = ArticleView.objects.all()
    serializer_class = ArticleViewSerializer

class ReadingHistoryViewSet(viewsets.ModelViewSet):
    queryset = ReadingHistory.objects.all()
    serializer_class = ReadingHistorySerializer

class AdEventViewSet(viewsets.ModelViewSet):
    queryset = AdEvent.objects.all()
    serializer_class = AdEventSerializer
