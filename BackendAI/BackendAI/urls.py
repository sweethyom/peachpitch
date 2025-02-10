from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('ai/admin/', admin.site.urls),
    path('ai/', include('chatbotAPI.urls')),
    path('ai/users/reports/analysis/', include('reportAI.urls')),
    path('ai/users/reports/words/', include('wordAI.urls')),
]
