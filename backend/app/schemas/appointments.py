from __future__ import annotations
from datetime import date, datetime, time
from typing import Optional
from pydantic import BaseModel, Field
from app.models import AppointmentStatus


class AppointmentBase(BaseModel):
    doctor_id: int
    appointment_date: date
    appointment_time: time
    reason: str = Field(..., min_length=3)
    meeting_mode: str = Field("In-Person", max_length=50)


class AppointmentCreate(AppointmentBase):
    pass


class AppointmentUpdateStatus(BaseModel):
    status: AppointmentStatus
    doctor_notes: Optional[str] = None


class AppointmentResponse(AppointmentBase):
    id: int
    patient_id: int
    status: AppointmentStatus
    doctor_notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

