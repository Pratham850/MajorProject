from __future__ import annotations
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field


class GrantConsentRequest(BaseModel):
    record_id: str = Field(..., description="Format: 'rec-<id>' or integer string")
    doctor_email: str = Field(..., description="Email of the doctor to grant consent to")
    purpose: Optional[str] = Field(None, description="Purpose of consent grant")
    expires_at: Optional[datetime] = Field(None, description="Consent expiration timestamp")


class RevokeConsentRequest(BaseModel):
    record_id: str = Field(..., description="Format: 'rec-<id>' or integer string")
    doctor_name: Optional[str] = Field(None, description="Doctor name for reference")
    doctor_email: Optional[str] = Field(None, description="Doctor email for target revocation")


class ConsentResponse(BaseModel):
    id: str
    recordId: str
    recordTitle: str
    doctorName: str
    doctorEmail: str
    status: str = "Pending"
    purpose: Optional[str] = None
    approved_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None

    class Config:
        orm_mode = True


