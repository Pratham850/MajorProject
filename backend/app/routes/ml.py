from __future__ import annotations
from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import User
from app.repositories.prediction_repository import PredictionRepository
from app.routes.dependencies import get_current_user
from app.schemas.predictions import PredictionHistoryItem, PredictionRequest, PredictionResponse
from app.services.prediction_service import PredictionService

router = APIRouter()


def get_prediction_service(db: AsyncSession = Depends(get_db)) -> PredictionService:
    """Dependency injection helper for PredictionService."""
    pred_repo = PredictionRepository(db)
    return PredictionService(pred_repo, db)


# ----------------------------------------------------------------------
# 1. Disease Prediction Endpoint (POST /ml/predict)
# ----------------------------------------------------------------------
@router.post(
    "/predict",
    response_model=PredictionResponse,
    status_code=status.HTTP_200_OK,
    summary="Disease prediction endpoint",
    description="Runs Scikit-learn Polynomial Regression prediction model for a specific disease and year, saving outcome to history.",
)
async def predict_disease(
    req: PredictionRequest,
    current_user: User = Depends(get_current_user),
    prediction_service: PredictionService = Depends(get_prediction_service),
):
    """
    Executes Scikit-learn ML model prediction and records history.
    """
    return await prediction_service.predict_and_save(current_user, req)


# ----------------------------------------------------------------------
# 2. Retrieve Prediction History (GET /ml/history)
# ----------------------------------------------------------------------
@router.get(
    "/history",
    response_model=List[PredictionHistoryItem],
    summary="Retrieve prediction history",
    description="Returns list of past ML predictions executed by the logged-in user.",
)
async def get_prediction_history(
    current_user: User = Depends(get_current_user),
    prediction_service: PredictionService = Depends(get_prediction_service),
):
    """
    Retrieves user's prediction history.
    """
    return await prediction_service.get_history(current_user)


# ----------------------------------------------------------------------
# 3. Aggregate Disease Predictions (GET /ml/predictions)
# ----------------------------------------------------------------------
@router.get(
    "/predictions",
    response_model=List[dict],
    summary="Get disease trend forecasts (2026-2030)",
    description="Returns scikit-learn trend predictions for Oncology, Cardiology, and Infectious Diseases.",
)
async def get_disease_predictions(
    current_user: User = Depends(get_current_user),
    prediction_service: PredictionService = Depends(get_prediction_service),
):
    """
    Returns aggregate trend predictions for 2026-2030.
    """
    return await prediction_service.get_all_disease_trends()
