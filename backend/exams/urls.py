# 📁 backend/exams/urls.py
from django.urls import path
from .views import (
    ExamAttemptDetailView,
    ExamAttemptListCreateView,
    ExamConfigView,
    ExamDetailView,
    ExamListCreateView,
    InstructorDashboardView,
    InstructorExamDetailView,
    InstructorExamListCreateView,
    InstructorQuestionBulkCreateView,
    InstructorQuestionBulkDeleteView,
    InstructorQuestionDetailView,
    InstructorQuestionListCreateView,
)

urlpatterns = [
    path('exams', ExamListCreateView.as_view(), name='exam-list'),
    path('exams/<int:pk>', ExamDetailView.as_view(), name='exam-detail'),
    path('exams/history', ExamAttemptListCreateView.as_view(), name='exam-history'),
    path('exams/history/<int:pk>', ExamAttemptDetailView.as_view(), name='exam-history-detail'),
    path('exam-config', ExamConfigView.as_view(), name='exam-config'),

    path('instructor/dashboard', InstructorDashboardView.as_view(), name='instructor-dashboard'),
    path('instructor/dashboard/', InstructorDashboardView.as_view()),

    path('instructor/exams', InstructorExamListCreateView.as_view(), name='instructor-exams'),
    path('instructor/exams/', InstructorExamListCreateView.as_view()),
    path('instructor/exams/<int:pk>', InstructorExamDetailView.as_view(), name='instructor-exam-detail'),

    path('instructor/questions', InstructorQuestionListCreateView.as_view(), name='instructor-questions'),
    path('instructor/questions/', InstructorQuestionListCreateView.as_view()),
    path('instructor/questions/<int:pk>', InstructorQuestionDetailView.as_view(), name='instructor-question-detail'),
    path('instructor/questions/bulk', InstructorQuestionBulkCreateView.as_view(), name='instructor-questions-bulk'),
    path('instructor/questions/bulk/', InstructorQuestionBulkCreateView.as_view()),
    path('instructor/questions/bulk-delete', InstructorQuestionBulkDeleteView.as_view(), name='instructor-questions-bulk-delete'),
    path('instructor/questions/bulk-delete/', InstructorQuestionBulkDeleteView.as_view()),
]