from fastapi import APIRouter, Query, HTTPException
from typing import List
from controllers.agence_controller import find_nearest_agences
from models.agence import Agence

router = APIRouter()

@router.get("/nearby-agences", response_model=List[Agence])
def get_nearby_agences(
    lat: float = Query(..., description="User latitude"),
    lng: float = Query(..., description="User longitude"),
    limit: int = Query(5, description="Number of nearest agences to return"),
):
    if not (-90 <= lat <= 90) or not (-180 <= lng <= 180):
        raise HTTPException(status_code=400, detail="Invalid latitude or longitude values")

    agences = find_nearest_agences(user_lat=lat, user_lng=lng, limit=limit)
    return agences
