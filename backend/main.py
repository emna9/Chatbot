from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
import httpx
import os
import logging
import json
from dotenv import load_dotenv
from slowapi import Limiter
from slowapi.util import get_remote_address
from routes import questions

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

app = FastAPI()
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(questions.router)
@app.get("/")
async def root():
    return {"message": "Welcome to COMAR chatbot backend!"}


MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY")
MISTRAL_ENDPOINT = "https://api.mistral.ai/v1/chat/completions"
MODEL_NAME = "mistral-small"

# Load split knowledge base
def load_split_knowledge_base(folder_path="split_knowledge_base"):
    all_chunks = []
    try:
        for filename in os.listdir(folder_path):
            if filename.endswith(".json"):
                filepath = os.path.join(folder_path, filename)
                with open(filepath, "r", encoding="utf-8") as f:
                    chunks = json.load(f)
                    if isinstance(chunks, list):
                        all_chunks.extend(chunks)
        logger.info(f"Loaded {len(all_chunks)} knowledge chunks from split files.")
    except Exception as e:
        logger.error("Error loading split knowledge base: %s", e)
    return all_chunks

KNOWLEDGE_BASE = load_split_knowledge_base()

class CourseRequest(BaseModel):
    topic: str = Field(..., min_length=1)
    level: str = Field(..., min_length=1)
    language: str = Field(default="fr", min_length=2, max_length=2)

@app.post("/generate-course")
@limiter.limit("5/minute")
async def generate_course(request: Request, payload: CourseRequest):
    if not MISTRAL_API_KEY:
        raise HTTPException(status_code=500, detail="Missing API key")

    context_chunks = KNOWLEDGE_BASE[:10]
    context_text = "\n\n".join(
        f"- {item.get('title', '').strip()}\n{item.get('content', '').strip()}"
        for item in context_chunks
        if item.get('title') and item.get('content')
    )

    messages = [
        {
            "role": "system",
            "content": (
                f"Tu es un assistant virtuel pour COMAR Assurances. "
                f"Réponds toujours en {payload.language}. "
                f"Utilise les informations suivantes pour répondre aux utilisateurs :\n\n"
                f"{context_text}"
            )
        },
        {
            "role": "user",
            "content": payload.topic
        }
    ]

    headers = {
        "Authorization": f"Bearer {MISTRAL_API_KEY}",
        "Content-Type": "application/json",
        "Accept": "application/json"
    }

    data = {
        "model": MODEL_NAME,
        "messages": messages,
        "temperature": 0.7
    }

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(MISTRAL_ENDPOINT, headers=headers, json=data)
            response.raise_for_status()
            result = response.json()
            return {
                "answer": result["choices"][0]["message"]["content"],
                "question": payload.topic
            }

    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail=f"API Error: {e.response.text}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(status_code=exc.status_code, content={"message": exc.detail})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True) 