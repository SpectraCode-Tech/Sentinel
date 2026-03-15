# routing.py
from django.urls import re_path
from .consumers import CommentConsumer

websocket_urlpatterns = [
    # Remove any extra prefixes if they aren't in your frontend URL
    # This matches: wss://sentinel-ou6m.onrender.com/ws/articles/89/comments/
    re_path(r'^ws/articles/(?P<article_id>\d+)/comments/$', CommentConsumer.as_asgi()),
]