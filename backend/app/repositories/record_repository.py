from __future__ import annotations
from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models import MedicalRecord, Consent, User


class RecordRepository:
    """
    Data Access Repository for MedicalRecord entities.
    """

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, record_id: int) -> Optional[MedicalRecord]:
        """Fetch record by ID with patient & consents eagerly loaded."""
        result = await self.db.execute(
            select(MedicalRecord)
            .filter(MedicalRecord.id == record_id)
            .options(
                selectinload(MedicalRecord.patient),
                selectinload(MedicalRecord.consents).selectinload(Consent.doctor),
            )
        )
        return result.scalars().first()

    async def create(
        self,
        patient_id: int,
        title: str,
        category: str,
        file_path: str,
        file_size: str,
    ) -> MedicalRecord:
        """Create and persist a new MedicalRecord entry."""
        new_record = MedicalRecord(
            patient_id=patient_id,
            title=title,
            category=category,
            file_path=file_path,
            file_size=file_size,
        )
        self.db.add(new_record)
        await self.db.flush()
        return new_record

    async def list_by_patient(self, patient_id: int) -> List[MedicalRecord]:
        """Retrieve all medical records for a specific patient."""
        result = await self.db.execute(
            select(MedicalRecord)
            .filter(MedicalRecord.patient_id == patient_id)
            .options(selectinload(MedicalRecord.consents).selectinload(Consent.doctor))
            .order_by(MedicalRecord.id.desc())
        )
        return list(result.scalars().all())

    async def list_consented_for_doctor(self, doctor_id: int) -> List[MedicalRecord]:
        """Retrieve all medical records shared with a doctor via active consents."""
        result = await self.db.execute(
            select(Consent)
            .filter(Consent.doctor_id == doctor_id)
            .options(selectinload(Consent.record).selectinload(MedicalRecord.patient))
        )
        consents = result.scalars().all()
        return [c.record for c in consents if c.record]

    async def update(self, record: MedicalRecord, title: Optional[str], category: Optional[str]) -> MedicalRecord:
        """Update metadata fields for a medical record."""
        if title is not None:
            record.title = title
        if category is not None:
            record.category = category
        self.db.add(record)
        return record

    async def delete(self, record: MedicalRecord) -> None:
        """Delete a medical record from database."""
        await self.db.delete(record)
