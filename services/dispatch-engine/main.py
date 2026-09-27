"""
EasyRide — Intelligent Dispatch Engine (Python FastAPI Microservice)
Implements hard constraint candidate filtering and multi-metric soft scoring.
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional
import math

app = FastAPI(
    title="EasyRide Intelligent Dispatch Engine",
    version="1.0.0",
    description="Multi-metric driver scoring and route dispatch optimization engine."
)

class PickupDropLocation(BaseModel):
    address: str
    lat: float
    lng: float
    zoneId: Optional[str] = None

class BookingPayload(BaseModel):
    id: str
    serviceTypeId: str
    serviceCategory: str
    pickup: PickupDropLocation
    dropoff: PickupDropLocation
    distanceKm: float
    estimatedDurationMin: float

class DriverCandidate(BaseModel):
    id: str
    name: str
    vehicleType: str
    status: str
    rating: float
    acceptanceRate: float
    cancellationRate: float
    totalTrips: int
    totalEarnings: float
    currentLat: float
    currentLng: float

class DispatchRequest(BaseModel):
    booking: BookingPayload
    candidates: List[DriverCandidate]
    maxRadiusKm: float = 6.0

class ScoredCandidate(BaseModel):
    driverId: str
    driverName: str
    distanceKm: float
    etaMin: float
    acceptanceProbability: float
    score: float

def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371.0
    d_lat = math.radians(lat2 - lat1)
    d_lon = math.radians(lon2 - lon1)
    a = (math.sin(d_lat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(d_lon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 2)

@app.get("/health")
def health_check():
    return {"status": "OK", "service": "EasyRide Dispatch Engine (Python)"}

@app.post("/dispatch/score", response_model=List[ScoredCandidate])
def score_dispatch_candidates(req: DispatchRequest):
    scored: List[ScoredCandidate] = []
    
    for drv in req.candidates:
        if drv.status != "ONLINE":
            continue
            
        dist_km = haversine_km(drv.currentLat, drv.currentLng, req.booking.pickup.lat, req.booking.pickup.lng)
        if dist_km > req.maxRadiusKm * 1.5:
            continue
            
        eta_min = max(2.0, round(dist_km * 3.0 + 1.0, 1))
        
        # 0-1 Score Normalizations
        proximity_score = max(0.0, 1.0 - (dist_km / req.maxRadiusKm))
        eta_score = max(0.0, 1.0 - (eta_min / 15.0))
        acceptance_prob = min(0.99, max(0.3, (drv.acceptanceRate / 100.0)))
        utilization_score = 1.0 - min(1.0, (drv.totalTrips % 15) / 15.0)
        earnings_score = max(0.0, 1.0 - min(drv.totalEarnings, 5000.0) / 5000.0)
        dest_demand_score = 0.85
        
        # Formula:
        # 0.30 * proximity + 0.20 * eta + 0.20 * acceptance + 0.15 * utilization + 0.10 * earnings + 0.05 * dest_demand
        final_score = (
            0.30 * proximity_score +
            0.20 * eta_score +
            0.20 * acceptance_prob +
            0.15 * utilization_score +
            0.10 * earnings_score +
            0.05 * dest_demand_score
        )
        
        scored.append(ScoredCandidate(
            driverId=drv.id,
            driverName=drv.name,
            distanceKm=dist_km,
            etaMin=eta_min,
            acceptanceProbability=round(acceptance_prob, 2),
            score=round(final_score, 4)
        ))
        
    scored.sort(key=lambda x: x.score, reverse=True)
    return scored
