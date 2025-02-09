# wordAI/models.py
from django.db import models
from reportAI.models import Totalreport  # Totalreport 참조를 위해 import

class SpeakingHabits(models.Model):
    wordid = models.BigAutoField(db_column='wordId', primary_key=True)
    count = models.IntegerField(blank=True, null=True)
    word = models.CharField(max_length=100)
    total_report = models.OneToOneField(Totalreport, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'speaking_habits'

