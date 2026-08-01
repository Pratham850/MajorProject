from __future__ import annotations
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.profile_repository import PatientProfileRepository, DoctorProfileRepository, ResearcherProfileRepository
from app.schemas.profiles import (
    PatientProfileCreate, PatientProfileUpdate, PatientProfileResponse,
    DoctorProfileCreate, DoctorProfileUpdate, DoctorProfileResponse,
    ResearcherProfileCreate, ResearcherProfileUpdate, ResearcherProfileResponse
)
from app.models import PatientProfile, DoctorProfile, ResearcherProfile


class ProfileService:
    def __init__(self, db: AsyncSession):
        self.patient_repo = PatientProfileRepository(db)
        self.doctor_repo = DoctorProfileRepository(db)
        self.researcher_repo = ResearcherProfileRepository(db)

    async def get_patient_profile(self, user_id: int) -> PatientProfileResponse:
        profile = await self.patient_repo.get_by_user_id(user_id)
        if not profile:
            profile = await self.patient_repo.create_or_update(user_id=user_id)
        return PatientProfileResponse.from_orm(profile)

    async def update_patient_profile(self, user_id: int, payload: PatientProfileUpdate) -> PatientProfileResponse:
        data = payload.dict(exclude_unset=True)
        profile = await self.patient_repo.create_or_update(user_id=user_id, **data)
        return PatientProfileResponse.from_orm(profile)

    async def get_doctor_profile(self, user_id: int) -> DoctorProfileResponse:
        profile = await self.doctor_repo.get_by_user_id(user_id)
        if not profile:
            profile = await self.doctor_repo.create_or_update(user_id=user_id)
        return DoctorProfileResponse.from_orm(profile)

    async def update_doctor_profile(self, user_id: int, payload: DoctorProfileUpdate) -> DoctorProfileResponse:
        data = payload.dict(exclude_unset=True)
        profile = await self.doctor_repo.create_or_update(user_id=user_id, **data)
        return DoctorProfileResponse.from_orm(profile)

    async def get_researcher_profile(self, user_id: int) -> ResearcherProfileResponse:
        profile = await self.researcher_repo.get_by_user_id(user_id)
        if not profile:
            profile = await self.researcher_repo.create_or_update(user_id=user_id)
        return ResearcherProfileResponse.from_orm(profile)

    async def update_researcher_profile(self, user_id: int, payload: ResearcherProfileUpdate) -> ResearcherProfileResponse:
        data = payload.dict(exclude_unset=True)
        profile = await self.researcher_repo.create_or_update(user_id=user_id, **data)
        return ResearcherProfileResponse.from_orm(profile)

