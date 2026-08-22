from django.contrib import admin
from django.urls import include, path
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('accounts.urls')),
    path('api/', include('exams.urls')),
    path('api/', include('modules.urls')),
    path('api/', include('reports.urls')),
]+ static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)