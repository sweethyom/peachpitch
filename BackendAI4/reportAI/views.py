from django.db import models
from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.urls import path
import openai
import json

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
        
        # ChatHistory 객체를 가져옴
        history = get_object_or_404(ChatHistory, pk=history_id)
        
        # history_id에 연결된 모든 Chat 메시지 조회
        chats = Chat.objects.filter(history=history)
        
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
            user_id=chats.first().user_id,   # 첫 번째 chat의 사용자 id를 가져온다.
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