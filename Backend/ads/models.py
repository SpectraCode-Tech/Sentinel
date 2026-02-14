from django.db import models
from news.models import Article

class Advertisement(models.Model):
    PLACEMENTS = (
        ('header', 'Header'),
        ('sidebar', 'Sidebar'),
        ('article', 'Article'),
        ('footer', 'Footer'),
    )

    title = models.CharField(max_length=100)
    image = models.ImageField(upload_to='ads/')
    link = models.URLField()
    placement = models.CharField(max_length=20, choices=PLACEMENTS)
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    priority = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    target_page = models.CharField(max_length=50, default='all')  # home, category, article, all

    def __str__(self):
        return self.title

class SidebarBlock(models.Model):
    BLOCK_TYPES = (
        ('ad', 'Advertisement'),
        ('trending', 'Trending News'),
        ('html', 'Custom HTML'),
        ('category_list', 'Category List'),
    )

    title = models.CharField(max_length=100)
    block_type = models.CharField(max_length=20, choices=BLOCK_TYPES)
    ad = models.ForeignKey(Advertisement, on_delete=models.SET_NULL, null=True, blank=True)
    order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    target_page = models.CharField(max_length=50, default='all')  # home, category, article

    def __str__(self):
        return f"{self.title} ({self.block_type})"
