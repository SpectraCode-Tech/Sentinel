# ads/urls.py (or your main urls.py)
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AdvertisementViewSet, SidebarBlockViewSet

router = DefaultRouter()
router.register(r'advertisements', AdvertisementViewSet)
router.register(r'sidebar-blocks', SidebarBlockViewSet)

urlpatterns = [
    path('', include(router.urls)),
]