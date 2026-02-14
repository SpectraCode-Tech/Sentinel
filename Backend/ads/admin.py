from django.contrib import admin
from .models import Advertisement, SidebarBlock

@admin.register(Advertisement)
class AdvertisementAdmin(admin.ModelAdmin):
    list_display = ('title', 'placement', 'start_date', 'end_date', 'is_active')
    list_filter = ('placement', 'is_active')
    search_fields = ('title',)

@admin.register(SidebarBlock)
class SidebarBlockAdmin(admin.ModelAdmin):
    list_display = ('title', 'block_type', 'order', 'is_active')
    list_filter = ('block_type', 'is_active')
    search_fields = ('title',)
