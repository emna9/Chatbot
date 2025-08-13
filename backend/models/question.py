from pydantic import BaseModel
from typing import List

class Question(BaseModel):
    id: int
    branch: str
    question: str
    tags: List[str]
