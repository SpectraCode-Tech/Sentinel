from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import CustomTokenObtainPairSerializer
from rest_framework import generics
from rest_framework.permissions import AllowAny
from .serializers import RegisterSerializer
from accounts.models import User
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .serializers import UserProfileSerializer


class CustomLoginView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    
class RegisterView(generics.CreateAPIView):

    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]
    
class UserProfileView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        serializer = UserProfileSerializer(request.user)

        return Response(serializer.data)