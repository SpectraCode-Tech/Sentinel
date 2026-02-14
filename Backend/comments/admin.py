from django.contrib import admin
from .models import Comment

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('author_name', 'user', 'article', 'status', 'created_at')
    list_filter = ('status',)
    search_fields = ('author_name', 'content')
