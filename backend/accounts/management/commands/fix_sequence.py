# backend/accounts/management/commands/fix_sequence.py
from django.core.management.base import BaseCommand
from django.db import connection


class Command(BaseCommand):
    help = "Resyncs the accounts_user id sequence to MAX(id) + 1, with diagnostics."

    def handle(self, *args, **options):
        with connection.cursor() as cursor:
            # 1. Show current max id in the table
            cursor.execute("SELECT MAX(id) FROM accounts_user;")
            max_id = cursor.fetchone()[0]
            self.stdout.write(f"Current MAX(id) in accounts_user: {max_id}")

            # 2. Show current sequence value BEFORE fixing
            cursor.execute("SELECT last_value, is_called FROM accounts_user_id_seq;")
            last_value, is_called = cursor.fetchone()
            self.stdout.write(f"Sequence before fix: last_value={last_value}, is_called={is_called}")

            # 3. Actually fix it
            cursor.execute("""
                SELECT setval(
                    pg_get_serial_sequence('accounts_user', 'id'),
                    COALESCE((SELECT MAX(id) FROM accounts_user), 1),
                    true
                );
            """)
            new_val = cursor.fetchone()[0]
            self.stdout.write(self.style.SUCCESS(f"Sequence set to: {new_val}"))

            # 4. Confirm it stuck
            cursor.execute("SELECT last_value, is_called FROM accounts_user_id_seq;")
            last_value, is_called = cursor.fetchone()
            self.stdout.write(f"Sequence after fix: last_value={last_value}, is_called={is_called}")