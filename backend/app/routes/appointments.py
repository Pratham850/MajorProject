from __future__ import annotations
from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.models import User
from app.schemas.appointments import AppointmentCreate, AppointmentUpdateStatus, AppointmentResponse
from app.services.appointment_service import AppointmentService

router = APIRouter(prefix="/appointments", tags=["Appointments"])


@router.post("", response_model=AppointmentResponse, status_code=status.HTTP_201_CREATED)
async def create_appointment(
    payload: AppointmentCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = AppointmentService(db)
    return await service.create_appointment(current_user.id, payload)


@router.get("", response_model=List[AppointmentResponse], status_code=status.HTTP_200_OK)
async def list_appointments(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = AppointmentService(db)
    return await service.list_appointments(current_user.id)


@router.get("/{id}", response_model=AppointmentResponse, status_code=status.HTTP_200_OK)
async def get_appointment(
    id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = AppointmentService(db)
    return await service.get_appointment(current_user.id, id)


@router.put("/{id}", response_model=AppointmentResponse, status_code=status.HTTP_200_OK)
async def update_appointment(
    id: int,
    payload: AppointmentUpdateStatus,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = AppointmentService(db)
    return await service.update_appointment_status(current_user.id, id, payload)


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_appointment(
    id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = AppointmentService(db)
    await service.delete_appointment(current_user.id, id)
