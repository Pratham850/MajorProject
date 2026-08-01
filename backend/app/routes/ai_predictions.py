from __future__ import annotations
from typing import List, Any
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.models import User
from app.repositories.prediction_repository import PredictionRepository
from app.schemas.ai_predictions import AIPredictionCreate, AIPredictionResponse
from app.schemas.predictions import PredictionRequest
from app.services.prediction_service import PredictionService

router = APIRouter(prefix="/ai", tags=["AI Predictions"])


@router.post("/predict", response_model=AIPredictionResponse, status_code=status.HTTP_201_CREATED)
async def create_ai_prediction(
    payload: AIPredictionCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = PredictionService(PredictionRepository(db), db)
    return await service.create_ai_prediction(payload.patient_id, payload)


@router.get("/history", response_model=List[AIPredictionResponse], status_code=status.HTTP_200_OK)
async def get_ai_prediction_history(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = PredictionService(PredictionRepository(db), db)
    return await service.get_patient_ai_history(current_user.id)


@router.post("/trend-forecast", status_code=status.HTTP_200_OK)
async def forecast_trend(
    payload: PredictionRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = PredictionService(PredictionRepository(db), db)
    return await service.predict_and_save(current_user, payload)
