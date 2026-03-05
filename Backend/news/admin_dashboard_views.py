from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from accounts.models import User
from news.models import Article
from rest_framework_simplejwt.token_blacklist.models import OutstandingToken, BlacklistedToken
from rest_framework.exceptions import AuthenticationFailed
from django.contrib.auth import authenticate
from accounts.models import User

class AdminDashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != "ADMIN":
            return Response({"detail": "Unauthorized"}, status=403)

        stats = {
            "total_users": User.objects.count(),
            "journalists": User.objects.filter(role="JOURNALIST").count(),
            "editors": User.objects.filter(role="EDITOR").count(),
            "total_articles": Article.objects.filter(is_deleted=False).count(),
            "published": Article.objects.filter(status="published").count(),
            "pending": Article.objects.filter(status="review").count(),
        }

        return Response(stats)

class AdminUserManagementView(APIView):
    permission_classes = [IsAuthenticated]

    # 🔹 Check admin helper
    def _is_admin(self, request):
        return request.user.role == "ADMIN"

    # 🔹 POST — Create New User
    def post(self, request):
        if not self._is_admin(request):
            return Response({"detail": "Unauthorized"}, status=403)

        data = request.data
        username = data.get("username")
        email = data.get("email")
        password = data.get("password")
        role = data.get("role", "JOURNALIST")
        first_name = data.get("first_name", "")
        last_name = data.get("last_name", "")

        if not username or not email or not password:
            return Response({"detail": "Username, email, and password are required."}, status=400)

        if User.objects.filter(username=username).exists():
            return Response({"detail": "Username already taken."}, status=400)

        try:
            # Use create_user to handle password hashing automatically
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                first_name=first_name,
                last_name=last_name,
                role=role  # Assumes your Custom User model has a 'role' field
            )
            return Response({
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "role": user.role,
                "detail": "User created successfully"
            }, status=201)
        except Exception as e:
            return Response({"detail": str(e)}, status=400)

    # 🔹 GET — List All Users
    def get(self, request):
        if not self._is_admin(request):
            return Response({"detail": "Unauthorized"}, status=403)

        users = User.objects.all().order_by("-date_joined")

        data = [
            {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "role": user.role,
                "is_active": user.is_active,
                "date_joined": user.date_joined,
            }
            for user in users
        ]

        return Response(data)

    # 🔹 PATCH — Update Role / Status
    def patch(self, request, user_id):
        if not self._is_admin(request):
            return Response({"detail": "Unauthorized"}, status=403)

        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({"detail": "User not found"}, status=404)

        if user == request.user:
            return Response({"detail": "You cannot modify your own account."}, status=400)

        role = request.data.get("role")
        is_active = request.data.get("is_active")

        # Check if the role is actually changing
        role_changed = role and role != user.role
        
        if role:
            user.role = role
        if is_active is not None:
            user.is_active = is_active

        user.save()

        # 🚨 REMOTE LOGOUT LOGIC
        # If the role changed or the user was deactivated, kick them out
        if role_changed or is_active is False:
            tokens = OutstandingToken.objects.filter(user=user)
            for token in tokens:
                BlacklistedToken.objects.get_or_create(token=token)

        return Response({"message": "User updated and sessions invalidated."})

    # 🔹 DELETE — Remove User
    def delete(self, request, user_id):
        if not self._is_admin(request):
            return Response({"detail": "Unauthorized"}, status=403)

        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({"detail": "User not found"}, status=404)

        # 🚨 Safety: Prevent deleting yourself
        if user == request.user:
            return Response(
                {"detail": "You cannot delete your own account."},
                status=400
            )

        user.delete()

        return Response({"message": "User deleted successfully"})
    

class AdminChangeUserPasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, user_id):
        if request.user.role != "ADMIN":
            return Response({"detail": "Unauthorized"}, status=403)

        admin_password = request.data.get("admin_password")
        new_password = request.data.get("new_password")

        if not admin_password or not new_password:
            return Response(
                {"detail": "Admin password and new password required"},
                status=400
            )

        # 🔹 Verify admin password
        admin_user = authenticate(
            username=request.user.username,
            password=admin_password
        )

        if not admin_user:
            raise AuthenticationFailed("Your password is incorrect")

        # 🔹 Get target user
        try:
            target_user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({"detail": "User not found"}, status=404)

        # 🔹 Set new password securely
        target_user.set_password(new_password)
        target_user.save()

        return Response({"message": "Password updated successfully"})