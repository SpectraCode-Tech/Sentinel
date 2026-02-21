from rest_framework.routers import DefaultRouter
from .views import ArticleViewSet, CategoryViewSet

router = DefaultRouter()
router.register(r'', ArticleViewSet, basename='article')
router.register(r'categories', CategoryViewSet)

urlpatterns = router.urls
