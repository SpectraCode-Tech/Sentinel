from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Advertisement, SidebarBlock
from .serializers import AdvertisementSerializer, SidebarBlockSerializer

class AdvertisementViewSet(viewsets.ModelViewSet):
    queryset = Advertisement.objects.all()
    serializer_class = AdvertisementSerializer

    # This custom action provides the placement choices to the React frontend
    @action(detail=False, methods=['get'], url_path='placements')
    def get_placements(self, request):
        """
        Returns a list of valid placement options defined in the Advertisement model.
        """
        # This assumes you have a 'Placement' TextChoices or choices tuple in your model
        # If your model uses choices=Placement.choices:
        choices = [
            {"value": value, "label": label} 
            for value, label in Advertisement.Placement.choices
        ]
        return Response(choices)

class SidebarBlockViewSet(viewsets.ModelViewSet):
    queryset = SidebarBlock.objects.all()
    serializer_class = SidebarBlockSerializer