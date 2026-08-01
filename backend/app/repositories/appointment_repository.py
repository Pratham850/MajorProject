from __future__ import annotations
from datetime import date
from typing import List, Optional
from sqlalchemy import select, func, or_
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import Appointment, AppointmentStatus


class AppointmentRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, patient_id: int, doctor_id: int, **kwargs) -> Appointment:
        appointment = Appointment(
            patient_id=patient_id,
            doctor_id=doctor_id,
            **kwargs
        )
        self.session.add(appointment)
        await self.session.commit()
        await self.session.refresh(appointment)
        return appointment

    async def get_by_id(self, appointment_id: int) -> Optional[Appointment]:
        result = await self.session.execute(
            select(Appointment).where(Appointment.id == appointment_id)
        )
        return result.scalar_one_or_none()

    async def list_by_user(self, user_id: int) -> List[Appointment]:
        result = await self.session.execute(
            select(Appointment).where(
                or_(Appointment.patient_id == user_id, Appointment.doctor_id == user_id)
            ).order_by(Appointment.appointment_date.desc(), Appointment.appointment_time.desc())
        )
        return list(result.scalars().all())

    async def update_status(self, appointment_id: int, status: AppointmentStatus, doctor_notes: Optional[str] = None) -> Optional[Appointment]:
        appointment = await self.get_by_id(appointment_id)
        if not appointment:
            return None
        appointment.status = status
        if doctor_notes is not None:
            appointment.doctor_notes = doctor_notes
        await self.session.commit()
        await self.session.refresh(appointment)
        return appointment

    async def delete(self, appointment_id: int) -> bool:
        appointment = await self.get_by_id(appointment_id)
        if not appointment:
            return False
        await self.session.delete(appointment)
        await self.session.commit()
        return True

    async def count_today_for_doctor(self, doctor_id: int, today: date) -> int:
        result = await self.session.execute(
            select(func.count(Appointment.id)).where(
                Appointment.doctor_id == doctor_id,
                Appointment.appointment_date == today
            )
        )
        return result.scalar() or 0

    async def count_for_patient(self, patient_id: int) -> int:
        result = await self.session.execute(
            select(func.count(Appointment.id)).where(Appointment.patient_id == patient_id)
        )
        return result.scalar() or 0

    async def count_distinct_patients_for_doctor(self, doctor_id: int) -> int:
        result = await self.session.execute(
            select(func.count(func.distinct(Appointment.patient_id))).where(
                Appointment.doctor_id == doctor_id,
                Appointment.status == AppointmentStatus.COMPLETED
            )
        )
        return result.scalar() or 0

    async def count_all(self) -> int:
        result = await self.session.execute(select(func.count(Appointment.id)))
        return result.scalar() or 0
