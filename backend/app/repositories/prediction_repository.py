from __future__ import annotations
from typing import List
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import PredictionRecord


class PredictionRepository:
    """
    Data Access Repository for PredictionRecord entities.
    """

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, user_id: int, disease_focus: str, target_year: int, predicted_value: float) -> PredictionRecord:
        """Create and persist a new prediction history entry."""
        rec = PredictionRecord(
            user_id=user_id,
            disease_focus=disease_focus,
            target_year=target_year,
            predicted_value=predicted_value,
        )
        self.db.add(rec)
        await self.db.flush()
        return rec

    async def list_by_user(self, user_id: int) -> List[PredictionRecord]:
        """Retrieve prediction history for a specific user."""
        result = await self.db.execute(
            select(PredictionRecord)
            .filter(PredictionRecord.user_id == user_id)
            .order_by(PredictionRecord.id.desc())
        )
        return list(result.scalars().all())
