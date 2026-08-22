from django.urls import path
from .views import AdminDashboardView, AdminReportsView, StudentMonitorView

urlpatterns = [
    path('admin/dashboard', AdminDashboardView.as_view(), name='admin-dashboard'),
    path('admin/dashboard/', AdminDashboardView.as_view()),

    path('admin/reports', AdminReportsView.as_view(), name='admin-reports'),
    path('admin/reports/', AdminReportsView.as_view()),

    path('instructor/student-monitor', StudentMonitorView.as_view(), name='student-monitor'),
    path('instructor/student-monitor/', StudentMonitorView.as_view()),
]