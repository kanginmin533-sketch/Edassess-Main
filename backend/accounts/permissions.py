# backend/accounts/permissions.py
from django.db.models import Q
from rest_framework import permissions
from .models import (
    DEPT_CONTROLLABLE, DepartmentPermission, RolePermission, User, default_role_permissions,
)


def is_super_admin(user):
    """Admin na walang department."""
    return bool(
        user and user.is_authenticated
        and user.role == User.ROLE_ADMIN and not user.department
    )


class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'admin')


class IsInstructor(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'instructor')


class IsSuperAdmin(permissions.BasePermission):
    """Admin na walang department."""
    message = 'Only the super admin can do this.'

    def has_permission(self, request, view):
        return is_super_admin(request.user)


def admin_department(user):
    """None = super admin (lahat). 'CIT'/'CTE' = department admin."""
    return user.department if user.role == 'admin' and user.department else None


def manageable_users(admin_user):
    """Mga user na puwedeng makita/i-manage ng admin na ito."""
    qs = User.objects.all()
    dept = admin_department(admin_user)
    if dept:
        qs = qs.filter(department=dept).exclude(role=User.ROLE_ADMIN)
    return qs


def apply_dept_scope(qs, user, field='department'):
    """
    Para sa mga model na may department field (Exam, Question, Module).
    - Super admin: lahat.
    - Iba: walang department (shared) + sariling department + 'BOTH'.
    """
    if is_super_admin(user):
        return qs
    q = Q(**{f'{field}__isnull': True}) | Q(**{field: ''})
    if user.department:
        q |= Q(**{f'{field}__in': [user.department, 'BOTH']})
    return qs.filter(q)


def apply_major_scope(qs, user):
    """Student lang: Major exams/questions/modules ay para sa kapareho niyang major.
    Walang major tag (GenEd/ProfEd o lumang Major record) = bukas sa lahat ng pasok sa department scope."""
    if getattr(user, 'role', None) != User.ROLE_STUDENT:
        return qs
    q = Q(major__isnull=True) | Q(major='')
    if user.major:
        q |= Q(major=user.major)
    return qs.filter(q)


def effective_permissions(user):
    """
    Final na permission set ng user:
      - Super admin: lahat naka-on.
      - Department admin: ayon sa global matrix (RolePermission['admin']).
      - Instructor/Student: global matrix AND ang department override ng admin ng department nila.
    """
    keys = list(default_role_permissions()['admin'].keys())
    if is_super_admin(user):
        return {k: True for k in keys}

    base = RolePermission.load().permissions.get(user.role, {})
    perms = {k: bool(base.get(k, False)) for k in keys}

    if user.role in DEPT_CONTROLLABLE and user.department:
        row = DepartmentPermission.objects.filter(department=user.department).first()
        override = (row.permissions if row else {}).get(user.role, {})
        for k in DEPT_CONTROLLABLE[user.role]:
            if not override.get(k, True):
                perms[k] = False
    return perms


def require_permission(perm_key):
    """DRF permission class na tumitingin sa RolePermission matrix (Access Control page).
    Ang super admin ay laging pasok — hindi siya mai-lock out ng matrix."""
    class _RequiresPermission(permissions.BasePermission):
        message = f"Your role's access to '{perm_key}' has been disabled by the super admin."

        def has_permission(self, request, view):
            if not (request.user and request.user.is_authenticated):
                return False
            return bool(effective_permissions(request.user).get(perm_key, False))

    return _RequiresPermission


CanManageUsers       = require_permission('manageUsers')
CanConfigureExams    = require_permission('configureExams')
CanViewReports       = require_permission('viewReports')
CanManageAccess      = require_permission('manageAccess')
CanManageSettings    = require_permission('manageSettings')
CanTakeExams         = require_permission('takeExams')
CanViewReviewModules = require_permission('viewReviewModules')
CanViewDashboard     = require_permission('viewDashboard')