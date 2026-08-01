from __future__ import annotations
from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, Field


class PatientProfileBase(BaseModel):
    date_of_birth: Optional[date] = Field(None, description="Patient date of birth")
    gender: Optional[str] = Field(None, max_length=20, description="Gender identity")
    blood_group: Optional[str] = Field(None, max_length=10, description="Blood type (e.g. A+, O-)")
    phone: Optional[str] = Field(None, max_length=20, description="Contact telephone number")
    address: Optional[str] = Field(None, description="Full residential address")
    emergency_contact: Optional[str] = Field(None, max_length=100, description="Emergency contact info")
    height_cm: Optional[float] = Field(None, ge=0, description="Height in centimeters")
    weight_kg: Optional[float] = Field(None, ge=0, description="Weight in kilograms")
    allergies: Optional[str] = Field(None, description="Known allergies summary")
    chronic_conditions: Optional[str] = Field(None, description="Chronic medical conditions")
    profile_completed: bool = Field(False, description="Flag indicating if profile setup is complete")


class PatientProfileCreate(PatientProfileBase):
    pass


class PatientProfileUpdate(PatientProfileBase):
    pass


class PatientProfileResponse(PatientProfileBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

