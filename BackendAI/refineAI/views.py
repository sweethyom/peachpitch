import json
import openai
import logging
import requests
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from reportAI.models import Chat, ChatHistory, TotalReport
from django.conf import settings

import redis
import time

openai.api_key = settings.OPENAI_API_KEY
logger = logging.getLogger(__name__)

# 문장 복원 및 누락 단어 보완
def restore_punctuation(text):
    prompt = f"다음 문장을 복원해줘:\n{text}"
    try:
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "너는 문장 복원 전문가이다. 입력된 문장을 복원할 때 오직 복원된 문장만을 출력해야 하며, 어떠한 추가 설명, 제목, 서문, 인사말, 또는 부가 문구도 포함하지 말아라.너는 문장 복원 전문가다. 입력된 문장이 매우 짧더라도 반드시 자연스럽게 복원할 것."},
                {"role": "user", "content": prompt}
            ],
            temperature=0
        )
        return response.choices[0].message['content'].strip()
    except Exception as e:
        logger.error(f"OpenAI API 호출 오류: {e}")
        return text

# 복원 텍스트 마지막 문자 "?"이면 질문으로 판단.
def is_question(text):
    return text.strip().endswith('?')

# refineAI 실행 후 reportAI & wordAI 구동, HTTP 요청 : 동기 방식
@csrf_exempt
def refine_and_trigger(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'POST 요청만 허용됩니다.'}, status=405)
    
    try:
        data = json.loads(request.body)
        history_id = data.get('history_id')
        if not history_id:
            return JsonResponse({'error': 'history_id가 제공되지 않았습니다.'}, status=400)
    except json.JSONDecodeError:
        return JsonResponse({'error': '유효한 JSON 형식이 아닙니다.'}, status=400)
    
    try:
        history = ChatHistory.objects.get(pk=history_id)
    except ChatHistory.DoesNotExist:
        return JsonResponse({'error': '해당 history_id의 대화 내역이 존재하지 않습니다.'}, status=404)
    
    # Redis Polling
    redis_client = redis.Redis(
        host=settings.REDIS_HOST,
        port=settings.REDIS_PORT,
        db=getattr(settings, 'REDIS_DB', 0)
    )
    redis_key = f'chat:{history_id}:messages'

    timeout = 30  # 최대 30초 대기
    start_time = time.time()

    while redis_client.exists(redis_key):
        if time.time() - start_time > timeout:
            return JsonResponse({"error": "대기 시간 초과되었습니다. 나중에 다시 시도해주세요."}, status=408)
        time.sleep(1)

    # history_id에 연결된 모든 Chat 메시지 조회
    chats = Chat.objects.filter(history=history, user_id=history.user1_id)
    updated_count = 0   # 디버깅 용으로 만듦
    new_question_count = 0
    new_answer_count = 0
    
    for chat in chats:
        if not chat.content:
            continue
        
        # 문장 부호 복원 및 단어 보완 모델 구동
        restored_text = restore_punctuation(chat.content)
        
        # 복원된 텍스트가 기존 내용과 다르면 DB 업데이트
        if restored_text != chat.content:
            chat.content = restored_text
            chat.save()
            updated_count += 1
        
        # ?가 있으면 qeust 증가
        if is_question(restored_text):
            new_question_count += 1
        else:
            new_answer_count += 1
    
    # TotalReport 업데이트
    total_report, created = TotalReport.objects.get_or_create(user_id=history.user1_id)
    print(f'한글한글유저유저:{total_report}')
    total_report.quest_count = (total_report.quest_count or 0) + new_question_count
    total_report.ans_count = (total_report.ans_count or 0) + new_answer_count
    total_report.save()
    
    # reportAI, wordAI 구동
    try:
        report_ai_url = "http://localhost:8000/ai/users/reports/analysis/"
        report_response = requests.post(report_ai_url, json={"history_id": history_id})
        report_result = report_response.json()
    except Exception as e:
        logger.error(f"ReportAI 실행 오류: {e}")
        report_result = {"error": str(e)}
    
    try:
        word_ai_url = "http://localhost:8000/ai/users/reports/words/"
        word_response = requests.post(word_ai_url, json={"history_id": history_id})
        word_result = word_response.json()
    except Exception as e:
        logger.error(f"WordAI 실행 오류: {e}")
        word_result = {"error": str(e)}
    
    return JsonResponse({
        'updated_messages': updated_count,
        'new_question_count': new_question_count,
        'new_answer_count': new_answer_count,
        'total_question_count': total_report.quest_count,
        'total_answer_count': total_report.ans_count,
        'report_ai_result': report_result,
        'word_ai_result': word_result
    })
