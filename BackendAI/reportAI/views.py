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
        chat_id = data.get('chat_id')

        # Chat 데이터 가져오기
        chat = get_object_or_404(Chat, pk=chat_id)
        conversation_data = chat.content

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
        # lines = report_content.split('\n')
        # strengths = [line.replace("1)", "").strip() for line in lines if line.startswith("1)") or line.startswith("2)") or line.startswith("3)")][:3]
        # improvements = [line.replace("1)", "").strip() for line in lines if line.startswith("1)") or line.startswith("2)") or line.startswith("3)")][3:6]
        # summary = [line.replace("1)", "").strip() for line in lines if line.startswith("1)") or line.startswith("2)") or line.startswith("3)")][6:9]

        lines = report_content.split('\n')
        strengths = [line.replace("1)", "").replace("2)", "").replace("3)", "").strip() for line in lines if line.startswith("1)") or line.startswith("2)") or line.startswith("3)")][:3]
        improvements = [line.replace("1)", "").replace("2)", "").replace("3)", "").strip() for line in lines if line.startswith("1)") or line.startswith("2)") or line.startswith("3)")][3:6]
        summary = [line.replace("1)", "").replace("2)", "").replace("3)", "").strip() for line in lines if line.startswith("1)") or line.startswith("2)") or line.startswith("3)")][6:9]

        # ChatReport에 저장
        chat_report = ChatReport.objects.create(
            history_id=chat.history_id,
            user_id=chat.userid,
            chat_time=0,  # chat_time은 필요한 로직에 맞게 수정
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








# 문장 프롬프트 실패작작

# @csrf_exempt
# def generate_report(request):
#     if request.method == 'POST':
#         data = json.loads(request.body)
#         chat_id = data.get('chat_id')
        
#         # Chat 데이터 가져오기
#         chat = get_object_or_404(Chat, pk=chat_id)
#         conversation_data = chat.content
        
#         # OpenAI API 호출
#         prompt = (
#             "다음 대화를 분석하고 강점 3가지, 약점 3가지, 총평 3문장을 존댓말로 작성해 주세요. 각 항목은 완성된 문장으로 작성해 주세요.\n\n"
#             f"대화 내용:\n{conversation_data}\n\n"
#             "강점 (정확히 3가지):\n"
#             "1) \n"
#             "2) \n"
#             "3) \n\n"
#             "약점 (정확히 3가지):\n"
#             "1) \n"
#             "2) \n"
#             "3) \n\n"
#             "총평 (정확히 3문장):\n"
#             "1) \n"
#             "2) \n"
#             "3) \n"
#         )
        
#         response = openai.ChatCompletion.create(
#             model="gpt-4",
#             messages=[
#                 {"role": "system", "content": "당신은 대화 분석 전문가입니다. 사용자의 대화를 분석하고 존댓말로 피드백을 제공하세요."},
#                 {"role": "user", "content": prompt}
#             ]
#         )
        
#         report_content = response.choices[0].message['content']
        
#         def extract_items(section_text):
#             # 섹션 제목과 번호 제거
#             lines = section_text.split('\n')
#             items = []
#             for line in lines:
#                 # 숫자), 섹션 제목 등을 제거하고 실제 내용만 추출
#                 if line.strip() and not line.startswith(('강점', '약점', '총평')):
#                     cleaned = line.strip()
#                     # 번호 제거
#                     if cleaned.startswith(('1)', '2)', '3)')):
#                         cleaned = cleaned[2:].strip()
#                     if cleaned:
#                         items.append(cleaned)
#             return items
        
#         # 결과 파싱
#         sections = report_content.split('\n\n')
#         strengths = []
#         improvements = []
#         summary = []
        
#         for section in sections:
#             if '강점' in section:
#                 strengths = extract_items(section)
#             elif '약점' in section:
#                 improvements = extract_items(section)
#             elif '총평' in section:
#                 summary = extract_items(section)
        
#         # 각 섹션이 정확히 3개의 항목을 가지도록 보장
#         if len(strengths) != 3 or len(improvements) != 3 or len(summary) != 3:
#             return JsonResponse({"error": "분석 결과가 올바른 형식이 아닙니다."}, status=400)
        
#         # ChatReport에 저장
#         chat_report = ChatReport.objects.create(
#             history_id=chat.history_id,
#             user_id=chat.userid,
#             chat_time=0,  # chat_time은 필요한 로직에 맞게 수정
#             cons=' '.join(improvements),
#             pros=' '.join(strengths),
#             summary=' '.join(summary)
#         )
        
#         return JsonResponse({
#             "report_id": chat_report.report_id,
#             "pros": strengths,
#             "cons": improvements,
#             "summary": summary
#         })
#     else:
#         return JsonResponse({"error": "POST 요청만 지원합니다."}, status=400)



