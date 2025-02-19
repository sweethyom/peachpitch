import openai
import json
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from reportAI.models import Chat, TotalReport, User, SpeakingHabits, ChatHistory

openai.api_key = settings.OPENAI_API_KEY

# 불필요한 단어 목록
stopwords = ["안녕하세요", "감사합니다", "환영합니다", "수고하세요", "잘 지내세요"]

# stopwords 필터링 함수
def filter_stopwords_and_zero(result_json):
    return {
        word: count for word, count in result_json.items()
        if word not in stopwords and count > 0
    }

# AI 분석 로직: 텍스트 내 명사 및 반복 횟수를 JSON으로 반환
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

class WordAnalysisView(APIView):
    def post(self, request):
        history_id = request.data.get('history_id')
        if not history_id:
            return Response({"error": "history_id가 필요합니다."}, status=status.HTTP_400_BAD_REQUEST)
        history = ChatHistory.objects.filter(pk=history_id).first()
        if not history:
            return Response({"error": "해당 history_id에 해당하는 채팅 내역이 없습니다."}, status=status.HTTP_404_NOT_FOUND)
        
        results = {}
        # 두 사용자(user1, user2) 각각에 대해 단어 분석 진행 (user_id가 null이면 건너뜀)
        for user_id in [history.user1_id, history.user2_id]:
            if user_id is None:
                continue
            chats = Chat.objects.filter(history=history, user_id=user_id)
            if not chats.exists():
                results[user_id] = {"error": "해당 사용자에 대한 채팅 데이터가 없습니다."}
                continue
            combined_content = "\n".join(chat.content for chat in chats if chat.content)
            try:
                analysis_result = analyze_repeated_words(combined_content)
                result_data = json.loads(analysis_result)
                filtered_result = filter_stopwords_and_zero(result_data)
                user_obj, created = User.objects.get_or_create(user_id=user_id)
                total_report, created = TotalReport.objects.get_or_create(
                    user=user_obj,
                    defaults={'ans_count': 0, 'quest_count': 0, 'total_chat_time': 0}
                )
                # 기존 단어 누적 값에 새로운 카운트 추가
                for word, new_count in filtered_result.items():
                    habit, created = SpeakingHabits.objects.get_or_create(
                        word=word,
                        total_report=total_report,
                        defaults={'count': new_count}
                    )
                    if not created:
                        habit.count += new_count
                        habit.save()
                results[user_id] = filtered_result
            except json.JSONDecodeError:
                results[user_id] = {"error": "AI 분석 결과를 JSON으로 파싱할 수 없습니다."}
            except Exception as e:
                results[user_id] = {"error": str(e)}
        return Response({"message": "분석 완료", "data": results}, status=status.HTTP_200_OK)
