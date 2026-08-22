# backend/accounts/models.py
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models


class UserManager(BaseUserManager):
    """Custom manager since we use email instead of username to log in."""

    def create_user(self, email, name, password=None, role='user'):
        if not email:
            raise ValueError('Users must have an email address.')
        if not name:
            raise ValueError('Users must have a name.')

        user = self.model(email=self.normalize_email(email), name=name, role=role)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, name, password=None):
        user = self.create_user(email=email, name=name, password=password, role='admin')
        user.is_staff = True
        user.is_superuser = True
        user.save(using=self._db)
        return user


class User(AbstractBaseUser, PermissionsMixin):
    ROLE_ADMIN = 'admin'
    ROLE_INSTRUCTOR = 'instructor'
    ROLE_STUDENT = 'user'

    ROLE_CHOICES = (
        (ROLE_ADMIN, 'Admin'),
        (ROLE_INSTRUCTOR, 'Instructor'),
        (ROLE_STUDENT, 'Student'),
    )

    email = models.EmailField(unique=True)
    name = models.CharField(max_length=255)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default=ROLE_STUDENT)

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']

    def __str__(self):
        return f'{self.name} <{self.email}> ({self.role})'
    
def default_role_permissions():
    return {
        'admin': {
            'viewDashboard': True,
            'manageUsers': True,
            'configureExams': True,
            'viewReports': True,
            'manageAccess': True,
            'manageSettings': True,
            'takeExams': False,
            'viewReviewModules': True,
        },
        'instructor': {
            'viewDashboard': True,
            'manageUsers': False,
            'configureExams': True,
            'viewReports': True,
            'manageAccess': False,
            'manageSettings': False,
            'takeExams': False,
            'viewReviewModules': True,
        },
        'user': {
            'viewDashboard': True,
            'manageUsers': False,
            'configureExams': False,
            'viewReports': False,
            'manageAccess': False,
            'manageSettings': False,
            'takeExams': True,
            'viewReviewModules': True,
        },
    }


class RolePermission(models.Model):
    """Singleton row — laging pk=1. Role permission matrix dito nakatago."""
    permissions = models.JSONField(default=default_role_permissions)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Role Permissions"
        verbose_name_plural = "Role Permissions"

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        pass

    @classmethod
    def load(cls):
        obj, _created = cls.objects.get_or_create(pk=1)
        return obj

    def __str__(self):
        return "Role Permission Matrix"
    
class SystemSettings(models.Model):
    """Singleton row — laging pk=1. Global platform settings dito nakatago."""
    systemName = models.CharField(max_length=255, default='EduAssess')
    institution = models.CharField(max_length=255, default='PRMSU — Iba Campus')
    department = models.CharField(max_length=255, default='College of Teacher Education')
    supportEmail = models.EmailField(default='support@prmsu.edu.ph')

    maintenanceMode = models.BooleanField(default=False)
    registrationOpen = models.BooleanField(default=True)
    emailNotifications = models.BooleanField(default=True)
    auditLogging = models.BooleanField(default=True)

    sessionTimeout = models.PositiveIntegerField(default=60)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "System Settings"
        verbose_name_plural = "System Settings"

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        pass

    @classmethod
    def load(cls):
        obj, _created = cls.objects.get_or_create(pk=1)
        return obj

    def __str__(self):
        return "System Settings"