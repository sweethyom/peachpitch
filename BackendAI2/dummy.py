# 모델 실험용용

import openai
import json

# OpenAI API Key 설정
openai.api_key = ""  # 여기에 본인의 API 키 입력

# 불필요한 단어(인사말 외에 또 있으면 여기 넣자.) 리스트
stopwords = ["안녕하세요", "감사합니다", "환영합니다", "수고하세요", "잘 지내세요"]

# 기존 분석 함수
def analyze_repeated_words(content):
    prompt = (
        f"다음 텍스트에서 **명사**만 추출하고, 각각의 반복 횟수를 JSON 형식으로 알려줘. "
        f"형식은 반드시 {{\"단어\": 횟수}} 형태로만 응답해. "
        f"**조사, 감탄사, 접속사, 동사, 형용사, 인사말(예: 안녕하세요, 감사합니다 등)은 포함하지 마.** "
        f"설명은 절대 추가하지 말고 JSON으로만 응답해: {content}"
    )
    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "너는 텍스트 분석을 전문으로 하는 AI야."},
            {"role": "user", "content": prompt}
        ],
        max_tokens=500
    )
    return response.choices[0].message['content']

# stopwords 필터링 함수
def filter_stopwords_and_zero(result_json):
    return {
        word: count for word, count in result_json.items()
        if word not in stopwords and count > 0
    }

# 테스트용 입력 데이터
test_content = """
안녕하세요. 오늘은 날씨가 참 좋네요. 날씨가 좋으니까 기분도 좋아요.
저도 오늘 산책을 나갔어요. 산책을 하니까 기분이 상쾌해졌어요.
"""

# 함수 호출 및 결과 출력
try:
    result = analyze_repeated_words(test_content)
    print("AI 분석 결과 (원본):")
    print(result)

    # JSON 파싱 시도
    result_json = json.loads(result)

    # 불필요한 인사말 및 0 값 제거
    filtered_result = filter_stopwords_and_zero(result_json)

    print("\n파싱된 JSON 결과 (인사말 및 0 값 제거 후):")
    print(json.dumps(filtered_result, indent=4, ensure_ascii=False))

except json.JSONDecodeError:
    print("\n❌ 오류: AI의 응답을 JSON으로 파싱할 수 없습니다.")
except Exception as e:
    print(f"\n❌ 오류 발생: {e}")

