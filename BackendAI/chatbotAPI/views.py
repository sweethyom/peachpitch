import json
import requests

from .chatbot import generate_initial_message, generate_reply

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from django_redis import get_redis_connection

from datetime import datetime





# 구글 API 설정
GOOGLE_API_KEY = settings.GOOGLE_API_KEY
GOOGLE_CX = settings.GOOGLE_CX

# 구글 검색 함수
def google_search(query):
    url = "https://www.googleapis.com/customsearch/v1"
    params = {"key": GOOGLE_API_KEY, "cx": GOOGLE_CX, "q": query}
    response = requests.get(url, params=params)
    if response.status_code == 200:
        data = response.json()
        return [item["snippet"] for item in data.get("items", [])[:3]]
    else:
        return []

# 대화 히스토리 관리 (프론트엔드에서 관리하거나 DB로 옮길 수 있음)
conversation_history = []  # 이 부분은 프론트에서 히스토리를 받아올 수도 있음

@csrf_exempt
def start_conversation(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            keyword = data.get('keyword', '')
            # 내일 프론트랑 합치면서 chathistory_id를 들고 올 것
            # chat_history_id = data.get('chatHistoryId') 
            session_id = request.session.session_key or request.session.create()

            if not keyword:
                return JsonResponse({'error': '키워드를 입력하세요.'}, status=400)

            # 구글 검색 결과 추가
            search_results = google_search(keyword)
            search_content = "\n".join(search_results) if search_results else ""

            initial_message = generate_initial_message(keyword)
            if search_content:
                initial_message += "\n\n최근 검색 결과:\n" + search_content
            

            # Redis에 저장
            redis_client = get_redis_connection("default")
            chat_data = {
                "role": "assistant",
                "content": initial_message,
                "timestamp": str(datetime.now())
            }  

            print('redis 객체만들기 완료')

            # 세션별로 대화 저장
            redis_key = f"chat:{session_id}:messages"
            redis_client.rpush(redis_key, json.dumps(chat_data))

            print('redis에 세션별 저장 완료')
            # 24시간 후 만료되도록 설정(후에 변경)
            redis_client.expire(redis_key, 60*60*24)

            # 히스토리에 추가
            conversation_history.clear()  # 새로운 대화 시작 시 이전 기록 초기화
            conversation_history.append({"role": "user", "content": f"키워드: {keyword}"})
            conversation_history.append({"role": "assistant", "content": initial_message})

            return JsonResponse({'message': initial_message})

        except json.JSONDecodeError:
            return JsonResponse({'error': '유효한 JSON 형식이 아닙니다.'}, status=400)

    return JsonResponse({'error': 'POST 요청만 지원합니다.'}, status=405)


@csrf_exempt
def continue_conversation(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            user_message = data.get('message', '')
            # 내일 프론트랑 합치면서 chathistory_id를 들고 올 것
            # chat_history_id = data.get('chatHistoryId') 
            session_id = request.session.session_key or request.session.create()

            if not user_message:
                return JsonResponse({'error': '사용자 메시지를 입력하세요.'}, status=400)
            
            # Redis에 저장
            redis_client = get_redis_connection("default")
            chat_data = {
                "role": "user",
                "content": user_message,
                "timestamp": str(datetime.now())
            }  

            print('사용자 응답 redis 객체만들기 완료')

            # 세션별로 대화 저장
            redis_key = f"chat:{session_id}:messages"
            redis_client.rpush(redis_key, json.dumps(chat_data))

            print('redis에 사용자 응답 세션별 저장 완료')

            # 24시간 후 만료되도록 설정(후에 변경)
            redis_client.expire(redis_key, 60*60*24)

            # 사용자 메시지 히스토리에 추가
            conversation_history.append({"role": "user", "content": user_message})

            # 모르는 단어 검색
            search_results = google_search(user_message)
            search_content = "\n".join(search_results) if search_results else ""

            # GPT로부터 응답 생성
            bot_reply = generate_reply(conversation_history)
            if search_content:
                bot_reply += "\n\n관련 정보:\n" + search_content

            # GPT로부터 응답 생성
            bot_reply = generate_reply(conversation_history)

            # Redis에 저장
            redis_client = get_redis_connection("default")
            chat_data = {
                "role": "assistant",
                "content": bot_reply,
                "timestamp": str(datetime.now())
            }  

            print('bot 대답 redis 객체만들기 완료')

            # 세션별로 대화 저장
            redis_key = f"chat:{session_id}:messages"
            redis_client.rpush(redis_key, json.dumps(chat_data))

            print('redis에 bot 대답 세션별 저장 완료')


            # 챗봇 응답 히스토리에 추가
            conversation_history.append({"role": "assistant", "content": bot_reply})

            return JsonResponse({'message': bot_reply})

        except json.JSONDecodeError:
            return JsonResponse({'error': '유효한 JSON 형식이 아닙니다.'}, status=400)

    return JsonResponse({'error': 'POST 요청만 지원합니다.'}, status=405)
