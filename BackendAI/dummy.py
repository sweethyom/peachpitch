# insert_dummy_data.py

import os
import django
from django.utils import timezone

# 환경 변수 설정
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'BackendAI.settings')
django.setup()

from reportAI.models import Chat, ChatReport, ChatHistory, User

# 더미 데이터 삽입 코드
user1 = User.objects.create(email='user7@example.com', password='password1', role='user', status=1)
user2 = User.objects.create(email='user8@example.com', password='password2', role='admin', status=1)

history1 = ChatHistory.objects.create(
    created_at=timezone.now(),
    keyword1_id=1,
    keyword2_id=2,
    status=1,
    user1_feedback='Good',
    user1_id=user1.userid,
    user1_name='User One',
    user2_feedback='Excellent',
    user2_id=user2.userid,
    user2_name='User Two'
)

history2 = ChatHistory.objects.create(
    created_at=timezone.now(),
    keyword1_id=3,
    keyword2_id=4,
    status=0,
    user1_feedback='Average',
    user1_id=user2.userid,
    user1_name='User Two',
    user2_feedback='Needs Improvement',
    user2_id=user1.userid,
    user2_name='User One'
)

chat1 = Chat.objects.create(content='Hello, how are you?', created_at=timezone.now(), userid=user1.userid, history=history1)
chat2 = Chat.objects.create(content='I am fine, thank you!', created_at=timezone.now(), userid=user2.userid, history=history2)

report1 = ChatReport.objects.create(
    chat_time=300,
    cons='Needs more engagement.',
    pros='Clear communication.',
    summary='Overall good performance.',
    history=history1,
    user=user1
)

report2 = ChatReport.objects.create(
    chat_time=450,
    cons='Lacks focus in responses.',
    pros='Friendly tone.',
    summary='Could improve with more structure.',
    history=history2,
    user=user2
)

print("더미 데이터 생성 완료!")
