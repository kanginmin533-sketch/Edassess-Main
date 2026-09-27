from rest_framework import permissions
from .models import RolePermission


class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'admin')


class IsInstructor(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'instructor')


def require_permission(perm_key):
    """
    Factory — gumagawa ng DRF permission class na tumitingin sa RolePermission
    matrix (ginagawa/binabago sa Access Control page) para sa isang partikular
    na permission key, hal. 'manageUsers', 'configureExams'. Gamitin kasabay ng
    role-based classes (IsAdmin, IsInstructor) sa isang permission_classes list —
    lahat ay kailangang pumasa (AND logic ng DRF), kaya pareho ang role AT ang
    naka-on na toggle sa Access Control ang kailangan.
    """
    class _RequiresPermission(permissions.BasePermission):
        message = f"Your role's access to '{perm_key}' has been disabled by an administrator."

        def has_permission(self, request, view):
            if not (request.user and request.user.is_authenticated):
                return False
            role_perms = RolePermission.load().permissions
            return bool(role_perms.get(request.user.role, {}).get(perm_key, False))

    return _RequiresPermission


# Pre-built instances para direktang magamit sa permission_classes lists.
CanManageUsers      = require_permission('manageUsers')
CanConfigureExams   = require_permission('configureExams')
CanViewReports       = require_permission('viewReports')
CanManageAccess      = require_permission('manageAccess')
CanManageSettings    = require_permission('manageSettings')
CanTakeExams         = require_permission('takeExams')
CanViewReviewModules = require_permission('viewReviewModules')
CanViewDashboard     = require_permission('viewDashboard')