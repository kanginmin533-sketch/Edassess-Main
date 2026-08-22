from django.contrib.auth import get_user_model
from django.db.models import Avg, Count, Q, Max
from django.utils import timezone
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.authentication import JWTAuthentication
from accounts.permissions import IsInstructor
from exams.models import Exam, ExamAttempt

User = get_user_model()


def relative_time(ts, now):
    seconds = (now - ts).total_seconds()
    if seconds < 60:
        return 'Just now'
    if seconds < 3600:
        return f'{int(seconds // 60)} min ago'
    if seconds < 86400:
        return f'{int(seconds // 3600)} hr ago'
    return f'{int(seconds // 86400)} day(s) ago'


class AdminDashboardView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        now = timezone.now()
        today = now.date()
        month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

        # ── Stats ────────────────────────────────────────────────────────
        total_users = User.objects.count()
        new_this_month = User.objects.filter(date_joined__gte=month_start).count()

        active_exams = Exam.objects.filter(is_active=True).count()

        completed_today = ExamAttempt.objects.filter(created_at__date=today).count()

        avg_seconds = ExamAttempt.objects.aggregate(avg=Avg('time_taken_seconds'))['avg'] or 0
        avg_minutes = round(avg_seconds / 60) if avg_seconds else 0

        stats = [
            {'label': 'Total Users', 'value': str(total_users),
             'sub': f'+{new_this_month} this month', 'icon': 'Users', 'color': 'purple'},
            {'label': 'Active Exams', 'value': str(active_exams),
             'sub': f'{active_exams} configured', 'icon': 'FileText', 'color': 'blue'},
            {'label': 'Completed Today', 'value': str(completed_today),
             'sub': 'Submissions', 'icon': 'CheckCircle', 'color': 'green'},
            {'label': 'Avg. Duration', 'value': f'{avg_minutes}m',
             'sub': 'All exam types', 'icon': 'Clock', 'color': 'amber'},
        ]

        # ── Recent users ─────────────────────────────────────────────────
        recent_users = [
            {
                'name': u.name,
                'email': u.email,
                'role': u.role,
                'status': 'active' if u.is_active else 'inactive',
            }
            for u in User.objects.order_by('-date_joined')[:5]
        ]

        # ── Activity feed (merged from two sources, sorted, trimmed) ──────
        activity = []

        for u in User.objects.order_by('-date_joined')[:5]:
            activity.append({
                'text': f'New user registered — {u.email}',
                'timestamp': u.date_joined,
                'color': 'purple',
            })

        for a in ExamAttempt.objects.select_related('user').order_by('-created_at')[:5]:
            activity.append({
                'text': f'"{a.label}" submitted by {a.user.name} — {a.percentage}%',
                'timestamp': a.created_at,
                'color': 'green' if a.passed else 'amber',
            })

        activity.sort(key=lambda x: x['timestamp'], reverse=True)
        activity = activity[:6]
        for item in activity:
            item['time'] = relative_time(item.pop('timestamp'), now)

        return Response({
            'stats': stats,
            'recent_users': recent_users,
            'activity': activity,
        }, status=status.HTTP_200_OK)


class AdminReportsView(APIView):
    """Read-only aggregation ng ExamAttempt records — powers ang ReportsPage."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        attempts = ExamAttempt.objects.all()

        # ── Summary stats ───────────────────────────────────────────────
        total_submissions = attempts.count()
        avg_score = attempts.aggregate(avg=Avg('percentage'))['avg'] or 0
        active_students = attempts.values('user').distinct().count()
        avg_seconds = attempts.aggregate(avg=Avg('time_taken_seconds'))['avg'] or 0
        avg_minutes = round(avg_seconds / 60) if avg_seconds else 0

        summary = {
            'total_submissions': total_submissions,
            'avg_score': round(avg_score, 1),
            'active_students': active_students,
            'avg_duration_minutes': avg_minutes,
        }

        # ── Per-exam breakdown (grouped by label) ─────────────────────────
        grouped = (
            attempts.values('label')
            .annotate(
                submissions=Count('id'),
                avg_score=Avg('percentage'),
                avg_duration=Avg('time_taken_seconds'),
                passed_count=Count('id', filter=Q(passed=True)),
            )
            .order_by('label')
        )

        exam_rows = []
        for row in grouped:
            submissions = row['submissions']
            passed_count = row['passed_count']
            pass_rate = round((passed_count / submissions) * 100) if submissions else 0
            avg_duration_min = round((row['avg_duration'] or 0) / 60)

            exam_rows.append({
                'exam': row['label'],
                'submissions': submissions,
                'avg_score': round(row['avg_score'] or 0),
                'pass_rate': pass_rate,
                'avg_duration': f'{avg_duration_min} min',
            })

        return Response({
            'summary': summary,
            'exam_stats': exam_rows,
        }, status=status.HTTP_200_OK)
        
class StudentMonitorView(APIView):
    """Per-student scores/attempts + class-wide weak areas — powers StudentMonitorPage."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsInstructor]

    def get(self, request):
        # Only look at students who attempted exams in this instructor's categories
        instructor_categories = list(
            Exam.objects.filter(created_by=request.user).values_list('category', flat=True).distinct()
        )
        attempts = ExamAttempt.objects.filter(category__in=instructor_categories) if instructor_categories else ExamAttempt.objects.all()

        # ── Per-student breakdown ──────────────────────────────────────
        student_ids = attempts.values_list('user', flat=True).distinct()
        students = []

        for uid in student_ids:
            user = User.objects.get(pk=uid)
            user_attempts = attempts.filter(user=user)

            scores = {}
            attempt_counts = {}
            for cat in ['GenEd', 'ProfEd', 'Major']:
                cat_attempts = user_attempts.filter(category=cat)
                avg_score = cat_attempts.aggregate(avg=Avg('percentage'))['avg']
                scores[cat] = round(avg_score) if avg_score is not None else 0
                attempt_counts[cat] = cat_attempts.count()

            last_attempt = user_attempts.order_by('-created_at').first()
            last_active = relative_time(last_attempt.created_at, timezone.now()) if last_attempt else 'Never'

            students.append({
                'id': user.id,
                'name': user.name,
                'email': user.email,
                'scores': scores,
                'attempts': attempt_counts,
                'lastActive': last_active,
            })

        # ── Weak areas (from subject_breakdown JSON on each attempt) ────
        # Expected shape per attempt.subject_breakdown:
        #   {"Topic Name": {"correct": 3, "total": 5}, ...}
        topic_totals = {}
        for a in attempts.exclude(subject_breakdown={}):
            for topic, stats in a.subject_breakdown.items():
                if topic not in topic_totals:
                    topic_totals[topic] = {'correct': 0, 'total': 0, 'category': a.category}
                topic_totals[topic]['correct'] += stats.get('correct', 0)
                topic_totals[topic]['total'] += stats.get('total', 0)

        weak_areas = []
        for topic, stats in topic_totals.items():
            if stats['total'] == 0:
                continue
            error_rate = round((1 - stats['correct'] / stats['total']) * 100)
            weak_areas.append({'topic': topic, 'category': stats['category'], 'errorRate': error_rate})

        weak_areas.sort(key=lambda x: x['errorRate'], reverse=True)
        weak_areas = weak_areas[:5]

        return Response({'students': students, 'weak_areas': weak_areas}, status=status.HTTP_200_OK)