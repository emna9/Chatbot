import os
import json
import httpx
import logging
from fastapi import HTTPException
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY")
MISTRAL_ENDPOINT = "https://api.mistral.ai/v1/chat/completions"
MODEL_NAME = "mistral-small"

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

async def generate_course_response(payload):
    if not MISTRAL_API_KEY:
        raise HTTPException(status_code=500, detail="Missing API key")

    context_chunks = KNOWLEDGE_BASE
    context_text = "\n\n".join(
        f"- {item.get('title', '').strip()}\n{item.get('content', '').strip()}"
        for item in context_chunks
        if item.get('title') and item.get('content')
    )

    system_prompt = f"""
Tu es un assistant virtuel intelligent avec accès à une base de connaissances.

Quand un utilisateur pose une question :

- Si la réponse peut être donnée par un fait simple ou un chiffre issu des données, réponds directement.
- Si la question est large, donne un résumé global ou une vue regroupée.
- Pour les listes volumineuses, fournis un résumé et demande si l’utilisateur veut les détails d’un sous-ensemble spécifique.
- Si la question est floue, pose une question clarificatrice.
- Utilise uniquement les données fournies pour répondre.

Base de connaissances :
{context_text}
"""

    messages = [
        {
            "role": "system",
            "content": system_prompt
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
        raise HTTPException(status_code=500, detail=f"Erreur interne : {str(e)}")

