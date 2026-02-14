from rest_framework import routers
from .views import ArticleViewViewSet, ReadingHistoryViewSet, AdEventViewSet

router = routers.DefaultRouter()
router.register(r'article-views', ArticleViewViewSet)
router.register(r'reading-history', ReadingHistoryViewSet)
router.register(r'ad-events', AdEventViewSet)

urlpatterns = router.urls
