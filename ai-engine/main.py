from fastapi import FastAPI
from pydantic import BaseModel
from analyzer import CodeAnalyzer
import uvicorn

app = FastAPI()

# Inițializăm analyzer-ul o singură dată la pornire
# CodeBERT va fi încărcat în RAM/GPU acum
analyzer = CodeAnalyzer()

class CodeSubmission(BaseModel):
    code: str
    language: str

@app.post("/analyze")
async def analyze_code(submission: CodeSubmission):
    print(f"--- ANALIZĂ SEMANTICĂ (CodeBERT) ---")
    
    # Rulăm logica complexă din analyzer.py
    result = analyzer.analyze(submission.code)
    
    print(f"Scoruri calculate: {result}")
    return result

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)