from __future__ import annotations
from datetime import datetime
from typing import List, Optional
from sqlalchemy import select, func
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

    async def create(
        self,
        record_id: int,
        doctor_id: int,
        status: str = "Active",
        purpose: Optional[str] = None,
        expires_at: Optional[datetime] = None
    ) -> Consent:
        """Persist a new Consent record."""
        now = datetime.now()
        new_consent = Consent(
            record_id=record_id,
            doctor_id=doctor_id,
            status=status,
            purpose=purpose,
            approved_at=now,
            expires_at=expires_at,
        )
        self.db.add(new_consent)
        await self.db.flush()
        await self.db.commit()
        await self.db.refresh(new_consent)
        return new_consent

    async def update_status(
        self,
        consent_id: int,
        status: str,
        purpose: Optional[str] = None,
        expires_at: Optional[datetime] = None
    ) -> Optional[Consent]:
        consent = await self.get_by_id(consent_id)
        if not consent:
            return None
        consent.status = status
        if purpose is not None:
            consent.purpose = purpose
        if expires_at is not None:
            consent.expires_at = expires_at
        if status == "Active" and not consent.approved_at:
            consent.approved_at = datetime.now()
        await self.db.commit()
        await self.db.refresh(consent)
        return consent

    async def list_by_patient(self, patient_id: int) -> List[Consent]:
        """Retrieve all consent grants for records owned by patient."""
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
        """Retrieve all consent grants awarded to a doctor."""
        result = await self.db.execute(
            select(Consent)
            .filter(Consent.doctor_id == doctor_id)
            .options(
                selectinload(Consent.record).selectinload(MedicalRecord.patient),
            )
        )
        return list(result.scalars().all())

    async def count_active_for_patient(self, patient_id: int) -> int:
        result = await self.db.execute(
            select(func.count(Consent.id))
            .join(Consent.record)
            .where(
                MedicalRecord.patient_id == patient_id,
                Consent.status == "Active"
            )
        )
        return result.scalar() or 0

    async def delete(self, consent: Consent) -> None:
        """Delete a consent record from database."""
        await self.db.delete(consent)
        await self.db.commit()
