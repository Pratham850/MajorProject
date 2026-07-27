from __future__ import annotations
from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models import Consent, MedicalRecord, User


class ConsentRepository:
    """
    Data Access Repository for Consent entities.
    """

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, consent_id: int) -> Optional[Consent]:
        """Fetch consent by primary key ID."""
        result = await self.db.execute(
            select(Consent)
            .filter(Consent.id == consent_id)
            .options(
                selectinload(Consent.record),
                selectinload(Consent.doctor),
            )
        )
        return result.scalars().first()

    async def get_existing(self, record_id: int, doctor_id: int) -> Optional[Consent]:
        """Check if an active consent grant exists for (record_id, doctor_id)."""
        result = await self.db.execute(
            select(Consent).filter(Consent.record_id == record_id, Consent.doctor_id == doctor_id)
        )
        return result.scalars().first()

    async def create(self, record_id: int, doctor_id: int) -> Consent:
        """Persist a new Consent record."""
        new_consent = Consent(record_id=record_id, doctor_id=doctor_id)
        self.db.add(new_consent)
        await self.db.flush()
        return new_consent

    async def list_by_patient(self, patient_id: int) -> List[Consent]:
        """Retrieve all active consent grants for records owned by patient."""
        result = await self.db.execute(
            select(Consent)
            .join(Consent.record)
            .filter(MedicalRecord.patient_id == patient_id)
            .options(
                selectinload(Consent.record),
                selectinload(Consent.doctor),
            )
        )
        return list(result.scalars().all())

    async def list_by_doctor(self, doctor_id: int) -> List[Consent]:
        """Retrieve all active consent grants awarded to a doctor."""
        result = await self.db.execute(
            select(Consent)
            .filter(Consent.doctor_id == doctor_id)
            .options(
                selectinload(Consent.record).selectinload(MedicalRecord.patient),
            )
        )
        return list(result.scalars().all())

    async def delete(self, consent: Consent) -> None:
        """Delete a consent record from database."""
        await self.db.delete(consent)
