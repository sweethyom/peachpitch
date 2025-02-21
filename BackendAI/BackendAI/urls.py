from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('ai/', include('chatbotAPI.urls')),
    path('ai/users/reports/analysis/', include('reportAI.urls')),
    path('ai/users/reports/words/', include('wordAI.urls')),
    path('ai/users/reports/refine/', include('refineAI.urls')),
]
