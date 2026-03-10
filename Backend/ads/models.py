from django.db import models
from news.models import Article

from django.db import models

class Advertisement(models.Model):
    class Placement(models.TextChoices):
        HEADER = 'header', 'Header Banner'
        SIDEBAR = 'sidebar', 'Sidebar Card'
        ARTICLE = 'article', 'Inline Article'
        FOOTER = 'footer', 'Footer Wide'

    title = models.CharField(max_length=255)
    placement = models.CharField(
        max_length=20, 
        choices=Placement.choices, 
        default=Placement.SIDEBAR
    )
    image = models.ImageField(upload_to='ads/')
    link = models.URLField()
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    priority = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    target_page = models.CharField(max_length=50, default='all')  # home, category, article, all

    def __str__(self):
        return self.title
class SidebarBlock(models.Model):
    BLOCK_TYPES = [
        ('trending', 'Trending News'),
        ('newsletter', 'Newsletter Subscription'),
        ('social', 'Social Media Links'),
        ('html', 'Custom HTML/Text'),
        ('categories', 'Category List'),
    ]

    title = models.CharField(max_length=100)
    block_type = models.CharField(max_length=20, choices=BLOCK_TYPES, default='html')
    content = models.TextField(blank=True, help_text="Used for Custom HTML or Text blocks")
    order = models.PositiveIntegerField(default=0, help_text="Lower numbers appear first")
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.title} ({self.block_type})"