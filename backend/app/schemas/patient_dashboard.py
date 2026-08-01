from __future__ import annotations
from datetime import date, datetime, time
from typing import List, Optional
from pydantic import BaseModel, Field


class PatientDashboardProfileSchema(BaseModel):
    full_name: str
    email: str
    blood_group: Optional[str] = None
    gender: Optional[str] = None
    profile_completed: bool = False

    class Config:
        orm_mode = True


class PatientDashboardSummarySchema(BaseModel):
    medical_records_count: int
    appointments_count: int
    active_consents_count: int
    unread_notifications_count: int


class PatientDashboardRecordItem(BaseModel):
    id: int
    title: str
    category: str
    file_path: str
    file_size: str
    created_at: datetime

    class Config:
        orm_mode = True


class PatientDashboardAppointmentItem(BaseModel):
    id: int
    doctor_id: int
    doctor_name: Optional[str] = None
    appointment_date: date
    appointment_time: time
    status: str
    reason: str
    meeting_mode: str

    class Config:
        orm_mode = True


class PatientDashboardNotificationItem(BaseModel):
    id: int
    title: str
    message: str
    type: str
    is_read: bool
    created_at: datetime

    class Config:
        orm_mode = True


class PatientDashboardResponse(BaseModel):
    profile: PatientDashboardProfileSchema
    summary: PatientDashboardSummarySchema
    recent_medical_records: List[PatientDashboardRecordItem]
    upcoming_appointments: List[PatientDashboardAppointmentItem]
    notifications: List[PatientDashboardNotificationItem]

    class Config:
        orm_mode = True

