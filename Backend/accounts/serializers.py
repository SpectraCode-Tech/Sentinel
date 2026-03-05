from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.exceptions import AuthenticationFailed
from django.contrib.auth import authenticate
from django.db.models import Q
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