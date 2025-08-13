from typing import List
import json
from fastapi import HTTPException
from models.question import Question
from pathlib import Path

# Load questions from the JSON file
file_path = Path("data/questions.json")

def load_questions_from_json() -> List[Question]:
    with open(file_path, encoding="utf-8") as f:
        data = json.load(f)
    return [Question(**q) for q in data]

def get_questions_by_tags(user_tags: List[str]) -> List[Question]:
    questions = load_questions_from_json()
    matched_questions = []

    lowered_tags = [tag.strip().lower() for tag in user_tags]

    for q in questions:
        question_tags = [tag.lower() for tag in q.tags]
        if any(tag in question_tags for tag in lowered_tags):
            matched_questions.append(q)

    if not matched_questions:
        raise HTTPException(status_code=404, detail="No questions found for the provided tags.")

    return matched_questions
