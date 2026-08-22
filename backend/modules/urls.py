# 📁 backend/modules/urls.py
from django.urls import path
from .views import ModuleDetailView, ModuleListCreateView, AnnouncementListCreateView, AnnouncementDetailView

urlpatterns = [
    path('modules', ModuleListCreateView.as_view(), name='module-list'),
    path('modules/', ModuleListCreateView.as_view()),
    path('modules/<int:pk>', ModuleDetailView.as_view(), name='module-detail'),
    path('modules/<int:pk>/', ModuleDetailView.as_view()),
    path('announcements', AnnouncementListCreateView.as_view(), name='announcement-list'),
    path('announcements/', AnnouncementListCreateView.as_view()),
    path('announcements/<int:pk>', AnnouncementDetailView.as_view(), name='announcement-detail'),
]