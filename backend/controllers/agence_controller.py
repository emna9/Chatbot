import json
from math import radians, cos, sin, asin, sqrt
from typing import List
from models.agence import Agence

# Load agences data once at startup
with open("data/split_knowledge_base/agences.json", encoding="utf-8") as f:
    agences_data = json.load(f)

# Convert raw dicts to Agence models
agences = [Agence(**{
    **ag,
    "latitude": float(ag.get("latitude") or 0),
    "longitude": float(ag.get("longitude") or 0),
    "distance_km": 0.0
}) for ag in agences_data]

def haversine(lon1, lat1, lon2, lat2):
    # Convert decimal degrees to radians
    lon1, lat1, lon2, lat2 = map(radians, [lon1, lat1, lon2, lat2])

    # Haversine formula
    dlon = lon2 - lon1
    dlat = lat2 - lat1
    a = sin(dlat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(dlon / 2) ** 2
    c = 2 * asin(sqrt(a))
    r = 6371  # Radius of earth in km
    return c * r

def find_nearest_agences(user_lat: float, user_lng: float, limit: int = 5) -> List[Agence]:
    for ag in agences:
        ag.distance_km = haversine(user_lng, user_lat, ag.longitude, ag.latitude)
    sorted_agences = sorted(agences, key=lambda x: x.distance_km)
    return sorted_agences[:limit]
