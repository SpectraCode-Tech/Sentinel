from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.exceptions import AuthenticationFailed
from django.contrib.auth import authenticate
from django.db.models import Q
from accounts.models import User
from rest_framework import serializers
from accounts.models import User


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # 🔥 ADD ROLE TO TOKEN
        token["role"] = user.role

        return token

    def validate(self, attrs):
        username_or_email = attrs.get("username")
        password = attrs.get("password")

        if not username_or_email or not password:
            raise AuthenticationFailed("Username/email and password required")

        username_or_email = username_or_email.strip().lower()

        user = User.objects.filter(
            Q(username__iexact=username_or_email) |
            Q(email__iexact=username_or_email)
        ).first()

        if not user:
            raise AuthenticationFailed("Invalid username/email or password")

        user = authenticate(username=user.username, password=password)

        if not user:
            raise AuthenticationFailed("Invalid username/email or password")

        attrs["username"] = user.username
        return super().validate(attrs)
    
class RegisterSerializer(serializers.ModelSerializer):

    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            "username",
            "email",
            "first_name",
            "last_name",
            "password"
        ]

    def create(self, validated_data):

        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            first_name=validated_data.get("first_name"),
            last_name=validated_data.get("last_name"),
            password=validated_data["password"],
            role="READER"   # default role
        )

        return user

class UserProfileSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "role"
        ]