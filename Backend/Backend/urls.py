from django.contrib import admin
from django.urls import path, include
from accounts.views import CustomLoginView
from rest_framework_simplejwt.views import TokenRefreshView
from django.conf import settings
from django.conf.urls.static import static
from news.views import weekly_newsletter

urlpatterns = [
    path("admin/", admin.site.urls),

    # Auth
    path("api/token/", CustomLoginView.as_view()),
    path("api/token/refresh/", TokenRefreshView.as_view()),
    path("api/users/", include("accounts.urls")),

    # News
    path("api/", include("news.urls")),

    # Ads
    path("api/ads/", include("ads.urls")),
    
    #Analytics
    path("api/analytics/", include("analytics.urls")),
    
    path("api/weekly-newsletter/", weekly_newsletter, name="newsletter-trigger"),
]



urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)