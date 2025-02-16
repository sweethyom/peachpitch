from django.urls import path
from . import views

# url : ai/users/reports/
urlpatterns = [
    path('', views.generate_report, name='generate_report'),
]
