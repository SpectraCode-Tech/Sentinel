from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager

# Create your models here.


class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = "ADMIN", "Admin"
        DOCTOR = "DOCTOR", "Doctor"
        PATIENT = "PATIENT", "Patient"

    base_role = Role.ADMIN

    role = models.CharField(max_length=50, choices=Role.choices)

    def save(self, *args, **kwargs):
        if not self.pk:
            self.role = self.base_role
        return super().save(*args, **kwargs)


class DoctorManager(BaseUserManager):
    def get_queryset(self, *args, **kwargs):
        users = super().get_queryset(*args, **kwargs)
        return users.filter(role=User.Role.DOCTOR)


class Doctor(User):
    base_role = User.Role.DOCTOR
    object = DoctorManager()

    class Meta:
        proxy = True

    def welcome(self):
        return f"Welcome {self.first_name}"


class PatientManager(BaseUserManager):
    def get_queryset(self, *args, **kwargs):
        users = super().get_queryset(*args, **kwargs)
        return users.filter(role=User.Role.PATIENT)


class Patient(User):
    base_role = User.Role.PATIENT
    object = PatientManager()

    class Meta:
        proxy = True

    def welcome(self):
        return f"Welcome {self.first_name}"
    
class PatientProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    