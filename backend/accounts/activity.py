# backend/accounts/activity.py
from .models import ActivityLog, SystemSettings


def _client_ip(request):
    if request is None:
        return None
    forwarded = request.META.get('HTTP_X_FORWARDED_FOR')
    if forwarded:
        return forwarded.split(',')[0].strip() or None
    return request.META.get('REMOTE_ADDR') or None


def log_activity(request, action, description, category='general',
                 department=None, actor=None, force=False):
    """
    Mag-record ng isang audit entry. Hindi kailanman magbabato ng error —
    hindi dapat masira ang request dahil lang pumalya ang logging.

    - actor:      ipasa nang explicit kung hindi pa authenticated ang request (hal. login).
    - department: department na apektado. Default = department ng actor (None kung super admin).
    - force:      i-log kahit naka-off ang 'auditLogging' (hal. ang mismong pag-off nito).
    """
    try:
        if not force and not SystemSettings.load().auditLogging:
            return None

        user = actor if actor is not None else getattr(request, 'user', None)
        if user is not None and not getattr(user, 'is_authenticated', False):
            user = None

        if department is None and user is not None:
            department = user.department or None

        return ActivityLog.objects.create(
            actor=user,
            actor_name=(user.name if user else '')[:255],
            actor_email=(user.email if user else '')[:255],
            actor_role=(user.role if user else ''),
            actor_department=(user.department if user else None),
            department=department or None,
            category=category,
            action=action,
            description=str(description)[:2000],
            ip_address=_client_ip(request),
        )
    except Exception:
        return None