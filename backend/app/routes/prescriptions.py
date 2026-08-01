from __future__ import annotations
from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user, require_role
from app.models import User, UserRole
from app.schemas.prescriptions import PrescriptionCreate, PrescriptionResponse
from app.services.prescription_service import PrescriptionService

router = APIRouter(prefix="/prescriptions", tags=["Prescriptions"])


@router.post("", response_model=PrescriptionResponse, status_code=status.HTTP_201_CREATED)
async def create_prescription(
    payload: PrescriptionCreate,
    current_user: User = Depends(require_role([UserRole.DOCTOR])),
    db: AsyncSession = Depends(get_db)
):
    service = PrescriptionService(db)
    return await service.create_prescription(current_user.id, payload)


@router.get("", response_model=List[PrescriptionResponse], status_code=status.HTTP_200_OK)
async def list_prescriptions(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = PrescriptionService(db)
    return await service.list_prescriptions(current_user.id)


@router.get("/{id}", response_model=PrescriptionResponse, status_code=status.HTTP_200_OK)
async def get_prescription(
    id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = PrescriptionService(db)
    return await service.get_prescription(current_user.id, id)
