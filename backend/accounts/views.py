from django.contrib.auth import get_user_model
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.tokens import RefreshToken
from .models import RolePermission, SystemSettings 
from .permissions import IsAdmin
from .serializers import RolePermissionSerializer, SystemSettingsSerializer

User = get_user_model()


def serialize_user(user):
    """Consistent user shape for all responses."""
    return {
        'id': user.id,
        'name': user.name,
        'email': user.email,
        'role': user.role,
        'status': 'active' if user.is_active else 'inactive',
        'joined': user.date_joined.strftime('%Y-%m-%d'),
    }


class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        name = request.data.get('name', '').strip()
        email = request.data.get('email', '').strip().lower()
        password = request.data.get('password', '')

        if not name or not email or not password:
            return Response(
                {'message': 'Name, email, and password are required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if User.objects.filter(email=email).exists():
            return Response(
                {'message': 'Email is already registered.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = User.objects.create_user(
            email=email, name=name, password=password, role=User.ROLE_STUDENT
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
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        users = User.objects.all().order_by('-date_joined')
        data = [serialize_user(u) for u in users]
        return Response({'users': data}, status=status.HTTP_200_OK)


class AdminCreateUserView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAdminUser]

    def post(self, request):
        name = request.data.get('name', '').strip()
        email = request.data.get('email', '').strip().lower()
        role = request.data.get('role', User.ROLE_INSTRUCTOR)
        password = request.data.get('password', '')

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

        if User.objects.filter(email=email).exists():
            return Response(
                {'message': 'Email is already registered.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = User.objects.create_user(
            email=email, name=name, password=password, role=role
        )

        # is_staff grants Django admin access; give it to instructors/admins
        if role in (User.ROLE_ADMIN, User.ROLE_INSTRUCTOR):
            user.is_staff = True
        if role == User.ROLE_ADMIN:
            user.is_superuser = True
        user.save()

        return Response({'user': serialize_user(user)}, status=status.HTTP_201_CREATED)
    
class RolePermissionView(APIView):
    """GET para makuha, PUT para i-save. Iisa lang laging config row."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAdmin]

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
    permission_classes = [IsAdmin]

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