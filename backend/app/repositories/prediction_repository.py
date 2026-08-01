from __future__ import annotations
from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import AIPrediction, PredictionRecord, PredictionType


class PredictionRepository:
    """
    Data Access Repository for AIPrediction and PredictionRecord entities.
    """

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_ai_prediction(
        self,
        patient_id: int,
        prediction_type: PredictionType,
        result: str,
        confidence: float,
        model_version: str,
        report_path: Optional[str] = None
    ) -> AIPrediction:
        prediction = AIPrediction(
            patient_id=patient_id,
            prediction_type=prediction_type,
            result=result,
            confidence=confidence,
            model_version=model_version,
            report_path=report_path
        )
        self.db.add(prediction)
        await self.db.commit()
        await self.db.refresh(prediction)
        return prediction

    async def list_ai_predictions_by_patient(self, patient_id: int) -> List[AIPrediction]:
        result = await self.db.execute(
            select(AIPrediction)
            .where(AIPrediction.patient_id == patient_id)
            .order_by(AIPrediction.created_at.desc())
        )
        return list(result.scalars().all())

    async def create(self, user_id: int, disease_focus: str, target_year: int, predicted_value: float) -> PredictionRecord:
        """Create and persist a new prediction history entry."""
        rec = PredictionRecord(
            user_id=user_id,
            disease_focus=disease_focus,
            target_year=target_year,
            predicted_value=predicted_value,
        )
        self.db.add(rec)
        await self.db.commit()
        await self.db.refresh(rec)
        return rec

    async def list_by_user(self, user_id: int) -> List[PredictionRecord]:
        """Retrieve prediction history for a specific user."""
        result = await self.db.execute(
            select(PredictionRecord)
            .filter(PredictionRecord.user_id == user_id)
            .order_by(PredictionRecord.id.desc())
        )
        return list(result.scalars().all())
