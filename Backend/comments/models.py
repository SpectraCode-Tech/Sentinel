# comments/models.py
from django.conf import settings
from django.db import models
from django.utils import timezone

class Comment(models.Model):
    # The article this comment belongs to
    article = models.ForeignKey(
        'news.Article',             # Points to your Article model
        on_delete=models.CASCADE,
        related_name='comments'     # unified related_name, no clashes
    )

    # The user who made the comment (optional for anonymous comments)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name='comments'
    )

    # Name for anonymous commenters
    author_name = models.CharField(max_length=100, blank=True, null=True)

    # Comment content
    content = models.TextField()

    # Nested replies (self-referential)
    parent = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        blank=True,
        null=True,
        related_name='replies'
    )

    # Likes / reports
    likes = models.PositiveIntegerField(default=0)
    reports = models.PositiveIntegerField(default=0)

    # Status: published / pending moderation
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')

    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']  # newest first

    def __str__(self):
        return f"Comment by {self.user or self.author_name} on {self.article.title}"
