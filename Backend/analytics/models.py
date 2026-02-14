from django.db import models
from news.models import Article
from accounts.models import User

class ArticleView(models.Model):
    article = models.ForeignKey(Article, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    ip = models.GenericIPAddressField(null=True, blank=True)
    device = models.CharField(max_length=255, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user or 'Anonymous'} viewed {self.article.title} at {self.timestamp}"


class AdEvent(models.Model):
    EVENT_CHOICES = (
        ('impression','Impression'),
        ('click','Click')
    )
    ad = models.ForeignKey('ads.Advertisement', on_delete=models.CASCADE)
    event_type = models.CharField(max_length=20, choices=EVENT_CHOICES)
    page = models.CharField(max_length=50, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.event_type} on {self.ad} at {self.timestamp}"


class ReadingHistory(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    article = models.ForeignKey(Article, on_delete=models.CASCADE)
    time_spent = models.IntegerField(default=0)  # in seconds
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user} spent {self.time_spent}s on {self.article.title}"
