from rest_framework.permissions import BasePermission, SAFE_METHODS

def in_group(user, group_name):
    return user.is_authenticated and user.groups.filter(name=group_name).exists()

def in_any_group(user, group_names):
    # print(user.is_authenticated)
    # print(user.groups)
    return user.is_authenticated and user.groups.filter(name__in=group_names).exists()

class OnlyAdminOrReadOnly(BasePermission):
    """
    Read: Everyone
    Write: Only users in 'Admin' group
    """
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return in_group(request.user, 'Admin')


class OnlyStaffOrReadOnly(BasePermission):
    """
    Read: Everyone
    Write: Only users in 'Staff' group
    """
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return in_group(request.user, 'Staff')


class OnlyAdmin(BasePermission):
    """
    Full access only to users in 'Admin' group
    """
    def has_permission(self, request, view):
        return in_group(request.user, 'Admin')


class OnlyStaff(BasePermission):
    """
    Full access only to users in 'Staff' group
    """
    def has_permission(self, request, view):
        return in_group(request.user, 'Staff')