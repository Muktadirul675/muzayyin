from django.urls import path
from .views import RegisterView, UserRolesView,ChangeUserPassword, LogoutView, csrf_token_view, UserListWithGroupsView, CurrentUserView, MakeStaffView, RemoveStaffView
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('csrf/', csrf_token_view, name='csrf'),
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('users/', UserListWithGroupsView.as_view(), name='user-list-with-groups'),
    path('user/', CurrentUserView.as_view(), name='current-user'),
    path('users/<int:user_id>/make-staff/', MakeStaffView.as_view(), name='make-staff'),
    path('users/<int:user_id>/remove-staff/', RemoveStaffView.as_view(), name='remove-staff'),
    path('users/roles', UserRolesView.as_view(), name='user-roles'),
    path('user/change-password', ChangeUserPassword.as_view(), name='user-change-password'),
]
