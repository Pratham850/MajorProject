from __future__ import annotations
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import require_role
from app.models import User, UserRole
from app.schemas.patient_profile import PatientProfileUpdate, PatientProfileResponse
from app.services.patient_profile_service import PatientProfileService

router = APIRouter(tags=["Patient Profile"])


@router.get("/patient/profile", response_model=PatientProfileResponse, status_code=status.HTTP_200_OK)
async def get_patient_profile(
    current_user: User = Depends(require_role([UserRole.PATIENT])),
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieve authenticated patient's profile details.
    patient_id is automatically extracted from the JWT token.
    """
    service = PatientProfileService(db)
    return await service.get_patient_profile(current_user.id)


@router.put("/patient/profile", response_model=PatientProfileResponse, status_code=status.HTTP_200_OK)
async def update_patient_profile(
    payload: PatientProfileUpdate,
    current_user: User = Depends(require_role([UserRole.PATIENT])),
    db: AsyncSession = Depends(get_db)
):
    """
    Update authenticated patient's profile details.
    patient_id is automatically extracted from the JWT token.
    """
    service = PatientProfileService(db)
    return await service.update_patient_profile(current_user.id, payload)
