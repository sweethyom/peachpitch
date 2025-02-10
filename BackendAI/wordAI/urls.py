from django.urls import path
from .views import WordAnalysisView

urlpatterns = [
    path('', WordAnalysisView.as_view(), name='word-analysis'),
]
