from django.contrib import admin
from .models import Exam, Question, Choice, ExamAttempt, ExamConfig

admin.site.register(Exam)
admin.site.register(Question)
admin.site.register(Choice)
admin.site.register(ExamAttempt)


@admin.register(ExamConfig)
class ExamConfigAdmin(admin.ModelAdmin):
    list_display = ('genEd', 'profEd', 'major', 'maxAttempts', 'updated_at')

    def has_add_permission(self, request):
        return not ExamConfig.objects.exists()

    def has_delete_permission(self, request, obj=None):
        return False