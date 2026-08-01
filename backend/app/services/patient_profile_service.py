from __future__ import annotations
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.patient_profile_repository import PatientProfileRepository
from app.repositories.audit_repository import AuditRepository
from app.schemas.patient_profile import PatientProfileCreate, PatientProfileUpdate, PatientProfileResponse


class PatientProfileService:
    """
    Service Layer containing business logic for Patient Profiles.
    """

    def __init__(self, db: AsyncSession):
        self.patient_repo = PatientProfileRepository(db)
        self.audit_repo = AuditRepository(db)

    async def get_patient_profile(self, user_id: int) -> PatientProfileResponse:
        """Retrieves or initializes patient profile for the authenticated user."""
        profile = await self.patient_repo.get_by_user_id(user_id)
        if not profile:
            profile = await self.patient_repo.create_or_update(user_id=user_id)
        return PatientProfileResponse.from_orm(profile)

    async def update_patient_profile(self, user_id: int, payload: PatientProfileUpdate) -> PatientProfileResponse:
        """Updates patient profile for the authenticated user and records audit trail."""
        data = payload.dict(exclude_unset=True)
        profile = await self.patient_repo.create_or_update(user_id=user_id, **data)
        await self.audit_repo.log_action(
            user_id=user_id,
            action="UPDATE_PATIENT_PROFILE",
            details=f"Updated patient profile details for user ID {user_id}"
        )
        return PatientProfileResponse.from_orm(profile)
