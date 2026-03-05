from django.contrib import admin
from django.urls import path, include
from accounts.views import CustomLoginView
from rest_framework_simplejwt.views import TokenRefreshView
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path("admin/", admin.site.urls),

    # Auth
    path("api/token/", CustomLoginView.as_view()),
    path("api/token/refresh/", TokenRefreshView.as_view()),

    # News
    path("api/articles/", include("news.urls")),

    # Ads
    path("api/ads/", include("ads.urls")),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)