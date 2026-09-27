# 📁 backend/modules/views.py
from django.db.models import Q
from rest_framework import generics, permissions, parsers
from accounts.models import User
from .models import Module
from .serializers import ModuleSerializer
from accounts.permissions import IsInstructor, CanViewReviewModules
from .models import Announcement
from .serializers import AnnouncementSerializer


class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Staff (admin/instructor) ang puwedeng mag-upload/delete anumang oras.
    Para sa read (GET), kailangan pa ring naka-on ang 'viewReviewModules'
    toggle para sa role ng humihiling — kaya hindi lang basta is_staff check,
    tumitingin din sa RolePermission matrix.
    """

    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        if request.method in permissions.SAFE_METHODS:
            return CanViewReviewModules().has_permission(request, view)
        return request.user.is_staff


class ModuleListCreateView(generics.ListCreateAPIView):
    """GenEd/ProfEd modules (department=None) = shared sa lahat.
    Major modules (department set) = makikita lang ng kaparehas na department."""
    serializer_class = ModuleSerializer
    permission_classes = [IsAdminOrReadOnly]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser]

    def get_queryset(self):
        user = self.request.user
        qs = Module.objects.all()
        if user.role == User.ROLE_ADMIN:
            return qs
        return qs.filter(Q(department__isnull=True) | Q(department=user.department))

    def get_serializer_context(self):
        return {'request': self.request}

    def perform_create(self, serializer):
        category = serializer.validated_data.get('category')
        department = self.request.user.department if category == 'Major' else None
        serializer.save(uploaded_by=self.request.user, department=department)


class ModuleDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Module.objects.all()
    serializer_class = ModuleSerializer
    permission_classes = [IsAdminOrReadOnly]

    def get_serializer_context(self):
        return {'request': self.request}


class AnnouncementListCreateView(generics.ListCreateAPIView):
    """
    GET — bukas sa kahit sinong naka-login (students kasama), para makita
    nila ang mga announcement sa dashboard.
    POST — instructor lang ang pwedeng gumawa ng bago.
    """
    queryset = Announcement.objects.all()
    serializer_class = AnnouncementSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsInstructor()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(posted_by=self.request.user)


class AnnouncementDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Announcement.objects.all()
    serializer_class = AnnouncementSerializer
    permission_classes = [IsInstructor]