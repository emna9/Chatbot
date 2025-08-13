from pydantic import BaseModel

class Agence(BaseModel):
    nom: str
    gouvernorat: str
    adresse: str
    telephone: str
    fax: str
    email: str
    code_agence: str
    latitude: float
    longitude: float
    image_url: str
    page_url: str
    type: str
    distance_km: float = 0.0  # calculated distance, default 0
