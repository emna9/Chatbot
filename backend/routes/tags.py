from fastapi import APIRouter, Query
from typing import List
from controllers.tag_controller import get_questions_by_tags
from models.question import Question

router = APIRouter()

@router.get("/tags/questions", response_model=List[Question])
def fetch_questions_by_tags(tags: List[str] = Query(..., description="List of tags to filter questions")):
    return get_questions_by_tags(tags)
