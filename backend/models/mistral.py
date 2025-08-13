from pydantic import BaseModel, Field

class CourseRequest(BaseModel):
    topic: str = Field(..., min_length=1)
    language: str = Field(default="fr", min_length=2, max_length=2)

