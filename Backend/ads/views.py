from django.shortcuts import render
from rest_framework import viewsets
from .models import Advertisement, SidebarBlock
from .serializers import AdvertisementSerializer, SidebarBlockSerializer
# Create your views here.


class AdvertisementViewSet(viewsets.ModelViewSet):
    queryset = Advertisement.objects.all()
    serializer_class = AdvertisementSerializer

class SidebarBlockViewSet(viewsets.ModelViewSet):
    queryset = SidebarBlock.objects.all()
    serializer_class = SidebarBlockSerializer
