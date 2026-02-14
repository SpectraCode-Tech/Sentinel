from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('articles/', include('news.urls')),  # <-- added trailing slash
    path('ads/', include('ads.urls')),
    path('comments/', include('comments.urls')),
    path('analytics/', include('analytics.urls')),
    path('api/token/', TokenObtainPairView.as_view()),
    path('api/token/refresh/', TokenRefreshView.as_view()),
]
