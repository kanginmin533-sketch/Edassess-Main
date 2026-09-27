# backend/accounts/views.py
from django.contrib.auth import get_user_model
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.tokens import RefreshToken
from .models import RolePermission, SystemSettings
from .permissions import IsAdmin, CanManageUsers, CanManageAccess, CanManageSettings
from .serializers import RolePermissionSerializer, SystemSettingsSerializer

User = get_user_model()


def serialize_user(user):
    """Consistent user shape for all responses."""
    return {
        'id': user.id,
        'name': user.name,
        'email': user.email,
        'role': user.role,
        'department': user.department,
        'status': 'active' if user.is_active else 'inactive',
        'joined': user.date_joined.strftime('%Y-%m-%d'),
    }


class RegisterView(APIView):
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        name = request.data.get('name', '').strip()
        email = request.data.get('email', '').strip().lower()
        password = request.data.get('password', '')
        department = request.data.get('department', '').strip().upper()

        if not name or not email or not password:
            return Response(
                {'message': 'Name, email, and password are required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if department not in dict(User.DEPARTMENT_CHOICES):
            return Response(
                {'message': 'Please select your college (CIT or CTE).'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if User.objects.filter(email=email).exists():
            return Response(
                {'message': 'Email is already registered.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = User.objects.create_user(
            email=email, name=name, password=password, role=User.ROLE_STUDENT, department=department
        )

        refresh = RefreshToken.for_user(user)

        return Response(
            {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': serialize_user(user),
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    # Public endpoint: skip JWT auth (see RegisterView note).
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        try:
            raw_email = request.data.get('email') or ''
            raw_password = request.data.get('password') or ''

            email = str(raw_email).strip().lower()
            password = str(raw_password)

            if not email or not password:
                return Response(
                    {'message': 'Email and password are required.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            user = User.objects.filter(email=email).first()

            if user and user.check_password(password):
                if not user.is_active:
                    return Response(
                        {'message': 'Account is inactive.'},
                        status=status.HTTP_403_FORBIDDEN,
                    )

                refresh = RefreshToken.for_user(user)

                return Response(
                    {
                        'refresh': str(refresh),
                        'access': str(refresh.access_token),
                        'user': serialize_user(user),
                    },
                    status=status.HTTP_200_OK,
                )

            return Response(
                {'message': 'Invalid credentials.'},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        except Exception as e:
            return Response(
                {'message': f'Server Error: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class LogoutView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            return Response(
                {'message': 'Successfully logged out.'},
                status=status.HTTP_200_OK,
            )
        except Exception:
            return Response(
                {'message': 'Logged out.'}, status=status.HTTP_200_OK
            )


class MeView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(serialize_user(request.user), status=status.HTTP_200_OK)


class AdminUserListView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAdminUser, CanManageUsers]

    def get(self, request):
        users = User.objects.all().order_by('-date_joined')
        data = [serialize_user(u) for u in users]
        return Response({'users': data}, status=status.HTTP_200_OK)


class AdminCreateUserView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAdminUser, CanManageUsers]

    def post(self, request):
        name = request.data.get('name', '').strip()
        email = request.data.get('email', '').strip().lower()
        role = request.data.get('role', User.ROLE_INSTRUCTOR)
        password = request.data.get('password', '')
        department = request.data.get('department')  # ← bago, 'CIT' | 'CTE' | None

        if not name or not email or not password:
            return Response(
                {'message': 'All fields are required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if role not in dict(User.ROLE_CHOICES):
            return Response(
                {'message': f'Invalid role. Must be one of: {[r[0] for r in User.ROLE_CHOICES]}'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if role == User.ROLE_INSTRUCTOR and department not in dict(User.DEPARTMENT_CHOICES):
            return Response(
                {'message': 'Department (CIT or CTE) is required for instructors.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if User.objects.filter(email=email).exists():
            return Response(
                {'message': 'Email is already registered.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = User.objects.create_user(
            email=email, name=name, password=password, role=role,
            department=department if role == User.ROLE_INSTRUCTOR else None,
        )

        if role in (User.ROLE_ADMIN, User.ROLE_INSTRUCTOR):
            user.is_staff = True
        if role == User.ROLE_ADMIN:
            user.is_superuser = True
        user.save()

        return Response({'user': serialize_user(user)}, status=status.HTTP_201_CREATED)


class RolePermissionView(APIView):
    """GET para makuha, PUT para i-save. Iisa lang laging config row."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAdmin, CanManageAccess]

    def get(self, request):
        obj = RolePermission.load()
        serializer = RolePermissionSerializer(obj)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request):
        obj = RolePermission.load()
        serializer = RolePermissionSerializer(obj, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)


class SystemSettingsView(APIView):
    """GET para makuha, PUT para i-save. Iisa lang laging config row."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAdmin, CanManageSettings]

    def get(self, request):
        obj = SystemSettings.load()
        serializer = SystemSettingsSerializer(obj)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request):
        obj = SystemSettings.load()
        serializer = SystemSettingsSerializer(obj, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)


class AdminUserDetailView(APIView):
    """GET (single), PUT (update), DELETE — para sa isang user, admin-only."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAdminUser, CanManageUsers]

    def get_object(self, pk):
        try:
            return User.objects.get(pk=pk)
        except User.DoesNotExist:
            return None

    def get(self, request, pk):
        user = self.get_object(pk)
        if not user:
            return Response({'message': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(serialize_user(user), status=status.HTTP_200_OK)

    def put(self, request, pk):
        user = self.get_object(pk)
        if not user:
            return Response({'message': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

        name = request.data.get('name', user.name).strip()
        email = request.data.get('email', user.email).strip().lower()
        role = request.data.get('role', user.role)
        department = request.data.get('department', user.department)
        password = request.data.get('password', '')

        if role not in dict(User.ROLE_CHOICES):
            return Response(
                {'message': f'Invalid role. Must be one of: {[r[0] for r in User.ROLE_CHOICES]}'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if role == User.ROLE_INSTRUCTOR and department not in dict(User.DEPARTMENT_CHOICES):
            return Response(
                {'message': 'Department (CIT or CTE) is required for instructors.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if User.objects.filter(email=email).exclude(pk=user.pk).exists():
            return Response(
                {'message': 'Email is already registered to another account.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.name = name
        user.email = email
        user.role = role
        user.department = department if role == User.ROLE_INSTRUCTOR else None

        if role in (User.ROLE_ADMIN, User.ROLE_INSTRUCTOR):
            user.is_staff = True
        if role == User.ROLE_ADMIN:
            user.is_superuser = True

        if password:
            user.set_password(password)

        user.save()

        return Response({'user': serialize_user(user)}, status=status.HTTP_200_OK)

    def delete(self, request, pk):
        user = self.get_object(pk)
        if not user:
            return Response({'message': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

        if user.pk == request.user.pk:
            return Response(
                {'message': 'You cannot delete your own account.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.delete()
        return Response({'message': 'User deleted.'}, status=status.HTTP_200_OK)


class AdminUserStatusView(APIView):
    """PATCH lang — para sa toggle ng active/inactive status."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAdminUser, CanManageUsers]

    def patch(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({'message': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

        new_status = request.data.get('status')
        if new_status not in ('active', 'inactive'):
            return Response(
                {'message': "Status must be 'active' or 'inactive'."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if user.pk == request.user.pk and new_status == 'inactive':
            return Response(
                {'message': 'You cannot deactivate your own account.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.is_active = (new_status == 'active')
        user.save()

        return Response(serialize_user(user), status=status.HTTP_200_OK)

class MyPermissionsView(APIView):
    """
    Kahit sinong naka-login ay makakakuha ng sariling permission set (batay sa
    role nila) mula sa RolePermission matrix — ginagamit ng AdminLayout at
    InstructorLayout para itago/i-disable ang mga nav item na naka-off.
    Hindi ito para sa pag-edit ng buong matrix (RolePermissionView pa rin ang
    admin-only na 'yon) — read-only, sarili lang.
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        role_perms = RolePermission.load().permissions
        return Response(role_perms.get(request.user.role, {}), status=status.HTTP_200_OK)