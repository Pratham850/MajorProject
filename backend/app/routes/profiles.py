from __future__ import annotations
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user, require_role
from app.models import User, UserRole
from app.schemas.profiles import (
    PatientProfileUpdate, PatientProfileResponse,
    DoctorProfileUpdate, DoctorProfileResponse,
    ResearcherProfileUpdate, ResearcherProfileResponse
)
from app.services.profile_service import ProfileService

router = APIRouter(tags=["Profiles"])


@router.get("/patient/profile", response_model=PatientProfileResponse, status_code=status.HTTP_200_OK)
async def get_patient_profile(
    current_user: User = Depends(require_role([UserRole.PATIENT])),
    db: AsyncSession = Depends(get_db)
):
    service = ProfileService(db)
    return await service.get_patient_profile(current_user.id)


@router.put("/patient/profile", response_model=PatientProfileResponse, status_code=status.HTTP_200_OK)
async def update_patient_profile(
    payload: PatientProfileUpdate,
    current_user: User = Depends(require_role([UserRole.PATIENT])),
    db: AsyncSession = Depends(get_db)
):
    service = ProfileService(db)
    return await service.update_patient_profile(current_user.id, payload)


@router.get("/doctor/profile", response_model=DoctorProfileResponse, status_code=status.HTTP_200_OK)
async def get_doctor_profile(
    current_user: User = Depends(require_role([UserRole.DOCTOR])),
    db: AsyncSession = Depends(get_db)
):
    service = ProfileService(db)
    return await service.get_doctor_profile(current_user.id)


@router.put("/doctor/profile", response_model=DoctorProfileResponse, status_code=status.HTTP_200_OK)
async def update_doctor_profile(
    payload: DoctorProfileUpdate,
    current_user: User = Depends(require_role([UserRole.DOCTOR])),
    db: AsyncSession = Depends(get_db)
):
    service = ProfileService(db)
    return await service.update_doctor_profile(current_user.id, payload)


@router.get("/researcher/profile", response_model=ResearcherProfileResponse, status_code=status.HTTP_200_OK)
async def get_researcher_profile(
    current_user: User = Depends(require_role([UserRole.RESEARCHER])),
    db: AsyncSession = Depends(get_db)
):
    service = ProfileService(db)
    return await service.get_researcher_profile(current_user.id)


@router.put("/researcher/profile", response_model=ResearcherProfileResponse, status_code=status.HTTP_200_OK)
async def update_researcher_profile(
    payload: ResearcherProfileUpdate,
    current_user: User = Depends(require_role([UserRole.RESEARCHER])),
    db: AsyncSession = Depends(get_db)
):
    service = ProfileService(db)
    return await service.update_researcher_profile(current_user.id, payload)
