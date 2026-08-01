from __future__ import annotations
from typing import List
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.appointment_repository import AppointmentRepository
from app.repositories.user_repository import UserRepository
from app.repositories.audit_repository import AuditRepository
from app.schemas.appointments import AppointmentCreate, AppointmentUpdateStatus, AppointmentResponse
from app.models import UserRole, AppointmentStatus


class AppointmentService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.appointment_repo = AppointmentRepository(db)
        self.user_repo = UserRepository(db)
        self.audit_repo = AuditRepository(db)

    async def create_appointment(self, patient_id: int, payload: AppointmentCreate) -> AppointmentResponse:
        doctor = await self.user_repo.get_by_id(payload.doctor_id)
        if not doctor or doctor.role != UserRole.DOCTOR:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Target doctor does not exist or user is not a doctor."
            )

        appointment = await self.appointment_repo.create(
            patient_id=patient_id,
            doctor_id=payload.doctor_id,
            appointment_date=payload.appointment_date,
            appointment_time=payload.appointment_time,
            reason=payload.reason,
            meeting_mode=payload.meeting_mode,
            status=AppointmentStatus.PENDING
        )
        await self.audit_repo.log_action(
            user_id=patient_id,
            action="CREATE_APPOINTMENT",
            details=f"Booked appointment ID {appointment.id} with Doctor ID {payload.doctor_id}"
        )
        return AppointmentResponse.from_orm(appointment)

    async def get_appointment(self, user_id: int, appointment_id: int) -> AppointmentResponse:
        appointment = await self.appointment_repo.get_by_id(appointment_id)
        if not appointment:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found")
        if appointment.patient_id != user_id and appointment.doctor_id != user_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to this appointment")
        return AppointmentResponse.from_orm(appointment)

    async def list_appointments(self, user_id: int) -> List[AppointmentResponse]:
        appointments = await self.appointment_repo.list_by_user(user_id)
        return [AppointmentResponse.from_orm(a) for a in appointments]

    async def update_appointment_status(
        self, user_id: int, appointment_id: int, payload: AppointmentUpdateStatus
    ) -> AppointmentResponse:
        appointment = await self.appointment_repo.get_by_id(appointment_id)
        if not appointment:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found")
        if appointment.doctor_id != user_id and appointment.patient_id != user_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

        updated = await self.appointment_repo.update_status(
            appointment_id=appointment_id,
            status=payload.status,
            doctor_notes=payload.doctor_notes
        )
        await self.audit_repo.log_action(
            user_id=user_id,
            action="UPDATE_APPOINTMENT_STATUS",
            details=f"Updated appointment ID {appointment_id} status to {payload.status.value}"
        )
        return AppointmentResponse.from_orm(updated)

    async def delete_appointment(self, user_id: int, appointment_id: int) -> None:
        appointment = await self.appointment_repo.get_by_id(appointment_id)
        if not appointment:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found")
        if appointment.patient_id != user_id and appointment.doctor_id != user_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

        await self.appointment_repo.delete(appointment_id)
        await self.audit_repo.log_action(
            user_id=user_id,
            action="DELETE_APPOINTMENT",
            details=f"Cancelled/Deleted appointment ID {appointment_id}"
        )
