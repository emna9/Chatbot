import os
import json
import httpx
import logging
from fastapi import HTTPException
from dotenv import load_dotenv
from controllers.retrieval import retriever

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


def format_chunk_content(chunk):
    # Prioritize 'content' field if available and non-empty
    if "content" in chunk and chunk["content"].strip():
        return chunk["content"]
    # Otherwise, compose a summary string from known fields
    parts = []
    if "nom" in chunk:
        parts.append(f"Nom: {chunk['nom']}")
    if "type" in chunk:
        parts.append(f"Type: {chunk['type']}")
    if "adresse" in chunk:
        parts.append(f"Adresse: {chunk['adresse']}")
    if "telephone" in chunk:
        parts.append(f"Téléphone: {chunk['telephone']}")
    if "fax" in chunk:
        parts.append(f"Fax: {chunk['fax']}")
    if "email" in chunk and chunk["email"].strip():
        parts.append(f"Email: {chunk['email']}")
    if "code_agence" in chunk:
        parts.append(f"Code Agence: {chunk['code_agence']}")
    if "latitude" in chunk and "longitude" in chunk:
        parts.append(f"Coordinates: {chunk['latitude']}, {chunk['longitude']}")
    return ", ".join(parts)


async def generate_course_response(payload):
    if not MISTRAL_API_KEY:
        logger.error("Clé API manquante")
        raise HTTPException(status_code=500, detail="Clé API manquante")

    # Étape 1 : Récupération des chunks pertinents
    try:
        logger.info(f"Récupération des chunks pour : {payload.topic}")
        top_chunks = retriever.retrieve(payload.topic, top_k=5)
        # Debug: afficher ce qui est récupéré
        logger.debug(f"Chunks récupérés : {[format_chunk_content(chunk) for chunk in top_chunks]}")
    except Exception as e:
        logger.exception("Erreur lors de la récupération des chunks")
        raise HTTPException(status_code=500, detail="Erreur lors de la récupération du contexte")

    # Étape 2 : Préparation du prompt avec les chunks formatés
    context_text = "\n\n".join(f"- {format_chunk_content(chunk)}" for chunk in top_chunks)
    system_prompt = f"""
    Tu es un assistant virtuel pour COMAR Assurances avec accès à une base de connaissances.

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
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": payload.topic}
    ]

    data = {
        "model": MODEL_NAME,
        "messages": messages,
        "temperature": 0.7
    }

    headers = {
        "Authorization": f"Bearer {MISTRAL_API_KEY}",
        "Content-Type": "application/json",
        "Accept": "application/json"
    }

    # Étape 3 : Appel à l'API Mistral
    try:
        logger.info(f"Appel à l'API Mistral avec le modèle {MODEL_NAME}")
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(MISTRAL_ENDPOINT, headers=headers, json=data)
            response.raise_for_status()
            result = response.json()
            logger.debug(f"Réponse brute de l'API : {result}")
            answer = result["choices"][0]["message"]["content"]
            return {
                "answer": answer,
                "question": payload.topic
            }

    except httpx.HTTPStatusError as e:
        logger.error(f"Erreur HTTP lors de l'appel à Mistral : {e.response.text}")
        raise HTTPException(status_code=e.response.status_code, detail=f"Erreur API Mistral : {e.response.text}")
    except Exception as e:
        logger.exception("Erreur inattendue lors de l'appel à Mistral")
        raise HTTPException(status_code=500, detail=f"Erreur interne : {str(e)}")
