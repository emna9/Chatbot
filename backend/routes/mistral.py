from fastapi import APIRouter, Request
from pydantic import BaseModel, Field
from controllers.mistral_controller import generate_course_response
from slowapi import Limiter
from slowapi.util import get_remote_address

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

class CourseRequest(BaseModel):
    topic: str = Field(..., min_length=1)
    language: str = Field(default="fr", min_length=2, max_length=2)


@router.post("/generate-course")
@limiter.limit("5/minute")
async def generate_course(request: Request, payload: CourseRequest):
    return await generate_course_response(payload)
