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

# 대화 히스토리 관리 
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

            if not history_id:
                return JsonResponse({'error': 'history_id is required'}, status=400)

            if not keyword:
                return JsonResponse({'error': '키워드를 입력하세요.'}, status=400)



            # 구글 검색 결과 추가
            search_results = google_search(keyword)
            search_content = "\n".join(search_results) if search_results else ""

            initial_message = generate_initial_message(keyword)
            # if search_content:
            #     initial_message += "\n\n최근 검색 결과:\n" + search_content
            

            # Redis 키 생성 전에 history_id 타입 확인
            redis_key = f"chat:{history_id}:messages"
            print("Redis key:", redis_key)

            # Redis에 저장
            redis_client = get_redis_connection("default")
            chat_data = {
                "role": "assistant",
                "content": initial_message,
                "timestamp": str(datetime.now())
            }  

            print('redis 객체만들기 완료')

            # 세션별로 대화 저장
            redis_key = f"chat:{history_id}:messages"
            redis_client.rpush(redis_key, json.dumps(chat_data))

            print('redis에 세션별 저장 완료')
            # 24시간 후 만료되도록 설정(후에 변경)
            redis_client.expire(redis_key, 60*60*24)

            # 히스토리에 추가
            conversation_history.clear()  # 새로운 대화 시작 시 이전 기록 초기화
            conversation_turn = 1
            conversation_history.append({"role": "user", "content": f"키워드: {keyword}"})
            conversation_history.append({"role": "assistant", "content": initial_message})

            return JsonResponse({'message': initial_message})

        except json.JSONDecodeError:
            return JsonResponse({'error': '유효한 JSON 형식이 아닙니다.'}, status=400)

    return JsonResponse({'error': 'POST 요청만 지원합니다.'}, status=405)


@csrf_exempt
def continue_conversation(request):
    global conversation_turn
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            user_message = data.get('message', '')
            history_id = data.get('history_id') 

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
            redis_key = f"chat:{history_id}:messages"
            redis_client.rpush(redis_key, json.dumps(chat_data))

            print('redis에 사용자 응답 세션별 저장 완료')

            # 24시간 후 만료되도록 설정(후에 변경)
            redis_client.expire(redis_key, 60*60*24)

            # 사용자 메시지 히스토리에 추가
            conversation_history.append({"role": "user", "content": user_message})

            if conversation_turn >= 10:
                recent_conversation = conversation_history[7:]

                final_prompt = {
                    "role": "system",
                    "content": "지금까지의 대화 내용을 참고해서 마무리 인사를 해주세요. "
                               "대화의 주제를 간단히 언급하고, 따뜻한 인사를 남겨주세요. "
                               "예를 들어, 고양이에 대한 대화였다면 '오늘 고양이에 대한 이야기 너무 즐거웠어! 다음에 또 만나!'와 같이 작성하세요."
                }
                final_message = generate_reply(recent_conversation + [final_prompt])
                conversation_history.append({"role": "assistant", "content": final_message})

                
                chat_data = {
                    "role": "assistant",
                    "content": final_message,
                    "timestamp": str(datetime.now())
                }

                return JsonResponse({'message': final_message})
            
            else:
                # 모르는 단어 검색
                search_results = google_search(user_message)
                search_content = "\n".join(search_results) if search_results else ""

                # GPT로부터 응답 생성
                bot_reply = generate_reply(conversation_history)
                # if search_content:
                #     bot_reply += "\n\n관련 정보:\n" + search_content

                # 챗봇 응답 히스토리에 추가
                conversation_history.append({"role": "assistant", "content": bot_reply})
                conversation_turn += 1
                
                # Redis에 저장
                redis_client = get_redis_connection("default")
                chat_data = {
                    "role": "assistant",
                    "content": bot_reply,
                    "timestamp": str(datetime.now())
                }  

                print('bot 대답 redis 객체만들기 완료')

                # 세션별로 대화 저장
                redis_key = f"chat:{history_id}:messages"
                redis_client.rpush(redis_key, json.dumps(chat_data))

                print('redis에 bot 대답 세션별 저장 완료')



                return JsonResponse({'message': bot_reply})

        except json.JSONDecodeError:
            return JsonResponse({'error': '유효한 JSON 형식이 아닙니다.'}, status=400)

    return JsonResponse({'error': 'POST 요청만 지원합니다.'}, status=405)

# import json
# import requests

# from .chatbot import generate_initial_message, generate_reply

# from django.http import JsonResponse
# from django.views.decorators.csrf import csrf_exempt
# from django.conf import settings
# from django_redis import get_redis_connection

# from datetime import datetime



# # 구글 API 설정
# GOOGLE_API_KEY = settings.GOOGLE_API_KEY
# GOOGLE_CX = settings.GOOGLE_CX

# # 구글 검색 함수
# def google_search(query):
#     url = "https://www.googleapis.com/customsearch/v1"
#     params = {"key": GOOGLE_API_KEY, "cx": GOOGLE_CX, "q": query}
#     response = requests.get(url, params=params)
#     if response.status_code == 200:
#         data = response.json()
#         return [item["snippet"] for item in data.get("items", [])[:3]]
#     else:
#         return []

# # 대화 히스토리 관리 
# conversation_history = []
# conversation_turn = 0

# @csrf_exempt
# def start_conversation(request):
#     if request.method == "POST":
#         try:
#             data = json.loads(request.body)
#             keyword = data.get('keyword', '')
#             history_id = data.get('history_id')

#             if not history_id:
#                 return JsonResponse({'error': 'history_id is required'}, status=400)

#             if not keyword:
#                 return JsonResponse({'error': '키워드를 입력하세요.'}, status=400)



#             # 구글 검색 결과 추가
#             search_results = google_search(keyword)
#             search_content = "\n".join(search_results) if search_results else ""

#             initial_message = generate_initial_message(keyword)
#             # if search_content:
#             #     initial_message += "\n\n최근 검색 결과:\n" + search_content
            

#             # Redis 키 생성 전에 history_id 타입 확인
#             redis_key = f"chat:{history_id}:messages"
#             print("Redis key:", redis_key)

#             # Redis에 저장
#             redis_client = get_redis_connection("default")
#             chat_data = {
#                 "role": "assistant",
#                 "content": initial_message,
#                 "timestamp": str(datetime.now())
#             }  

#             print('redis 객체만들기 완료')

#             # 세션별로 대화 저장
#             redis_key = f"chat:{history_id}:messages"
#             redis_client.rpush(redis_key, json.dumps(chat_data))

#             print('redis에 세션별 저장 완료')
#             # 24시간 후 만료되도록 설정(후에 변경)
#             redis_client.expire(redis_key, 60*60*24)

#             # 히스토리에 추가
#             conversation_history.clear()  # 새로운 대화 시작 시 이전 기록 초기화
#             conversation_turn = 1
#             conversation_history.append({"role": "user", "content": f"키워드: {keyword}"})
#             conversation_history.append({"role": "assistant", "content": initial_message})

#             return JsonResponse({'message': initial_message})

#         except json.JSONDecodeError:
#             return JsonResponse({'error': '유효한 JSON 형식이 아닙니다.'}, status=400)

#     return JsonResponse({'error': 'POST 요청만 지원합니다.'}, status=405)


# @csrf_exempt
# def continue_conversation(request):
#     global conversation_turn
#     if request.method == "POST":
#         try:
#             data = json.loads(request.body)
#             user_message = data.get('message', '')
#             history_id = data.get('history_id') 

#             if not user_message:
#                 return JsonResponse({'error': '사용자 메시지를 입력하세요.'}, status=400)
            
#             # Redis에 저장
#             redis_client = get_redis_connection("default")
#             chat_data = {
#                 "role": "user",
#                 "content": user_message,
#                 "timestamp": str(datetime.now())
#             }  

#             print('사용자 응답 redis 객체만들기 완료')

#             # 세션별로 대화 저장
#             redis_key = f"chat:{history_id}:messages"
#             redis_client.rpush(redis_key, json.dumps(chat_data))

#             print('redis에 사용자 응답 세션별 저장 완료')

#             # 24시간 후 만료되도록 설정(후에 변경)
#             redis_client.expire(redis_key, 60*60*24)

#             # 사용자 메시지 히스토리에 추가
#             conversation_history.append({"role": "user", "content": user_message})
#             conversation_turn += 1

#             # 모르는 단어 검색
#             search_results = google_search(user_message)
#             search_content = "\n".join(search_results) if search_results else ""

#             # GPT로부터 응답 생성
#             bot_reply = generate_reply(conversation_history)
#             # if search_content:
#             #     bot_reply += "\n\n관련 정보:\n" + search_content

#             # GPT로부터 응답 생성
#             bot_reply = generate_reply(conversation_history)

#             # Redis에 저장
#             redis_client = get_redis_connection("default")
#             chat_data = {
#                 "role": "assistant",
#                 "content": bot_reply,
#                 "timestamp": str(datetime.now())
#             }  

#             print('bot 대답 redis 객체만들기 완료')

#             # 세션별로 대화 저장
#             redis_key = f"chat:{history_id}:messages"
#             redis_client.rpush(redis_key, json.dumps(chat_data))

#             print('redis에 bot 대답 세션별 저장 완료')


#             # 챗봇 응답 히스토리에 추가
#             conversation_history.append({"role": "assistant", "content": bot_reply})

#             return JsonResponse({'message': bot_reply})

#         except json.JSONDecodeError:
#             return JsonResponse({'error': '유효한 JSON 형식이 아닙니다.'}, status=400)

#     return JsonResponse({'error': 'POST 요청만 지원합니다.'}, status=405)