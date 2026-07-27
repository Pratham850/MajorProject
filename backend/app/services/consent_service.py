from __future__ import annotations
from typing import Any, Dict, List
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import User, AuditLog, UserRole
from app.repositories.consent_repository import ConsentRepository
from app.repositories.record_repository import RecordRepository
from app.repositories.user_repository import UserRepository
from app.schemas.consents import GrantConsentRequest, RevokeConsentRequest
from app.services.record_service import parse_record_id


class ConsentService:
    """
    Service layer containing business logic for Granting, Revoking,
    and Listing Patient-Doctor Consent permissions with Audit Logging.
    """

    def __init__(
        self,
        consent_repo: ConsentRepository,
        record_repo: RecordRepository,
        user_repo: UserRepository,
        db: AsyncSession,
    ):
        self.consent_repo = consent_repo
        self.record_repo = record_repo
        self.user_repo = user_repo
        self.db = db

    async def grant_consent(self, current_user: User, req: GrantConsentRequest) -> Dict[str, Any]:
        """
        Business Logic:
        1. Parse record ID and verify patient ownership.
        2. Lookup doctor user by email and verify role is doctor.
        3. Check if active consent already exists.
        4. Persist new Consent record.
        5. Write AuditLog record.
        """
        rec_id = parse_record_id(req.record_id)
        record = await self.record_repo.get_by_id(rec_id)
        if not record:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Medical record not found.")

        if record.patient_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only grant consent for records you own.")

        doctor = await self.user_repo.get_by_email(req.doctor_email)
        if not doctor:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Doctor with specified email address not found.")

        doc_role = doctor.role if isinstance(doctor.role, str) else doctor.role.value
        if doc_role != "doctor":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Target user is not registered as a doctor.")

        existing = await self.consent_repo.get_existing(rec_id, doctor.id)
        if existing:
            return {
                "id": f"con-{existing.id}",
                "recordId": f"rec-{rec_id}",
                "recordTitle": record.title,
                "doctorName": doctor.full_name,
                "doctorEmail": doctor.email,
            }

        new_consent = await self.consent_repo.create(rec_id, doctor.id)

        audit = AuditLog(
            user_id=current_user.id,
            action="Consent Granted",
            details=f"Granted access for record 'rec-{rec_id}' ('{record.title}') to Doctor '{doctor.full_name}' ({doctor.email}).",
        )
        self.db.add(audit)
        await self.db.commit()

        return {
            "id": f"con-{new_consent.id}",
            "recordId": f"rec-{rec_id}",
            "recordTitle": record.title,
            "doctorName": doctor.full_name,
            "doctorEmail": doctor.email,
        }

    async def revoke_consent(self, current_user: User, req: RevokeConsentRequest) -> Dict[str, str]:
        """
        Business Logic:
        1. Parse record ID and verify patient ownership.
        2. Identify target consent grant via doctor email or doctor name.
        3. Delete consent entry from database.
        4. Write AuditLog record.
        """
        rec_id = parse_record_id(req.record_id)
        record = await self.record_repo.get_by_id(rec_id)
        if not record:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Medical record not found.")

        if record.patient_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only revoke consent for records you own.")

        target_consent = None
        for c in record.consents:
            if req.doctor_email and c.doctor.email.lower() == req.doctor_email.lower():
                target_consent = c
                break
            elif req.doctor_name and c.doctor.full_name.lower() == req.doctor_name.lower():
                target_consent = c
                break

        if not target_consent and record.consents:
            target_consent = record.consents[0]

        if not target_consent:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Active consent grant not found for this doctor.")

        doctor_name = target_consent.doctor.full_name
        await self.consent_repo.delete(target_consent)

        audit = AuditLog(
            user_id=current_user.id,
            action="Consent Revoked",
            details=f"Revoked doctor '{doctor_name}' access to medical record 'rec-{rec_id}' ('{record.title}').",
        )
        self.db.add(audit)
        await self.db.commit()

        return {"message": f"Successfully revoked access for {doctor_name}."}

    async def list_active_consents(self, current_user: User) -> List[Dict[str, Any]]:
        """
        Business Logic:
        1. If Patient: returns active consents granted for patient's records.
        2. If Doctor: returns active consents awarded to the doctor.
        """
        user_role = current_user.role if isinstance(current_user.role, str) else current_user.role.value

        if user_role == "patient":
            consents = await self.consent_repo.list_by_patient(current_user.id)
            return [
                {
                    "id": f"con-{c.id}",
                    "recordId": f"rec-{c.record_id}",
                    "recordTitle": c.record.title,
                    "doctorName": c.doctor.full_name,
                    "doctorEmail": c.doctor.email,
                }
                for c in consents
            ]

        elif user_role == "doctor":
            consents = await self.consent_repo.list_by_doctor(current_user.id)
            return [
                {
                    "id": f"con-{c.id}",
                    "recordId": f"rec-{c.record_id}",
                    "recordTitle": c.record.title,
                    "patientName": c.record.patient.full_name if c.record and c.record.patient else "Patient",
                }
                for c in consents
            ]

        return []
