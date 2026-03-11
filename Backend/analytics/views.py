from django.shortcuts import render
from rest_framework import viewsets
from .models import ArticleView, ReadingHistory, AdEvent
from .serializers import ArticleViewSerializer, ReadingHistorySerializer, AdEventSerializer

# Create your views here.

class ArticleViewViewSet(viewsets.ModelViewSet):
    queryset = ArticleView.objects.all()
    serializer_class = ArticleViewSerializer
    
    # In your Django views.py
    def perform_create(self, serializer):
        # Automatically grab the IP and User from the request headers
        ip = self.request.META.get('REMOTE_ADDR')
        user = self.request.user if self.request.user.is_authenticated else None
        serializer.save(user=user, ip=ip)

class ReadingHistoryViewSet(viewsets.ModelViewSet):
    queryset = ReadingHistory.objects.all()
    serializer_class = ReadingHistorySerializer

class AdEventViewSet(viewsets.ModelViewSet):
    queryset = AdEvent.objects.all()
    serializer_class = AdEventSerializer
