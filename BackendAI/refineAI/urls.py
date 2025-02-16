from django.urls import path
from .views import refine_and_trigger

urlpatterns = [
    path('', refine_and_trigger, name='refine_ai'),
]
