from django.urls import path
from .views import (
    LoginView,
    RegisterView,
    LogoutView,
    MeView,
    AdminUserListView,
    AdminCreateUserView,
    RolePermissionView,
    SystemSettingsView,
)

urlpatterns = [
    path('auth/login', LoginView.as_view(), name='login'),
    path('auth/login/', LoginView.as_view()),
    path('auth/register', RegisterView.as_view(), name='register'),
    path('auth/register/', RegisterView.as_view()),
    path('auth/logout', LogoutView.as_view(), name='logout'),
    path('auth/logout/', LogoutView.as_view()),
    path('auth/me', MeView.as_view(), name='me'),
    path('auth/me/', MeView.as_view()),

    path('admin/users', AdminUserListView.as_view(), name='admin-user-list'),
    path('admin/users/', AdminUserListView.as_view()),
    path('admin/users/create', AdminCreateUserView.as_view(), name='admin-user-create'),
    path('admin/users/create/', AdminCreateUserView.as_view()),

    path('admin/role-permissions', RolePermissionView.as_view(), name='role-permissions'),
    path('admin/role-permissions/', RolePermissionView.as_view()),
    
    path('admin/settings', SystemSettingsView.as_view(), name='system-settings'),
    path('admin/settings/', SystemSettingsView.as_view()),
]