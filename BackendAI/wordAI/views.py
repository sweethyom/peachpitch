import openai
import json
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import SpeakingHabits
from reportAI.models import Chat
from reportAI.models import Totalreport

# OpenAI API Key 설정
openai.api_key = settings.OPENAI_API_KEY

# AI 분석 로직 (ChatCompletion API 사용)
def analyze_repeated_words(content):
    prompt = (
        f"다음 텍스트에서 반복되는 단어와 각각의 횟수를 JSON 형식으로 알려줘. "
        f"형식은 반드시 {{\"단어\": 횟수}} 형태로만 응답해. 설명은 절대 추가하지 말고 JSON으로만 응답해: {content}"
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

# View
class WordAnalysisView(APIView):
    def post(self, request):
        user_id = request.data.get('user_id')
        
        if not user_id:
            return Response({"error": "user_id가 필요합니다."}, status=status.HTTP_400_BAD_REQUEST)

        chats = Chat.objects.filter(userid=user_id)
        if not chats.exists():
            return Response({"error": "해당 사용자의 채팅 데이터가 없습니다."}, status=status.HTTP_404_NOT_FOUND)

        combined_content = " ".join([chat.content for chat in chats if chat.content])
        
        try:
            analysis_result = analyze_repeated_words(combined_content)
            result_data = json.loads(analysis_result)

            total_report = Totalreport.objects.filter(user_id=user_id).first()
            if not total_report:
                return Response({"error": "해당 사용자에 대한 Totalreport가 없습니다."}, status=status.HTTP_404_NOT_FOUND)
            
            for word, count in result_data.items():
                SpeakingHabits.objects.update_or_create(
                    word=word,
                    defaults={'count': count}
                )
            return Response({"message": "분석 완료", "data": result_data}, status=status.HTTP_200_OK)
        
        except json.JSONDecodeError:
            return Response({"error": "AI 분석 결과를 JSON으로 파싱할 수 없습니다."}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
