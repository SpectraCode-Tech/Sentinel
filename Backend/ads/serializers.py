from rest_framework import serializers
from .models import Advertisement, SidebarBlock

class AdvertisementSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(use_url=True, required=False, allow_null=True)
    class Meta:
        model = Advertisement
        fields = '__all__'

class SidebarBlockSerializer(serializers.ModelSerializer):
    class Meta:
        model = SidebarBlock
        fields = '__all__'
