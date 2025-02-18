import openai
import json
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from reportAI.models import Chat, TotalReport, User, SpeakingHabits, ChatHistory

# OpenAI API Key 설정
openai.api_key = settings.OPENAI_API_KEY

# 불필요한 단어 목록
stopwords = ["안녕하세요", "감사합니다", "환영합니다", "수고하세요", "잘 지내세요"]

# stopwords 필터링 함수
def filter_stopwords_and_zero(result_json):
    return {
        word: count for word, count in result_json.items()
        if word not in stopwords and count > 0
    }

# AI 분석 로직
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

        # ChatHistory 객체 조회
        history = ChatHistory.objects.filter(pk=history_id).first()
        if not history:
            return Response({"error": "해당 history_id에 해당하는 채팅 내역이 없습니다."}, status=status.HTTP_404_NOT_FOUND)
        
        # history와 연결된 모든 Chat 메시지 조회
        chats = Chat.objects.filter(history=history, user_id=history.user1_id)
        if not chats.exists():
            return Response({"error": "해당 history_id에 채팅 데이터가 없습니다."}, status=status.HTTP_404_NOT_FOUND)

        combined_content = "\n".join(chat.content for chat in chats if chat.content)
        
        try:
            analysis_result = analyze_repeated_words(combined_content)
            result_data = json.loads(analysis_result)

            # stopwords와 0 값 필터링 적용
            filtered_result = filter_stopwords_and_zero(result_data)

            # 사용자 조회: user1이 존재하면 user1, 없으면 user2 사용
            if history.user1_id:
                user_id = history.user1_id
            elif history.user2_id:
                user_id = history.user2_id
            else:
                return Response({"error": "사용자 정보가 존재하지 않습니다."}, status=status.HTTP_404_NOT_FOUND)
            user_obj, created = User.objects.get_or_create(user_id=user_id)

            # TotalReport 조회 또는 생성
            total_report, created = TotalReport.objects.get_or_create(
                user=user_obj,
                defaults={
                    'ans_count': 0,
                    'quest_count': 0,
                    'total_chat_time': 0
                }
            )

            # SpeakingHabits 누적 업데이트
            for word, new_count in filtered_result.items():
                habit, created = SpeakingHabits.objects.get_or_create(
                    word=word,
                    total_report=total_report,
                    defaults={'count': new_count}
                )
                if not created:
                    habit.count += new_count
                    habit.save()

            return Response({"message": "분석 완료", "data": filtered_result}, status=status.HTTP_200_OK)
        
        except json.JSONDecodeError:
            return Response({"error": "AI 분석 결과를 JSON으로 파싱할 수 없습니다."}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
