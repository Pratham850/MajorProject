from __future__ import annotations
from typing import Any, Dict, List
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.ml_model import predict_trend
from app.models import User, AuditLog, PredictionType
from app.repositories.prediction_repository import PredictionRepository
from app.repositories.audit_repository import AuditRepository
from app.schemas.ai_predictions import AIPredictionCreate, AIPredictionResponse
from app.schemas.predictions import PredictionRequest, PredictionResponse


class PredictionService:
    def __init__(self, prediction_repo: PredictionRepository, db: AsyncSession):
        self.prediction_repo = prediction_repo
        self.db = db
        self.audit_repo = AuditRepository(db)

    async def create_ai_prediction(self, patient_id: int, payload: AIPredictionCreate) -> AIPredictionResponse:
        prediction = await self.prediction_repo.create_ai_prediction(
            patient_id=patient_id,
            prediction_type=payload.prediction_type,
            result=payload.result,
            confidence=payload.confidence,
            model_version=payload.model_version,
            report_path=payload.report_path
        )
        await self.audit_repo.log_action(
            user_id=patient_id,
            action="CREATE_AI_PREDICTION",
            details=f"Generated AI prediction {payload.prediction_type.value}: {payload.result}"
        )
        return AIPredictionResponse.from_orm(prediction)

    async def get_patient_ai_history(self, patient_id: int) -> List[AIPredictionResponse]:
        predictions = await self.prediction_repo.list_ai_predictions_by_patient(patient_id)
        return [AIPredictionResponse.from_orm(p) for p in predictions]


    async def predict_and_save(self, current_user: User, req: PredictionRequest) -> Dict[str, Any]:
        predicted_val = predict_trend(req.year, req.disease)
        saved_rec = await self.prediction_repo.create(
            user_id=current_user.id,
            disease_focus=req.disease,
            target_year=req.year,
            predicted_value=predicted_val,
        )
        await self.audit_repo.log_action(
            user_id=current_user.id,
            action="ML Prediction Executed",
            details=f"Executed trend prediction for '{req.disease}' in year {req.year}. Predicted Count: {predicted_val}."
        )
        return {
            "id": saved_rec.id,
            "disease": req.disease,
            "year": req.year,
            "predictedValue": predicted_val,
            "message": f"Successfully predicted {predicted_val} projected cases for {req.disease} in {req.year}.",
        }

    async def get_history(self, current_user: User) -> List[Dict[str, Any]]:
        history = await self.prediction_repo.list_by_user(current_user.id)
        return [
            {
                "id": h.id,
                "disease": h.disease_focus,
                "year": h.target_year,
                "predictedValue": h.predicted_value,
                "createdAt": h.created_at.strftime("%Y-%m-%d %H:%M:%S"),
            }
            for h in history
        ]
