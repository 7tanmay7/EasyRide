# EasyRide — ML Service FastAPI Application

from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional
import os
import joblib
import json
import numpy as np

app = FastAPI(
    title="EasyRide ML Service",
    version="1.0.0",
    description="Machine learning predictions for cancellation risk, demand forecasting, and driver acceptance."
)

models_dir = os.path.join(os.path.dirname(__file__), "models")
canc_model_path = os.path.join(models_dir, "cancellation_model.pkl")

canc_model = None
if os.path.exists(canc_model_path):
    try:
        canc_model = joblib.load(canc_model_path)
    except Exception as e:
        print("[ML Service Warning] Failed loading cancellation_model.pkl:", e)

class CancellationRequest(BaseModel):
    distanceKm: float
    durationMin: float
    surgeMultiplier: float
    finalFare: float

class CancellationResponse(BaseModel):
    probability: float
    riskLevel: str
    factors: List[str]

@app.get("/health")
def health():
    return {"status": "OK", "service": "EasyRide ML Service (Python)", "modelsLoaded": canc_model is not None}

@app.post("/predict/cancellation", response_model=CancellationResponse)
def predict_cancellation(req: CancellationRequest):
    factors = []
    
    if canc_model is not None:
        try:
            X = np.array([[req.distanceKm, req.durationMin, req.surgeMultiplier, req.finalFare]])
            prob = float(canc_model.predict_proba(X)[0][1])
        except Exception:
            prob = 0.15
    else:
        prob = 0.15

    if req.surgeMultiplier > 1.3:
        prob += 0.15
        factors.append("Surge pricing multiplier above threshold")
    if req.distanceKm > 15.0:
        prob += 0.10
        factors.append("Long haul trip distance")

    prob = min(0.95, max(0.02, round(prob, 2)))
    
    risk_level = "LOW"
    if prob > 0.6: risk_level = "CRITICAL"
    elif prob > 0.4: risk_level = "HIGH"
    elif prob > 0.2: risk_level = "MEDIUM"
    
    if not factors:
        factors.append("Normal trip parameters")

    return CancellationResponse(
        probability=prob,
        riskLevel=risk_level,
        factors=factors
    )
