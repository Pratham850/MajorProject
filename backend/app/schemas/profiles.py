from __future__ import annotations
from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, Field


# ----------------------------------------------------------------------
# Patient Profile Schemas
# ----------------------------------------------------------------------
class PatientProfileBase(BaseModel):
    date_of_birth: Optional[date] = None
    gender: Optional[str] = Field(None, max_length=20)
    blood_group: Optional[str] = Field(None, max_length=10)
    phone: Optional[str] = Field(None, max_length=20)
    address: Optional[str] = None
    emergency_contact: Optional[str] = Field(None, max_length=100)
    height_cm: Optional[float] = Field(None, ge=0)
    weight_kg: Optional[float] = Field(None, ge=0)
    allergies: Optional[str] = None
    chronic_conditions: Optional[str] = None
    profile_completed: bool = False


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


# ----------------------------------------------------------------------
# Doctor Profile Schemas
# ----------------------------------------------------------------------
class DoctorProfileBase(BaseModel):
    specialization: Optional[str] = Field(None, max_length=100)
    hospital: Optional[str] = Field(None, max_length=255)
    department: Optional[str] = Field(None, max_length=100)
    license_number: Optional[str] = Field(None, max_length=100)
    experience_years: Optional[int] = Field(None, ge=0)
    phone: Optional[str] = Field(None, max_length=20)
    bio: Optional[str] = None


class DoctorProfileCreate(DoctorProfileBase):
    pass


class DoctorProfileUpdate(DoctorProfileBase):
    pass


class DoctorProfileResponse(DoctorProfileBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


# ----------------------------------------------------------------------
# Researcher Profile Schemas
# ----------------------------------------------------------------------
class ResearcherProfileBase(BaseModel):
    institution: Optional[str] = Field(None, max_length=255)
    department: Optional[str] = Field(None, max_length=100)
    designation: Optional[str] = Field(None, max_length=100)
    research_area: Optional[str] = Field(None, max_length=255)
    phone: Optional[str] = Field(None, max_length=20)


class ResearcherProfileCreate(ResearcherProfileBase):
    pass


class ResearcherProfileUpdate(ResearcherProfileBase):
    pass


class ResearcherProfileResponse(ResearcherProfileBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

