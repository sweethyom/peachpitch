import openai
from django.conf import settings

openai.api_key = settings.OPENAI_API_KEY

# 공통 system 프롬프트
SYSTEM_PROMPT = {
    "role": "system",
    "content": (
        "당신은 친근하고 자연스러운 대화를 이끌어가는 챗봇입니다. "
        "반말을 사용하세요. "
        "모든 대화의 맥락을 기억하면서 사용자와 자연스러운 대화를 진행하세요."
    )
}

# 초기 대화 메시지 생성 (키워드 기반)
def generate_initial_message(keyword: str) -> str:
    messages = [
        SYSTEM_PROMPT,
        {"role": "user", "content": f"키워드: {keyword}"}
    ]
    
    try:
        response = openai.ChatCompletion.create(
            model="gpt-4o",
            messages=messages,
            temperature=0.7
        )
        return response['choices'][0]['message']['content'].strip()
    except Exception as e:
        return f"오류 발생: {e}"

# 대화 진행 (멀티턴)
def generate_reply(conversation_history):
    messages = [SYSTEM_PROMPT] + conversation_history  # system 프롬프트 + 대화 이력

    try:
        response = openai.ChatCompletion.create(
            model="gpt-4o",
            messages=messages,
            temperature=0.7,
        )
        return response['choices'][0]['message']['content'].strip()
    except Exception as e:
        return f"오류 발생: {e}"
