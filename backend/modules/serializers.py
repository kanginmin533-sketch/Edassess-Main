# 📁 backend/modules/serializers.py
import mimetypes
from rest_framework import serializers
from .models import Module, Announcement


class ModuleSerializer(serializers.ModelSerializer):
    fileName = serializers.SerializerMethodField()
    fileSize = serializers.SerializerMethodField()
    fileType = serializers.SerializerMethodField()
    fileUrl = serializers.SerializerMethodField()
    uploadedBy = serializers.SerializerMethodField()
    uploadedAt = serializers.DateTimeField(source='uploaded_at', read_only=True)

    class Meta:
        model = Module
        fields = [
            'id', 'title', 'description', 'category', 'department', 'major', 'file',
            'fileName', 'fileSize', 'fileType', 'fileUrl',
            'uploadedBy', 'uploadedAt',
        ]
        # department: hinuhulaan ng view. major: optional, puwedeng ipasa kapag Major ang category.
        extra_kwargs = {
            'file': {'write_only': True},
            'department': {'read_only': True},
            'major': {'required': False, 'allow_null': True, 'allow_blank': True},
        }

    def get_fileName(self, obj):
        return obj.file_name

    def get_fileSize(self, obj):
        return obj.file_size

    def get_fileType(self, obj):
        guess, _ = mimetypes.guess_type(obj.file.name) if obj.file else (None, None)
        return guess or 'application/octet-stream'

    def get_fileUrl(self, obj):
        request = self.context.get('request')
        if obj.file and request:
            return request.build_absolute_uri(obj.file.url)
        return None

    def get_uploadedBy(self, obj):
        return obj.uploaded_by.name if obj.uploaded_by else 'Unknown'


class AnnouncementSerializer(serializers.ModelSerializer):
    date = serializers.SerializerMethodField()

    class Meta:
        model = Announcement
        fields = ['id', 'title', 'body', 'audience', 'pinned', 'date', 'created_at']
        read_only_fields = ['id', 'created_at']

    def get_date(self, obj):
        return f"{obj.created_at.strftime('%b')} {obj.created_at.day}, {obj.created_at.strftime('%Y')}"