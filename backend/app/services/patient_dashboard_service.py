from __future__ import annotations
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.patient_dashboard_repository import PatientDashboardRepository
from app.schemas.patient_dashboard import (
    PatientDashboardProfileSchema,
    PatientDashboardSummarySchema,
    PatientDashboardRecordItem,
    PatientDashboardAppointmentItem,
    PatientDashboardNotificationItem,
    PatientDashboardResponse,
)


class PatientDashboardService:
    """
    Service Layer aggregating dashboard information for authenticated patients.
    """

    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = PatientDashboardRepository(db)

    async def get_patient_dashboard(self, patient_id: int) -> PatientDashboardResponse:
        user, profile = await self.repo.get_patient_user_and_profile(patient_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Patient user account not found."
            )

        # Profile handling (graceful fallback if profile record has not been initialized)
        profile_data = PatientDashboardProfileSchema(
            full_name=user.full_name,
            email=user.email,
            blood_group=profile.blood_group if profile else None,
            gender=profile.gender if profile else None,
            profile_completed=profile.profile_completed if profile else False,
        )

        # Summary counts
        summary_counts = await self.repo.get_summary_counts(patient_id)
        summary_data = PatientDashboardSummarySchema(**summary_counts)

        # Recent medical records
        recent_records_models = await self.repo.get_recent_medical_records(patient_id, limit=5)
        recent_records = [
            PatientDashboardRecordItem.from_orm(r) for r in recent_records_models
        ]

        # Upcoming appointments
        upcoming_appointments_models = await self.repo.get_upcoming_appointments(patient_id, limit=5)
        upcoming_appointments = [
            PatientDashboardAppointmentItem(
                id=a.id,
                doctor_id=a.doctor_id,
                doctor_name=a.doctor.full_name if a.doctor else None,
                appointment_date=a.appointment_date,
                appointment_time=a.appointment_time,
                status=a.status.value if hasattr(a.status, "value") else str(a.status),
                reason=a.reason,
                meeting_mode=a.meeting_mode,
            )
            for a in upcoming_appointments_models
        ]

        # Notifications
        notifications_models = await self.repo.get_recent_notifications(patient_id, limit=5)
        notifications = [
            PatientDashboardNotificationItem(
                id=n.id,
                title=n.title,
                message=n.message,
                type=n.type.value if hasattr(n.type, "value") else str(n.type),
                is_read=n.is_read,
                created_at=n.created_at,
            )
            for n in notifications_models
        ]

        return PatientDashboardResponse(
            profile=profile_data,
            summary=summary_data,
            recent_medical_records=recent_records,
            upcoming_appointments=upcoming_appointments,
            notifications=notifications,
        )
