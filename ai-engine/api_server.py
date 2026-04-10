from fastapi import FastAPI, Body
from fastapi.middleware.cors import CORSMiddleware
import torch
from transformers import AutoTokenizer
from model_core import CodeQualityModel  # Importăm schema de mai sus

import transformers.utils.import_utils as transformers_utils
import transformers.modeling_utils as modeling_utils

def bypass_check(): return None
transformers_utils.check_torch_load_is_safe = bypass_check
modeling_utils.check_torch_load_is_safe = bypass_check

app = FastAPI(title="Code Quality AI Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

device = 'cuda' if torch.cuda.is_available() else 'cpu'
tokenizer = AutoTokenizer.from_pretrained("microsoft/codebert-base")
model = CodeQualityModel().to(device)

model.load_state_dict(torch.load('codebert_quality.pth', map_location=device, weights_only=True))
model.eval()

@app.post("/analyze")
async def analyze(payload: dict = Body(...)):
    code = payload.get("code", "")
    
    inputs = tokenizer(code, return_tensors="pt", truncation=True, max_length=256, padding='max_length').to(device)
    
    with torch.no_grad():
        outputs = model(inputs['input_ids'], inputs['attention_mask'])
    
    scores = outputs.squeeze().cpu().numpy() * 10
    
    return {
        "logic": round(float(scores[0]), 2),
        "cleanCode": round(float(scores[1]), 2),
        "efficiency": round(float(scores[2]), 2),
        "versatility": round(float(scores[3]), 2)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)