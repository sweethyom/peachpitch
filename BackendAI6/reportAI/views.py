import json
import openai
from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.urls import path
from .models import Chat, ChatReport, ChatHistory, User
from django.conf import settings

openai.api_key = settings.OPENAI_API_KEY
@csrf_exempt
def generate_report(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        history_id = data.get('history_id')
        if not history_id:
            return JsonResponse({"error": "history_id가 필요합니다."}, status=400)
        history = get_object_or_404(ChatHistory, pk=history_id)
        
        reports = []
        # 각 사용자(user1_id, user2_id) 별로 별도의 리포트 생성
        for user_id in [history.user1_id, history.user2_id]:
            if user_id is None:
                continue

            # 해당 사용자의 객체를 가져오거나 생성합니다.
            user_obj, _ = User.objects.get_or_create(user_id=user_id)

            # 동일한 history와 user에 대해 이미 ChatReport가 존재하면 새로 생성하지 않습니다.
            if ChatReport.objects.filter(history=history, user=user_obj).exists():
                continue
            
            # 해당 사용자의 채팅만 필터링
            chats = Chat.objects.filter(history=history, user_id=user_id)
            conversation_data = "\n".join(chat.content for chat in chats if chat.content)
            
            # 사용자별 대화 내용에 대해 프롬프트 작성
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

            
            response = openai.ChatCompletion.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": "당신은 대화 분석 전문가입니다. 사용자의 대화를 분석하세요."},
                    {"role": "user", "content": prompt}
                ]
            )

            report_content = response.choices[0].message['content']
            try:
                parsed_report = json.loads(report_content)
                strengths = parsed_report.get("strengths", [])
                weaknesses = parsed_report.get("weaknesses", [])
                summary = parsed_report.get("summary", [])
            except json.JSONDecodeError:
                strengths, weaknesses, summary = ['상대와의 대화를 이어가려는 노력이 돋보입니다. 말을 잘하지 못한다고 생각할 수도 있지만, 중요한 것은 상대방에게 다가가고자 하는 의지입니다. 당신은 그 노력을 충분히 보여주고 있습니다.'], ['자신의 의견을 표현하는 데 어려움을 느끼는 듯합니다. 생각이 많아 망설이다 보면 대화의 흐름을 놓칠 수도 있습니다.'], ['대화란 단순히 말을 많이 하는 것이 아니라, 서로의 생각과 감정을 주고받는 과정입니다. 당신은 이미 상대의 이야기를 귀 기울여 듣고 있으며, 대화에 대한 노력이 느껴집니다. 작은 변화들이 쌓이면 점점 더 자연스러운 대화를 할 수 있을 것입니다.']

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

            reports.append({
                "report_id": chat_report.report_id,
                "user_id": user_id,
                "pros": strengths,
                "cons": weaknesses,
                "summary": summary
            })
        
        return JsonResponse({"reports": reports})
    else:
        return JsonResponse({"error": "POST 요청만 지원합니다."}, status=400)
