from django.contrib import admin
from django.urls import path, include, re_path
from accounts.views import CustomLoginView
from rest_framework_simplejwt.views import TokenRefreshView
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView
from news.views import weekly_newsletter, article_detail_seo

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
    
    path("articles/<slug:slug>/", article_detail_seo, name="article_detail_seo"),
    
    re_path(r'^.*$', TemplateView.as_view(template_name="index.html")),
]



urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)