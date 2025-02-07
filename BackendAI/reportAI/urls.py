from django.urls import path
from . import views

# 최종 URL: ai/users/reports/
urlpatterns = [
    path('reports/', views.generate_report, name='generate_report'),
]
