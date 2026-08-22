# 📁 backend/accounts/management/commands/create_instructor.py
from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth import get_user_model
from django.db import IntegrityError

User = get_user_model()


class Command(BaseCommand):
    help = "Create an instructor (or other role) account directly in the database."

    def add_arguments(self, parser):
        parser.add_argument('--email', required=True)
        parser.add_argument('--password', required=True)
        parser.add_argument('--name', required=True)
        parser.add_argument('--role', default=User.ROLE_INSTRUCTOR,
                             choices=[c[0] for c in User.ROLE_CHOICES])

    def handle(self, *args, **options):
        email = options['email'].strip().lower()
        password = options['password']
        name = options['name'].strip()
        role = options['role']

        if User.objects.filter(email__iexact=email).exists():
            raise CommandError(f"A user with email '{email}' already exists.")

        try:
            user = User.objects.create_user(
                email=email, name=name, password=password, role=role
            )
            if role in (User.ROLE_ADMIN, User.ROLE_INSTRUCTOR):
                user.is_staff = True
            if role == User.ROLE_ADMIN:
                user.is_superuser = True
            user.save()
        except IntegrityError as e:
            raise CommandError(f"Database error: {e}")

        self.stdout.write(self.style.SUCCESS(
            f"✅ Account created: {email} (role={role})"
        ))