from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from .chatbot import generate_initial_message, generate_reply

# 대화 히스토리 관리 (프론트엔드에서 관리하거나 DB로 옮길 수 있음)
conversation_history = []  # 이 부분은 프론트에서 히스토리를 받아올 수도 있음

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


@csrf_exempt
def start_conversation(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            keyword = data.get('keyword', '')

            if not keyword:
                return JsonResponse({'error': '키워드를 입력하세요.'}, status=400)

            initial_message = generate_initial_message(keyword)
            
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

            if not user_message:
                return JsonResponse({'error': '사용자 메시지를 입력하세요.'}, status=400)

            # 사용자 메시지 히스토리에 추가
            conversation_history.append({"role": "user", "content": user_message})

            # GPT로부터 응답 생성
            bot_reply = generate_reply(conversation_history)

            # 챗봇 응답 히스토리에 추가
            conversation_history.append({"role": "assistant", "content": bot_reply})

            return JsonResponse({'message': bot_reply})

        except json.JSONDecodeError:
            return JsonResponse({'error': '유효한 JSON 형식이 아닙니다.'}, status=400)

    return JsonResponse({'error': 'POST 요청만 지원합니다.'}, status=405)
