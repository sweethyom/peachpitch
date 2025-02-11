import openai
import json
import redis
import time
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import SpeakingHabits
from reportAI.models import Chat, Totalreport, User

# OpenAI API Key 설정
openai.api_key = settings.OPENAI_API_KEY

# 불필요한 단어(인사말 외에 또 있으면 여기 넣자.) 리스트
stopwords = ["안녕하세요", "감사합니다", "환영합니다", "수고하세요", "잘 지내세요"]

# stopwords 필터링 함수
def filter_stopwords_and_zero(result_json):
    return {
        word: count for word, count in result_json.items()
        if word not in stopwords and count > 0
    }

# AI 분석 로직 (ChatCompletion API 사용)
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

        # Redis 설정
        redis_client = redis.Redis(
            host=settings.REDIS_HOST,
            port=settings.REDIS_PORT,
            db=getattr(settings, 'REDIS_DB', 0)
        )
        redis_key = f"chat:{history_id}:messages"

        # Polling 시작 (최대 30초 대기)
        timeout = 30
        start_time = time.time()

        while redis_client.exists(redis_key):
            if time.time() - start_time > timeout:
                return Response({"error": "대기 시간 초과. 나중에 다시 시도해랏"}, status=408)
            time.sleep(1)   # 1초 간격 확인

        # 모델 실행, history_id에 연결된 모든 chat 데이터 가져오기
        chats = Chat.objects.filter(history_id=history_id)
        if not chats.exists():
            return Response({"error": "해당 history_id에 채팅 데이터가 없습니다."}, status=status.HTTP_404_NOT_FOUND)

        combined_content = "\n".join(chat.content for chat in chats if chat.content)
        
        try:
            analysis_result = analyze_repeated_words(combined_content)
            result_data = json.loads(analysis_result)

            # stopwords, 0 값 필터링 적용
            filtered_result = filter_stopwords_and_zero(result_data)

            # 사용자 정보 가져오기 (Chat의 첫 데이터 기준)
            user_instance = User.objects.filter(userid=chats.first().userid).first()
            if not user_instance:
                return Response({"error": "해당 사용자 정보가 존재하지 않습니다."}, status=status.HTTP_404_NOT_FOUND)

            # Totalreport 존재 여부 확인, 없으면 생성 => 이 부분 논리 맞는지 백이랑 체크
            total_report, created = Totalreport.objects.get_or_create(
                user=user_instance,
                defaults={
                    'anscount': 0,
                    'questcount': 0,
                    'totalchattime': 0
                }
            )

            # SpeakingHabits 누적
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
