from __future__ import annotations
from datetime import date
from typing import Any, Dict
from sqlalchemy import distinct, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import (
    AccessRequest, Appointment, AppointmentStatus, AuditLog, CohortQuery,
    Consent, MedicalRecord, Notification, User, UserRole
)
from app.repositories.profile_repository import PatientProfileRepository, DoctorProfileRepository, ResearcherProfileRepository


class DashboardService:
    """
    Service layer containing aggregation logic for Patient, Doctor, Researcher,
    and Admin dashboards.
    """

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_patient_dashboard(self, current_user: User) -> Dict[str, Any]:
        """
        Patient Dashboard Return:
        profile, medical_records_count, appointments_count, active_consents,
        notifications_count, recent_records, recent_notifications
        """
        patient_profile_repo = PatientProfileRepository(self.db)
        profile_obj = await patient_profile_repo.get_by_user_id(current_user.id)
        profile_data = {
            "id": current_user.id,
            "full_name": current_user.full_name,
            "email": current_user.email,
            "date_of_birth": str(profile_obj.date_of_birth) if profile_obj and profile_obj.date_of_birth else None,
            "gender": profile_obj.gender if profile_obj else None,
            "blood_group": profile_obj.blood_group if profile_obj else None,
            "phone": profile_obj.phone if profile_obj else None,
        }

        # medical_records_count
        r_res = await self.db.execute(
            select(func.count(MedicalRecord.id)).where(MedicalRecord.patient_id == current_user.id)
        )
        medical_records_count = r_res.scalar() or 0

        # appointments_count
        app_res = await self.db.execute(
            select(func.count(Appointment.id)).where(Appointment.patient_id == current_user.id)
        )
        appointments_count = app_res.scalar() or 0

        # active_consents
        c_res = await self.db.execute(
            select(func.count(Consent.id))
            .join(MedicalRecord, Consent.record_id == MedicalRecord.id)
            .where(MedicalRecord.patient_id == current_user.id)
        )
        active_consents = c_res.scalar() or 0

        # notifications_count
        n_res = await self.db.execute(
            select(func.count(Notification.id)).where(Notification.user_id == current_user.id)
        )
        notifications_count = n_res.scalar() or 0

        # recent_records
        records_query = await self.db.execute(
            select(MedicalRecord)
            .where(MedicalRecord.patient_id == current_user.id)
            .order_by(MedicalRecord.created_at.desc())
            .limit(5)
        )
        recent_records = [
            {
                "id": r.id,
                "title": r.title,
                "category": r.category,
                "file_path": r.file_path,
                "created_at": r.created_at.isoformat()
            }
            for r in records_query.scalars().all()
        ]

        # recent_notifications
        notifs_query = await self.db.execute(
            select(Notification)
            .where(Notification.user_id == current_user.id)
            .order_by(Notification.created_at.desc())
            .limit(5)
        )
        recent_notifications = [
            {
                "id": n.id,
                "title": n.title,
                "message": n.message,
                "type": n.type.value if hasattr(n.type, "value") else str(n.type),
                "is_read": n.is_read,
                "created_at": n.created_at.isoformat()
            }
            for n in notifs_query.scalars().all()
        ]

        return {
            "profile": profile_data,
            "medical_records_count": medical_records_count,
            "appointments_count": appointments_count,
            "active_consents": active_consents,
            "notifications_count": notifications_count,
            "recent_records": recent_records,
            "recent_notifications": recent_notifications,
        }

    async def get_doctor_dashboard(self, current_user: User) -> Dict[str, Any]:
        """
        Doctor Dashboard Return:
        today_appointments, pending_requests, patients_seen, notifications
        """
        today = date.today()

        # today_appointments
        app_res = await self.db.execute(
            select(func.count(Appointment.id)).where(
                Appointment.doctor_id == current_user.id,
                Appointment.appointment_date == today
            )
        )
        today_appointments = app_res.scalar() or 0

        # pending_requests
        req_res = await self.db.execute(
            select(func.count(AccessRequest.id)).where(
                AccessRequest.requester_id == current_user.id,
                AccessRequest.status == "Pending"
            )
        )
        pending_requests = req_res.scalar() or 0

        # patients_seen
        patients_res = await self.db.execute(
            select(func.count(distinct(Appointment.patient_id))).where(
                Appointment.doctor_id == current_user.id,
                Appointment.status == AppointmentStatus.COMPLETED
            )
        )
        patients_seen = patients_res.scalar() or 0

        # notifications
        notifs_query = await self.db.execute(
            select(Notification)
            .where(Notification.user_id == current_user.id)
            .order_by(Notification.created_at.desc())
            .limit(10)
        )
        notifications = [
            {
                "id": n.id,
                "title": n.title,
                "message": n.message,
                "type": n.type.value if hasattr(n.type, "value") else str(n.type),
                "is_read": n.is_read,
                "created_at": n.created_at.isoformat()
            }
            for n in notifs_query.scalars().all()
        ]

        return {
            "today_appointments": today_appointments,
            "pending_requests": pending_requests,
            "patients_seen": patients_seen,
            "notifications": notifications,
        }

    async def get_researcher_dashboard(self, current_user: User) -> Dict[str, Any]:
        """
        Research Dashboard Return:
        cohort_queries, approved_queries, pending_queries, recent_activity
        """
        # cohort_queries count
        c_res = await self.db.execute(
            select(func.count(CohortQuery.id)).where(CohortQuery.researcher_id == current_user.id)
        )
        cohort_queries = c_res.scalar() or 0

        # approved_queries
        app_res = await self.db.execute(
            select(func.count(CohortQuery.id)).where(
                CohortQuery.researcher_id == current_user.id,
                CohortQuery.status == "Approved"
            )
        )
        approved_queries = app_res.scalar() or 0

        # pending_queries
        pend_res = await self.db.execute(
            select(func.count(CohortQuery.id)).where(
                CohortQuery.researcher_id == current_user.id,
                CohortQuery.status == "Pending"
            )
        )
        pending_queries = pend_res.scalar() or 0

        # recent_activity
        recent_q = await self.db.execute(
            select(CohortQuery)
            .where(CohortQuery.researcher_id == current_user.id)
            .order_by(CohortQuery.created_at.desc())
            .limit(5)
        )
        recent_activity = [
            {
                "id": q.id,
                "title": q.title,
                "disease_focus": q.disease_focus,
                "patient_count": q.patient_count,
                "status": q.status,
                "created_at": q.created_at.isoformat()
            }
            for q in recent_q.scalars().all()
        ]

        return {
            "cohort_queries": cohort_queries,
            "approved_queries": approved_queries,
            "pending_queries": pending_queries,
            "recent_activity": recent_activity,
        }

    async def get_admin_dashboard(self, current_user: User) -> Dict[str, Any]:
        """
        Admin Dashboard Return:
        total_users, patients, doctors, researchers, medical_records, appointments, system_activity
        """
        # total_users
        tot_users_res = await self.db.execute(select(func.count(User.id)))
        total_users = tot_users_res.scalar() or 0

        # patients
        pat_res = await self.db.execute(select(func.count(User.id)).where(User.role == UserRole.PATIENT))
        patients = pat_res.scalar() or 0

        # doctors
        doc_res = await self.db.execute(select(func.count(User.id)).where(User.role == UserRole.DOCTOR))
        doctors = doc_res.scalar() or 0

        # researchers
        res_res = await self.db.execute(select(func.count(User.id)).where(User.role == UserRole.RESEARCHER))
        researchers = res_res.scalar() or 0

        # medical_records
        rec_res = await self.db.execute(select(func.count(MedicalRecord.id)))
        medical_records = rec_res.scalar() or 0

        # appointments
        app_res = await self.db.execute(select(func.count(Appointment.id)))
        appointments = app_res.scalar() or 0

        # system_activity (recent audit logs)
        audit_query = await self.db.execute(
            select(AuditLog).order_by(AuditLog.timestamp.desc()).limit(10)
        )
        system_activity = [
            {
                "id": a.id,
                "user_id": a.user_id,
                "action": a.action,
                "details": a.details,
                "timestamp": a.timestamp.isoformat()
            }
            for a in audit_query.scalars().all()
        ]

        return {
            "total_users": total_users,
            "patients": patients,
            "doctors": doctors,
            "researchers": researchers,
            "medical_records": medical_records,
            "appointments": appointments,
            "system_activity": system_activity,
        }

    async def get_stats_by_role(self, current_user: User) -> Dict[str, Any]:
        role_str = current_user.role if isinstance(current_user.role, str) else current_user.role.value
        if role_str == "patient":
            return await self.get_patient_dashboard(current_user)
        elif role_str == "doctor":
            return await self.get_doctor_dashboard(current_user)
        elif role_str == "researcher":
            return await self.get_researcher_dashboard(current_user)
        elif role_str == "admin":
            return await self.get_admin_dashboard(current_user)
        return {}
