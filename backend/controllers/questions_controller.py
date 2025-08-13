import json
from pathlib import Path

DATA_PATH = Path(__file__).resolve().parent.parent / "data" / "questions.json"

def load_all_questions():
    with open(DATA_PATH, encoding="utf-8") as f:
        return json.load(f)

def get_questions_by_branch(branch_name: str):
    questions = load_all_questions()
    return [q for q in questions if q["branch"].lower() == branch_name.lower()]

def search_questions_by_tag(tag: str):
    questions = load_all_questions()
    return [q for q in questions if tag.lower() in [t.lower() for t in q["tags"]]]
