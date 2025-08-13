from fastapi import APIRouter
from typing import List
from models.question import Question
from controllers import questions_controller

router = APIRouter(prefix="/questions", tags=["Questions"])

@router.get("/", response_model=List[Question])
def all_questions():
    return questions_controller.load_all_questions()

@router.get("/branch/{branch_name}", response_model=List[Question])
def questions_by_branch(branch_name: str):
    return questions_controller.get_questions_by_branch(branch_name)

@router.get("/search/{tag}", response_model=List[Question])
def questions_by_tag(tag: str):
    return questions_controller.search_questions_by_tag(tag)
