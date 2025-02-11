from django.db import models
from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.urls import path
import openai
import json
import redis
import time
from .models import Chat, ChatReport, ChatHistory, User
from django.conf import settings

# OpenAI API 키 설정
openai.api_key = settings.OPENAI_API_KEY

@csrf_exempt
def generate_report(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        history_id = data.get('history_id')

        if not history_id:
            return JsonResponse({"error": "history_id가 필요합니다."}, status=400)
        
        # Redis가 대화 내역에 남아있는가 (대화 저장시 사용한 key 규칙에 맞게 수정하라는데..! 효미언니 물어보기)
        redis_client = redis.Redis(
            host=settings.REDIS_HOST,
            port=settings.REDIS_PORT,
            db=getattr(settings, 'REDIS_DB', 0)
        )
        redis_key = f'chat:{history_id}:messages'    # 이 부분 언니 확인

        # Polling 시작 (30초 대기로 가겠습니다.)
        timeout = 30
        start_time = time.time()

        while redis_client.exists(redis_key):
            if time.time() - start_time > timeout:
                return JsonResponse({"error": "대기 시간 초과되었습니다. 나중에 다시 시도해주세요."})
            time.sleep(1)   # 1초 간격으로 Redis 상태 확인, 부하 가면 수정
        
        # Redis가 비었을 때 모델 구동 시작, history_id에에 연결된 Chat 데이터 가져오기
        chats = Chat.objects.filter(history_id=history_id)
        if not chats.exists():
            return JsonResponse({"error": "해당 histroy_id에 대한 채팅 데이터가 없습니다."})
        

        # 여러 개의 대화 내용을 합치기
        conversation_data = "\n".join(chat.content for chat in chats if chat.content)

        # OpenAI API 호출
        prompt = (
            "다음 대화를 분석하고 강점 3가지, 약점 3가지, 총평 3문장으로 작성해 주세요. 각 항목은 번호를 붙여주세요.\n"
            f"대화 내용:\n{conversation_data}\n"
            "1. 강점 (3가지):\n1)\n2)\n3)\n"
            "2. 약점 (3가지):\n1)\n2)\n3)\n"
            "3. 총평 (3문장):\n1)\n2)\n3)"
        )

        response = openai.ChatCompletion.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "당신은 대화 분석 전문가입니다. 사용자의 대화를 분석하세요."},
                {"role": "user", "content": prompt}
            ]
        )

        report_content = response.choices[0].message['content']

        # 결과 파싱
        lines = report_content.split('\n')
        strengths = [line.replace("1)", "").replace("2)", "").replace("3)", "").strip() for line in lines if line.startswith("1)") or line.startswith("2)") or line.startswith("3)")][:3]
        improvements = [line.replace("1)", "").replace("2)", "").replace("3)", "").strip() for line in lines if line.startswith("1)") or line.startswith("2)") or line.startswith("3)")][3:6]
        summary = [line.replace("1)", "").replace("2)", "").replace("3)", "").strip() for line in lines if line.startswith("1)") or line.startswith("2)") or line.startswith("3)")][6:9]

        # ChatReport에 저장
        chat_report = ChatReport.objects.create(
            history_id=history_id, # db저장용이므로 history_id 활성화 되면 주석 풀기.
            user_id=chats.first().userid,   # 첫 번째 chat의 사용자 id를 가져온다.
            chat_time=0,  # chat_time은 일단 0으로 넣어놨다.
            cons=' '.join(improvements),
            pros=' '.join(strengths),
            summary=' '.join(summary)
        )

        return JsonResponse({
            "report_id": chat_report.report_id,
            "pros": strengths,
            "cons": improvements,
            "summary": summary
        })
    else:
        return JsonResponse({"error": "POST 요청만 지원합니다."}, status=400)