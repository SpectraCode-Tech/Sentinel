from django.contrib import admin
from django.urls import path, include, re_path
from accounts.views import CustomLoginView
from rest_framework_simplejwt.views import TokenRefreshView
from django.conf import settings
from django.conf.urls.static import static

from news.views import weekly_newsletter, article_detail_seo

urlpatterns = [
    path("admin/", admin.site.urls),

    # Auth
    path("api/token/", CustomLoginView.as_view()),
    path("api/token/refresh/", TokenRefreshView.as_view()),
    path("api/users/", include("accounts.urls")),

    # APIs
    path("api/", include("news.urls")),
    path("api/ads/", include("ads.urls")),
    path("api/analytics/", include("analytics.urls")),

    path("api/weekly-newsletter/", weekly_newsletter),

    # ✅ SEO ARTICLE ROUTE
    path("articles/<slug:slug>/", article_detail_seo),
]

# ✅ Catch-all (but exclude static files)
urlpatterns += [
    re_path(
        r'^(?!api/|admin/|assets/|media/|favicon\.ico).*$',
        article_detail_seo
    ),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)