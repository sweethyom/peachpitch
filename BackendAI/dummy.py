import requests
import json

# Django 서버가 실행 중인 URL
base_url = 'http://127.0.0.1:8000/ai'
history_id = 'test123'  # 테스트용 임의의 세션 ID

# 1. 대화 시작: start_conversation 호출
start_url = f"{base_url}/start/"
keyword = input("대화를 시작할 키워드를 입력하세요: ")

start_payload = {
    "keyword": keyword,
    "history_id": history_id
}
start_response = requests.post(start_url, json=start_payload)
print("1️⃣ 대화 시작 응답:", start_response.json())

# 2. 이어서 9번의 continue_conversation 호출 (사용자 입력 받기)
continue_url = f"{base_url}/chat/"
for i in range(11):
    user_message = input(f"사용자 메시지 {i+1}를 입력하세요: ")
    
    payload = {
        "message": user_message,
        "history_id": history_id
    }
    response = requests.post(continue_url, json=payload)
    print(f"➡️ 턴 {i+2} 응답:", response.json())

    # 대화가 조기 종료될 경우 루프 탈출
    if "대화가 종료되었습니다" in response.json().get("message", ""):
        break
