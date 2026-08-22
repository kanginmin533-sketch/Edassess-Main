from django.db.models import Avg
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from accounts.permissions import IsAdmin, IsInstructor
from .models import Exam, ExamAttempt, ExamConfig, Question
from .serializers import (
    ExamAttemptSerializer, ExamConfigSerializer, ExamSerializer, QuestionSerializer,
)


class ExamListCreateView(generics.ListCreateAPIView):
    """Public list — mga exams na 'active' ang status, makikita ng students."""
    queryset = Exam.objects.filter(is_active=True, status='active').order_by('-created_at')
    serializer_class = ExamSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class ExamDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Exam.objects.all()
    serializer_class = ExamSerializer
    permission_classes = [permissions.IsAuthenticated]


class ExamAttemptListCreateView(generics.ListCreateAPIView):
    serializer_class = ExamAttemptSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ExamAttempt.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
        
class ExamAttemptDetailView(generics.RetrieveAPIView):
    """Single attempt with full detail (questions/answers) — for reloading ResultsPage."""
    serializer_class = ExamAttemptSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ExamAttempt.objects.filter(user=self.request.user)


class ExamConfigView(generics.RetrieveUpdateAPIView):
    serializer_class = ExamConfigSerializer
    permission_classes = [IsAdmin]

    def get_object(self):
        return ExamConfig.load()


class InstructorDashboardView(generics.GenericAPIView):
    permission_classes = [IsInstructor]

    def get(self, request):
        exams = Exam.objects.filter(created_by=request.user)

        questions_count = sum(e.questions.count() for e in exams)
        active_exams_count = exams.filter(status='active').count()

        categories = list(exams.values_list('category', flat=True).distinct())
        attempts = ExamAttempt.objects.filter(category__in=categories)
        students_monitored = attempts.values('user').distinct().count()
        avg_score = attempts.aggregate(avg=Avg('percentage'))['avg'] or 0

        stats = [
            {'label': 'Questions in Bank', 'value': str(questions_count),
             'sub': f'{exams.count()} exam(s) total', 'icon': 'BookOpen', 'color': 'blue'},
            {'label': 'Active Exams', 'value': str(active_exams_count),
             'sub': f'{exams.count()} created total', 'icon': 'ClipboardList', 'color': 'purple'},
            {'label': 'Students Monitored', 'value': str(students_monitored),
             'sub': 'Across all your exams', 'icon': 'Users', 'color': 'green'},
            {'label': 'Avg. Class Score', 'value': f'{round(avg_score)}%',
             'sub': 'All submissions', 'icon': 'TrendingUp', 'color': 'amber'},
        ]

        recent_exams = [
            {
                'name': e.title, 'category': e.category,
                'questions': e.questions.count(), 'duration': f'{e.duration_minutes} min',
                'status': e.status,
            }
            for e in exams.order_by('-created_at')[:4]
        ]

        return Response({'stats': stats, 'recent_exams': recent_exams}, status=status.HTTP_200_OK)


class InstructorExamListCreateView(generics.ListCreateAPIView):
    serializer_class = ExamSerializer
    permission_classes = [IsInstructor]

    def get_queryset(self):
        return Exam.objects.filter(created_by=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class InstructorExamDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ExamSerializer
    permission_classes = [IsInstructor]

    def get_queryset(self):
        return Exam.objects.filter(created_by=self.request.user)


class InstructorQuestionListCreateView(generics.ListCreateAPIView):
    """
    Buong question bank. GET (list) ay bukas sa kahit sinong naka-login
    (kailangan ito ng estudyante para makakuha ng questions sa exam) —
    POST (create) lang ang IsInstructor-only.
    """
    queryset = Question.objects.all().order_by('-created_at')
    serializer_class = QuestionSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsInstructor()]
        return [permissions.IsAuthenticated()]

    def get_serializer_context(self):
        return {'request': self.request}


class InstructorQuestionDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer
    permission_classes = [IsInstructor]

    def get_serializer_context(self):
        return {'request': self.request}


class InstructorQuestionBulkCreateView(APIView):
    """Import mula CSV/Excel/PDF — tumatanggap ng listahan ng questions."""
    permission_classes = [IsInstructor]

    def post(self, request):
        items = request.data.get('questions', [])
        created = []
        for item in items:
            serializer = QuestionSerializer(data=item, context={'request': request})
            serializer.is_valid(raise_exception=True)
            question = serializer.save()
            created.append(QuestionSerializer(question).data)
        return Response({'created': created}, status=status.HTTP_201_CREATED)