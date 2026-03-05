from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    username = models.CharField(max_length=150, unique=True)
    email = models.EmailField(unique=True)

    class Roles(models.TextChoices):
        ADMIN = "ADMIN", "Admin"
        EDITOR = "EDITOR", "Editor"
        JOURNALIST = "JOURNALIST", "Journalist"
        READER = "READER", "Reader"

    role = models.CharField(
        max_length=20,
        choices=Roles.choices,
        default=Roles.READER
    )

    def __str__(self):
        return self.username