# routing.py
from django.urls import re_path
from .consumers import CommentConsumer

websocket_urlpatterns = [
    # Fixed: article_id now comes BEFORE comments
    re_path(r'^ws/articles/(?P<article_id>\d+)/comments/$', CommentConsumer.as_asgi()),
]