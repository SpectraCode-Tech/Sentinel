from django.contrib import admin
from .models import ArticleView, AdEvent, ReadingHistory

@admin.register(ArticleView)
class ArticleViewAdmin(admin.ModelAdmin):
    list_display = ('article', 'user', 'ip', 'device', 'timestamp')
    list_filter = ('timestamp', 'article')
    search_fields = ('article__title', 'user__username', 'ip')

@admin.register(AdEvent)
class AdEventAdmin(admin.ModelAdmin):
    list_display = ('ad', 'event_type', 'page', 'timestamp')
    list_filter = ('event_type', 'page', 'timestamp')
    search_fields = ('ad__title',)

@admin.register(ReadingHistory)
class ReadingHistoryAdmin(admin.ModelAdmin):
    list_display = ('user', 'article', 'time_spent', 'timestamp')
    list_filter = ('timestamp', 'article')
    search_fields = ('article__title', 'user__username')
