from django.db import models
from django.utils.text import slugify
from django.utils import timezone
from django.conf import settings


class Category(models.Model):
    name = models.CharField(max_length=120)
    slug = models.SlugField(unique=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Tag(models.Model):
    name = models.CharField(max_length=80, unique=True)

    def __str__(self):
        return self.name


class Article(models.Model):

    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        PUBLISHED = "published", "Published"
        SCHEDULED = "scheduled", "Scheduled"

    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="articles"
    )

    title = models.CharField(max_length=255)
    slug = models.SlugField(unique=True, blank=True)

    content = models.TextField()
    excerpt = models.TextField(blank=True)

    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        related_name="articles"
    )

    tags = models.ManyToManyField(Tag, blank=True)

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.DRAFT
    )

    publish_at = models.DateTimeField(null=True, blank=True)

    view_count = models.PositiveIntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # ✅ auto slug
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)

        # ✅ auto publish if scheduled time reached
        if self.status == "scheduled" and self.publish_at:
            if self.publish_at <= timezone.now():
                self.status = "published"

        super().save(*args, **kwargs)

    def __str__(self):
        return self.title
