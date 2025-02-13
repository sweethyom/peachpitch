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

def restore_punctuation(text):
    """
    GPT-4 API를 이용해 문장 부호 복원과 누락된 단어 보완을 수행합니다.
    실패 시 원본 텍스트를 반환합니다.
    """
    prompt = f"다음 문장에 올바른 문장 부호와 누락된 단어를 복원해줘:\n{text}"
    try:
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "너는 문장 복원 전문가야."},
                {"role": "user", "content": prompt}
            ],
            temperature=0
        )
        restored_text = response.choices[0].message['content'].strip()
    except Exception as e:
        logger.error(f"OpenAI API 호출 오류: {e}")
        restored_text = text
    return restored_text

# 비용 절감
def is_question(text):
    """
    복원된 텍스트의 마지막 문자가 '?'이면 질문으로 판단합니다.
    """
    return text.strip().endswith('?')

@csrf_exempt
def refine_and_trigger(request):
    """
    refineAI 엔드포인트
      1. POST로 전달된 history_id에 해당하는 대화(Chat 엔티티)를 조회합니다.
      2. Redis에 history_id 관련 데이터가 남아 있는지 확인 (Polling 방식)
      3. 대화 데이터가 사라진 후, GPT-4 API를 이용해 문장 부호 및 누락 단어 보완을 수행하고 DB를 업데이트합니다.
      4. 보완된 텍스트를 기준으로 질문/답변 개수를 TotalReport에 누적 업데이트합니다.
      5. reportAI와 wordAI를 직접 HTTP 요청으로 실행 
    """
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
        time.sleep(1)  # 1초 간격으로 Redis 상태 확인

    # history_id에 연결된 모든 Chat 메시지 조회
    chats = Chat.objects.filter(history=history)
    updated_count = 0   # 디버깅 용으로 만듦듦
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
