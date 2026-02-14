from rest_framework import routers
from .views import AdvertisementViewSet, SidebarBlockViewSet

router = routers.DefaultRouter()
router.register(r'advertisements', AdvertisementViewSet)
router.register(r'sidebar-blocks', SidebarBlockViewSet)

urlpatterns = router.urls
