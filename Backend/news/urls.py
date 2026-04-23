from rest_framework.routers import DefaultRouter, path

from comments.views import CommentViewSet
from .admin_dashboard_views import AdminDashboardStatsView, AdminUserManagementView
from .staff_views import StaffDirectoryView
from .views import ArticleViewSet, CategoryViewSet, TagViewSet, article_og_view
from .dashboard_views import JournalistDashboardStatsView
from .editor_dashboard_views import EditorDashboardStatsView
from .admin_dashboard_views import AdminChangeUserPasswordView

router = DefaultRouter()
# In news/urls.py
router.register(r"articles", ArticleViewSet, basename="article")
router.register(r"categories", CategoryViewSet)
router.register(r"tags", TagViewSet)

urlpatterns = [
    path("articles/<int:article>/comments/", CommentViewSet.as_view({'get': 'list', 'post': 'create'})),
    path("articles/<int:article>/comments/<int:pk>/", CommentViewSet.as_view({
        'get': 'retrieve', 
        'put': 'update', 
        'patch': 'partial_update', 
        'delete': 'destroy'
    })),
    path("dashboard/journalist/", JournalistDashboardStatsView.as_view()),
    path("dashboard/editor/", EditorDashboardStatsView.as_view()),
    path("dashboard/admin/", AdminDashboardStatsView.as_view()),
    path("admin/users/", AdminUserManagementView.as_view()),
    path("admin/users/<int:user_id>/", AdminUserManagementView.as_view()),
    path('staff-directory/', StaffDirectoryView.as_view()),
    path("admin/users/<int:user_id>/change-password/", AdminChangeUserPasswordView.as_view()),
    path("og/<slug:slug>/", article_og_view)
    
]
urlpatterns += router.urls

