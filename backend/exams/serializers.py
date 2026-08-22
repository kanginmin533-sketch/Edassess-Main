from rest_framework import serializers
from .models import Choice, Exam, ExamAttempt, ExamConfig, Question


class QuestionSerializer(serializers.Serializer):
    """
    Custom serializer — hindi ModelSerializer dahil ang shape na ginagamit
    ng frontend (choices[] + answer index) ay hindi direktang tumutugma sa
    Question/Choice tables (na hiwalay na model). Dito nangyayari ang translation.
    """
    id = serializers.IntegerField(read_only=True)
    question = serializers.CharField()
    category = serializers.ChoiceField(choices=['GenEd', 'ProfEd', 'Major'])
    subject = serializers.CharField(required=False, allow_blank=True)
    difficulty = serializers.ChoiceField(choices=['Easy', 'Medium', 'Hard'], required=False, default='Medium')
    choices = serializers.ListField(child=serializers.CharField(allow_blank=True), min_length=4, max_length=4)
    answer = serializers.IntegerField(min_value=0, max_value=3)
    explanation = serializers.CharField(required=False, allow_blank=True)

    def to_representation(self, instance):
        choice_objs = list(instance.choices.all())
        return {
            'id': instance.id,
            'question': instance.text,
            'category': instance.category,
            'subject': instance.subject,
            'difficulty': instance.difficulty,
            'choices': [c.text for c in choice_objs],
            'answer': next((i for i, c in enumerate(choice_objs) if c.is_correct), 0),
            'explanation': instance.explanation,
        }

    def create(self, validated_data):
        choices = validated_data.pop('choices')
        answer = validated_data.pop('answer')
        question = Question.objects.create(
            text=validated_data['question'],
            category=validated_data['category'],
            subject=validated_data.get('subject', ''),
            difficulty=validated_data.get('difficulty', 'Medium'),
            explanation=validated_data.get('explanation', ''),
            created_by=self.context['request'].user,
        )
        for i, choice_text in enumerate(choices):
            Choice.objects.create(question=question, text=choice_text, is_correct=(i == answer))
        return question

    def update(self, instance, validated_data):
        instance.text = validated_data.get('question', instance.text)
        instance.category = validated_data.get('category', instance.category)
        instance.subject = validated_data.get('subject', instance.subject)
        instance.difficulty = validated_data.get('difficulty', instance.difficulty)
        instance.explanation = validated_data.get('explanation', instance.explanation)
        instance.save()

        if 'choices' in validated_data:
            instance.choices.all().delete()
            answer = validated_data.get('answer', 0)
            for i, choice_text in enumerate(validated_data['choices']):
                Choice.objects.create(question=instance, text=choice_text, is_correct=(i == answer))
        return instance


class ExamSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)
    question_ids = serializers.PrimaryKeyRelatedField(
        source='questions', many=True, queryset=Question.objects.all(),
        write_only=True, required=False,
    )

    class Meta:
        model = Exam
        fields = [
            'id', 'title', 'description', 'category', 'status',
            'duration_minutes', 'passing_score', 'is_active',
            'questions', 'question_ids', 'created_at',
        ]


class ExamAttemptSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExamAttempt
        fields = [
            'id', 'user', 'exam_type', 'category', 'label',
            'score', 'total', 'percentage', 'passed',
            'time_taken_seconds', 'auto_submit', 'subject_breakdown', 'detail', 'created_at'
        ]
        read_only_fields = ['id', 'user', 'created_at']


class ExamConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExamConfig
        fields = [
            'genEd', 'profEd', 'major',
            'autoSubmit', 'showResults', 'allowReview',
            'shuffleQuestions', 'shuffleChoices', 'maxAttempts',
            'updated_at',
        ]
        read_only_fields = ['updated_at']