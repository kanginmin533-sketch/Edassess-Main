from rest_framework import serializers
from exams.models import ExamAttempt
from exams.serializers import ExamAttemptSerializer


class AnalyticsReportSerializer(serializers.Serializer):
    total_attempts = serializers.IntegerField()
    average_score = serializers.FloatField()
    pass_rate = serializers.FloatField()
    recent_attempts = ExamAttemptSerializer(many=True)