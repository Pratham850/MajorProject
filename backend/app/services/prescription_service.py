from __future__ import annotations
from typing import List
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.prescription_repository import PrescriptionRepository
from app.repositories.user_repository import UserRepository
from app.repositories.audit_repository import AuditRepository
from app.schemas.prescriptions import PrescriptionCreate, PrescriptionResponse
from app.models import UserRole


class PrescriptionService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.prescription_repo = PrescriptionRepository(db)
        self.user_repo = UserRepository(db)
        self.audit_repo = AuditRepository(db)

    async def create_prescription(self, doctor_id: int, payload: PrescriptionCreate) -> PrescriptionResponse:
        patient = await self.user_repo.get_by_id(payload.patient_id)
        if not patient or patient.role != UserRole.PATIENT:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Target patient does not exist or is not a patient."
            )

        prescription = await self.prescription_repo.create(
            doctor_id=doctor_id,
            appointment_id=payload.appointment_id,
            patient_id=payload.patient_id,
            diagnosis=payload.diagnosis,
            medications=payload.medications,
            lab_tests=payload.lab_tests,
            follow_up_date=payload.follow_up_date,
            notes=payload.notes
        )
        await self.audit_repo.log_action(
            user_id=doctor_id,
            action="CREATE_PRESCRIPTION",
            details=f"Created prescription ID {prescription.id} for Patient ID {payload.patient_id}"
        )
        return PrescriptionResponse.from_orm(prescription)

    async def get_prescription(self, user_id: int, prescription_id: int) -> PrescriptionResponse:
        prescription = await self.prescription_repo.get_by_id(prescription_id)
        if not prescription:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prescription not found")
        if prescription.patient_id != user_id and prescription.doctor_id != user_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
        return PrescriptionResponse.from_orm(prescription)

    async def list_prescriptions(self, user_id: int) -> List[PrescriptionResponse]:
        prescriptions = await self.prescription_repo.list_by_user(user_id)
        return [PrescriptionResponse.from_orm(p) for p in prescriptions]

