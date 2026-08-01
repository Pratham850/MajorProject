from __future__ import annotations
from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, Field


class PrescriptionBase(BaseModel):
    appointment_id: Optional[int] = None
    patient_id: int
    diagnosis: str
    medications: str
    lab_tests: Optional[str] = None
    follow_up_date: Optional[date] = None
    notes: Optional[str] = None


class PrescriptionCreate(PrescriptionBase):
    pass


class PrescriptionUpdate(BaseModel):
    diagnosis: Optional[str] = None
    medications: Optional[str] = None
    lab_tests: Optional[str] = None
    follow_up_date: Optional[date] = None
    notes: Optional[str] = None


class PrescriptionResponse(PrescriptionBase):
    id: int
    doctor_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

