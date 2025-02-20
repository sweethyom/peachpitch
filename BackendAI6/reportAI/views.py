import json
import openai
import logging
from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.urls import path
from .models import Chat, ChatReport, ChatHistory, User
from django.conf import settings

# 로깅 설정
logger = logging.getLogger(__name__)

openai.api_key = settings.OPENAI_API_KEY

@csrf_exempt
def generate_report(request):
    logger.info("generate_report 호출됨.")
    
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            history_id = data.get('history_id')
            logger.info(f"받은 데이터: {data}")

            if not history_id:
                logger.error("history_id가 제공되지 않음.")
                return JsonResponse({"error": "history_id가 필요합니다."}, status=400)

            history = get_object_or_404(ChatHistory, pk=history_id)
            logger.info(f"조회된 ChatHistory: {history}")

            reports = []

            # 각 사용자(user1_id, user2_id) 별로 별도의 리포트 생성
            for user_id in [history.user1_id, history.user2_id]:
                if user_id is None:
                    logger.warning("user_id가 None, 건너뜀.")
                    continue

                # 해당 사용자의 객체를 가져오거나 생성합니다.
                user_obj, created = User.objects.get_or_create(user_id=user_id)
                logger.info(f"조회된/생성된 User: {user_obj}, 새로 생성됨: {created}")

                # 동일한 history와 user에 대해 이미 ChatReport가 존재하면 새로 생성하지 않습니다.
                if ChatReport.objects.filter(history=history, user=user_obj).exists():
                    logger.info(f"이미 생성된 리포트가 존재함 (user_id={user_id}, history_id={history_id}), 건너뜀.")
                    continue
                
                # 해당 사용자의 채팅만 필터링
                chats = Chat.objects.filter(history=history, user_id=user_id)
                logger.info(f"조회된 채팅 개수: {chats.count()}")

                conversation_data = "\n".join(chat.content for chat in chats if chat.content)
                logger.debug(f"사용자({user_id})의 대화 내용:\n{conversation_data}")

                # 프롬프트 작성
                prompt = (
                    "다음 대화를 분석하고, 강점 3가지, 약점 3가지, 총평 3문장을 도출해 주세요.\n"
                    "출력은 반드시 아래 JSON 형식으로만 응답해야 합니다:\n\n"
                    "{\n"
                    '  "strengths": ["", "", ""],\n'
                    '  "weaknesses": ["", "", ""],\n'
                    '  "summary": ["", "", ""]\n'
                    "}\n\n"
                    f"대화 내용:\n{conversation_data}\n"
                )

                try:
                    response = openai.ChatCompletion.create(
                        model="gpt-4o",
                        messages=[
                            {"role": "system", "content": "당신은 대화 분석 전문가입니다. 사용자의 대화를 분석하세요."},
                            {"role": "user", "content": prompt}
                        ]
                    )
                    report_content = response.choices[0].message['content']
                    logger.info(f"GPT 응답: {report_content}")

                    parsed_report = json.loads(report_content)
                    strengths = parsed_report.get("strengths", [])
                    weaknesses = parsed_report.get("weaknesses", [])
                    summary = parsed_report.get("summary", [])
                except json.JSONDecodeError as e:
                    logger.error(f"GPT 응답 JSON 파싱 실패: {e}")
                    strengths = ["대화를 이끌어 가려는 노력이 돋보입니다."]
                    weaknesses = ["자신의 의견을 명확히 표현하는 것이 어려울 수 있습니다."]
                    summary = ["전반적으로 대화 흐름이 원활했지만 개선할 여지가 있습니다."]

                # ChatReport 저장
                chat_report, created = ChatReport.objects.get_or_create(
                    history=history,
                    user=user_obj,
                    defaults={
                        "chat_time": 0,
                        "pros": ' '.join(strengths),
                        "cons": ' '.join(weaknesses),
                        "summary": ' '.join(summary)
                    }
                )

                logger.info(f"ChatReport 생성됨 (report_id={chat_report.report_id}, user_id={user_id})")

                reports.append({
                    "report_id": chat_report.report_id,
                    "user_id": user_id,
                    "pros": strengths,
                    "cons": weaknesses,
                    "summary": summary
                })

            logger.info("모든 리포트 생성 완료.")
            return JsonResponse({"reports": reports})
        except Exception as e:
            logger.error(f"예기치 않은 오류 발생: {e}", exc_info=True)
            return JsonResponse({"error": str(e)}, status=500)
    
    logger.warning("POST 요청이 아님.")
    return JsonResponse({"error": "POST 요청만 지원합니다."}, status=400)
