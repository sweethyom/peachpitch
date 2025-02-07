from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('ai/', include('chatbotAPI.urls')),
    path('ai/users/', include('reportAI.urls')),  # 변경된 부분
]
