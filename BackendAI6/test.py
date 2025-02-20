import json
import requests
import re

from .chatbot import generate_initial_message, generate_reply

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from django_redis import get_redis_connection

from datetime import datetime

# 구글 API 설정
GOOGLE_API_KEY = settings.GOOGLE_API_KEY
GOOGLE_CX = settings.GOOGLE_CX

# 구글 검색 함수: 최대 3개의 snippet을 반환합니다.
def google_search(query):
    url = "https://www.googleapis.com/customsearch/v1"
    params = {"key": GOOGLE_API_KEY, "cx": GOOGLE_CX, "q": query}
    response = requests.get(url, params=params)
    if response.status_code == 200:
        data = response.json()
        return [item["snippet"] for item in data.get("items", [])[:3]]
    else:
        return []

# 대화 히스토리와 턴 관리
conversation_history = []
conversation_turn = 0

@csrf_exempt
def start_conversation(request):
    global conversation_turn
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            keyword = data.get('keyword', '')
            history_id = data.get('history_id')

            if not keyword:
                return JsonResponse({'error': '키워드를 입력하세요.'}, status=400)

            # 초기 메시지 생성
            initial_message = generate_initial_message(keyword)

            # 새 대화 시작: 기존 히스토리 초기화 및 첫 메시지 기록
            conversation_history.clear()
            conversation_turn = 1
            conversation_history.append({"role": "user", "content": f"키워드: {keyword}"})
            conversation_history.append({"role": "assistant", "content": initial_message})
        
            # history_id가 제공되면 Redis에 저장
            if history_id:
                redis_key = f"chat:{history_id}:messages"
                redis_client = get_redis_connection("default")
                chat_data = {
                    "role": "assistant",
                    "content": initial_message,
                    "timestamp": str(datetime.now())
                }
                redis_client.rpush(redis_key, json.dumps(chat_data))
                redis_client.expire(redis_key, 60*60*24)
            
            return JsonResponse({'message': initial_message})
        
        except json.JSONDecodeError:
            return JsonResponse({'error': '유효한 JSON 형식이 아닙니다.'}, status=400)
    
    return JsonResponse({'error': 'POST 요청만 지원합니다.'}, status=405)

@csrf_exempt
def continue_conversation(request):
    global conversation_turn, conversation_history
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            user_message = data.get('message', '')
            history_id = data.get('history_id')

            if not user_message:
                return JsonResponse({'error': '사용자 메시지를 입력하세요.'}, status=400)
            
            # 사용자 메시지를 대화 히스토리에 추가
            conversation_history.append({"role": "user", "content": user_message})

            # history_id가 있을 경우, 사용자 메시지를 Redis에 저장
            if history_id:
                redis_client = get_redis_connection("default")
                redis_key = f"chat:{history_id}:messages"
                chat_data = {
                    "role": "user",
                    "content": user_message,
                    "timestamp": str(datetime.now())
                }
                redis_client.rpush(redis_key, json.dumps(chat_data))
                redis_client.expire(redis_key, 60*60*24)

            # ✅ **10턴 이상이면 바로 종료 메시지 생성 (불필요한 bot_reply 연산 방지)**
            if conversation_turn >= 10:
                recent_conversation = conversation_history[7:]
                final_prompt = {
                    "role": "system",
                    "content": (
                        "지금까지의 대화 내용을 참고해서 마무리 인사를 해주세요. "
                        "대화의 주제를 간단히 언급하고, 따뜻한 인사를 남겨주세요. "
                        "예를 들어, 고양이에 대한 대화였다면 '오늘 고양이에 대한 이야기 너무 즐거웠어! 다음에 또 만나!'와 같이 작성하세요."
                    )
                }
                final_message = generate_reply(recent_conversation + [final_prompt])
                conversation_history.append({"role": "assistant", "content": final_message})
                return JsonResponse({'message': final_message})

            # ✅ **그 외의 경우 정상적으로 RAG 적용**
            else:
                # 1️⃣ 우선 기본 답변 생성 (외부 검색 없이)
                bot_reply = generate_reply(conversation_history)

                # 2️⃣ 기본 답변이 '모르' 계열 표현 포함 시, 검색 실행
                if any(uncertain in bot_reply for uncertain in ["모르", "잘 모르", "알지 못"]):
                    search_results = google_search(user_message)
                    if search_results:
                        search_content = "\n".join(search_results)
                        # 검색 결과를 시스템 메시지로 추가해 대화 히스토리를 보강하고 재생성
                        augmented_history = conversation_history + [{
                            "role": "system",
                            "content": f"참고자료 (구글 검색 결과):\n{search_content}"
                        }]
                        bot_reply = generate_reply(augmented_history)

                import re

                # 정규식 패턴으로 한번에 검사
                if re.search(r"모르|잘 모르|알지 못", bot_reply):
                    search_results = google_search(user_message)
                    if search_results:
                        search_content = "\n".join(search_results)
                        augmented_history = conversation_history + [{
                            "role": "system",
                            "content": f"참고자료 (구글 검색 결과):\n{search_content}"
                        }]
                        bot_reply = generate_reply(augmented_history)


                # 3️⃣ 최종 답변을 히스토리에 추가 및 대화 턴 증가
                conversation_history.append({"role": "assistant", "content": bot_reply})
                conversation_turn += 1

                # 4️⃣ history_id가 있을 경우, 챗봇 응답을 Redis에 저장
                if history_id:
                    redis_client = get_redis_connection("default")
                    redis_key = f"chat:{history_id}:messages"
                    chat_data = {
                        "role": "assistant",
                        "content": bot_reply,
                        "timestamp": str(datetime.now())
                    }
                    redis_client.rpush(redis_key, json.dumps(chat_data))
                    redis_client.expire(redis_key, 60*60*24)

                return JsonResponse({'message': bot_reply})

        except json.JSONDecodeError:
            return JsonResponse({'error': '유효한 JSON 형식이 아닙니다.'}, status=400)
    
    return JsonResponse({'error': 'POST 요청만 지원합니다.'}, status=405)
