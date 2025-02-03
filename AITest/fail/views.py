# chatbot/views.py
import os
import torch
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from transformers import GPT2LMHeadModel, GPT2TokenizerFast
import json

# Django settings 또는 현재 파일의 경로를 기준으로 모델 경로 지정
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(BASE_DIR, "trained_models", "chatbot_model")

# 모델과 토크나이저 로드 (서버 시작 시 한 번만 실행)
tokenizer = GPT2TokenizerFast.from_pretrained(MODEL_PATH)
model = GPT2LMHeadModel.from_pretrained(MODEL_PATH)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model.to(device)

@csrf_exempt
def chat_api(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            keyword = data.get("keyword", "")
            conversation = data.get("conversation", "")
        except (json.JSONDecodeError, KeyError):
            return JsonResponse({"error": "잘못된 입력입니다."}, status=400)

        prompt = f"키워드: {keyword}\n{conversation}\nGPT: "
        input_ids = tokenizer.encode(prompt, return_tensors="pt").to(device)
        
        outputs = model.generate(
            input_ids,
            max_length=input_ids.shape[1] + 50,
            pad_token_id=tokenizer.eos_token_id,
            do_sample=True,
            top_k=50,
            top_p=0.95
        )
        output_text = tokenizer.decode(outputs[0], skip_special_tokens=True)
        response_text = output_text[len(prompt):].strip()

        if "사용자:" in response_text:
            response_text = response_text.split("사용자:")[0].strip()
        
        return JsonResponse({"response": response_text})
    else:
        return JsonResponse({"error": "POST 요청만 허용됩니다."}, status=405)
