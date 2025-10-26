from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import login, logout
from .serializers import RegisterSerializer, LoginSerializer
from django.contrib.auth.models import User
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser  # Optional
from django.contrib.auth.models import User
from .serializers import UserWithGroupsSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import AllowAny
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from django.contrib.auth.models import User, Group
from rest_framework import status
from rest_framework import status
from django.contrib.auth.models import User


class MakeStaffView(APIView):
    def post(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
            staff_group, created = Group.objects.get_or_create(name='Staff')
            user.groups.add(staff_group)
            return Response({"message": f"{user.username} is now a staff."})
        except User.DoesNotExist:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)


class RemoveStaffView(APIView):
    def post(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
            staff_group = Group.objects.get(name='Staff')
            user.groups.remove(staff_group)
            return Response({"message": f"{user.username} is no longer a staff."})
        except User.DoesNotExist:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)
        except Group.DoesNotExist:
            return Response({"error": "Staff group not found."}, status=status.HTTP_400_BAD_REQUEST)


class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserWithGroupsSerializer(request.user)
        return Response(serializer.data)

class UserListWithGroupsView(APIView):
    # Optional: restrict to admin
    # permission_classes = [IsAdminUser]

    def get(self, request):
        users = User.objects.prefetch_related('groups').all()
        serializer = UserWithGroupsSerializer(users, many=True)
        return Response(serializer.data)
    
@ensure_csrf_cookie
@authentication_classes([SessionAuthentication])
@permission_classes([AllowAny])
@api_view(['GET'])
def csrf_token_view(request):
    return Response({"message": "CSRF cookie set"})

class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({"message": "User registered"}, status=201)
        return Response(serializer.errors, status=400)

class LoginView(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            login(request, user)
            user_data = UserWithGroupsSerializer(user).data
            return Response({
                "message": "Logged in successfully",
                "user": user_data
            })
        return Response(serializer.errors, status=400)


class LogoutView(APIView):
    def post(self, request):
        logout(request)
        return Response({"message": "Logged out"})

class UserRolesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        roles = request.user.groups.values_list('name', flat=True)
        return Response({"roles": list(roles)})
    
class ChangeUserPassword(APIView):
    def post(self, request):
        user_id = request.query_params.get('user_id')
        new_password = request.data.get('new_password')

        if not user_id or not new_password:
            return Response(
                {"detail": "user_id and new_password are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response(
                {"detail": "User not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        # Set new password directly
        user.set_password(new_password)
        user.save()

        return Response({"detail": "Password updated successfully."}, status=status.HTTP_200_OK)
