from __future__ import annotations
from typing import Any, Dict, List
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.ml_model import predict_trend
from app.models import User, AuditLog
from app.repositories.prediction_repository import PredictionRepository
from app.schemas.predictions import PredictionRequest, PredictionResponse


class PredictionService:
    """
    Service layer containing business logic for executing Scikit-learn predictions,
    saving prediction history, and retrieving user prediction logs.
    """

    def __init__(self, prediction_repo: PredictionRepository, db: AsyncSession):
        self.prediction_repo = prediction_repo
        self.db = db

    async def predict_and_save(self, current_user: User, req: PredictionRequest) -> Dict[str, Any]:
        """
        Business Logic:
        1. Executes Scikit-learn Polynomial Regression model via `predict_trend(year, disease)`.
        2. Persists the prediction outcome into PredictionRecord history table.
        3. Writes AuditLog record.
        """
        predicted_val = predict_trend(req.year, req.disease)

        saved_rec = await self.prediction_repo.create(
            user_id=current_user.id,
            disease_focus=req.disease,
            target_year=req.year,
            predicted_value=predicted_val,
        )

        audit = AuditLog(
            user_id=current_user.id,
            action="ML Prediction Executed",
            details=f"Executed trend prediction for '{req.disease}' in year {req.year}. Predicted Count: {predicted_val}.",
        )
        self.db.add(audit)
        await self.db.commit()

        return {
            "id": saved_rec.id,
            "disease": req.disease,
            "year": req.year,
            "predictedValue": predicted_val,
            "message": f"Successfully predicted {predicted_val} projected cases for {req.disease} in {req.year}.",
        }

    async def get_history(self, current_user: User) -> List[Dict[str, Any]]:
        """
        Business Logic:
        Retrieves historical prediction records for the current user.
        """
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

    async def get_all_disease_trends(self) -> List[Dict[str, Any]]:
        """
        Business Logic:
        Generates aggregate trend predictions for 2026-2030 across core diseases.
        """
        years = [2026, 2027, 2028, 2029, 2030]
        prediction_data = []
        for year in years:
            oncology_pred = predict_trend(year, "Oncology")
            cardiology_pred = predict_trend(year, "Cardiology")
            infectious_pred = predict_trend(year, "Infectious Diseases")
            prediction_data.append({
                "year": str(year),
                "Oncology": int(oncology_pred),
                "Cardiology": int(cardiology_pred),
                "InfectiousDiseases": int(infectious_pred),
            })
        return prediction_data
