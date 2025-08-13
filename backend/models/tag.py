# models/tag.py
from pydantic import BaseModel
from typing import List

class TagRequest(BaseModel):
    tags: List[str]
