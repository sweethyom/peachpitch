from django.urls import path
from .views import start_conversation, continue_conversation

urlpatterns = [
    path('start/', start_conversation, name='start_conversation'),
    path('chat/', continue_conversation, name='continue_conversation'),
]
