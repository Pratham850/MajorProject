from __future__ import annotations
from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import Prescription


class PrescriptionRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, doctor_id: int, **kwargs) -> Prescription:
        prescription = Prescription(doctor_id=doctor_id, **kwargs)
        self.session.add(prescription)
        await self.session.commit()
        await self.session.refresh(prescription)
        return prescription

    async def get_by_id(self, prescription_id: int) -> Optional[Prescription]:
        result = await self.session.execute(
            select(Prescription).where(Prescription.id == prescription_id)
        )
        return result.scalar_one_or_none()

    async def list_by_user(self, user_id: int) -> List[Prescription]:
        result = await self.session.execute(
            select(Prescription).where(
                (Prescription.patient_id == user_id) | (Prescription.doctor_id == user_id)
            ).order_by(Prescription.created_at.desc())
        )
        return list(result.scalars().all())
