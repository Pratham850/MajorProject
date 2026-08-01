from __future__ import annotations
from datetime import date
from typing import Dict, List, Optional, Tuple, Any
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models import User, PatientProfile, MedicalRecord, Appointment, Notification, Consent


class PatientDashboardRepository:
    """
    Data Access Repository for Patient Dashboard aggregations.
    Optimized for batch asynchronous queries to prevent N+1 overhead.
    """

    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_patient_user_and_profile(self, patient_id: int) -> Tuple[Optional[User], Optional[PatientProfile]]:
        result = await self.session.execute(
            select(User)
            .options(selectinload(User.patient_profile))
            .where(User.id == patient_id)
        )
        user = result.scalar_one_or_none()
        profile = user.patient_profile if user else None
        return user, profile

    async def get_summary_counts(self, patient_id: int) -> Dict[str, int]:
        # Medical records count
        r_res = await self.session.execute(
            select(func.count(MedicalRecord.id)).where(MedicalRecord.patient_id == patient_id)
        )
        medical_records_count = r_res.scalar() or 0

        # Appointments count
        app_res = await self.session.execute(
            select(func.count(Appointment.id)).where(Appointment.patient_id == patient_id)
        )
        appointments_count = app_res.scalar() or 0

        # Active consents count
        cons_res = await self.session.execute(
            select(func.count(Consent.id))
            .join(MedicalRecord, Consent.record_id == MedicalRecord.id)
            .where(MedicalRecord.patient_id == patient_id, Consent.status == "Active")
        )
        active_consents_count = cons_res.scalar() or 0

        # Unread notifications count
        notif_res = await self.session.execute(
            select(func.count(Notification.id)).where(
                Notification.user_id == patient_id,
                Notification.is_read == False
            )
        )
        unread_notifications_count = notif_res.scalar() or 0

        return {
            "medical_records_count": medical_records_count,
            "appointments_count": appointments_count,
            "active_consents_count": active_consents_count,
            "unread_notifications_count": unread_notifications_count,
        }

    async def get_recent_medical_records(self, patient_id: int, limit: int = 5) -> List[MedicalRecord]:
        result = await self.session.execute(
            select(MedicalRecord)
            .where(MedicalRecord.patient_id == patient_id)
            .order_by(MedicalRecord.created_at.desc())
            .limit(limit)
        )
        return list(result.scalars().all())

    async def get_upcoming_appointments(self, patient_id: int, limit: int = 5) -> List[Appointment]:
        today = date.today()
        result = await self.session.execute(
            select(Appointment)
            .options(selectinload(Appointment.doctor))
            .where(
                Appointment.patient_id == patient_id,
                Appointment.appointment_date >= today
            )
            .order_by(Appointment.appointment_date.asc(), Appointment.appointment_time.asc())
            .limit(limit)
        )
        return list(result.scalars().all())

    async def get_recent_notifications(self, patient_id: int, limit: int = 5) -> List[Notification]:
        result = await self.session.execute(
            select(Notification)
            .where(Notification.user_id == patient_id)
            .order_by(Notification.created_at.desc())
            .limit(limit)
        )
        return list(result.scalars().all())
