from __future__ import annotations
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field


class GrantConsentRequest(BaseModel):
    record_id: str = Field(..., description="Format: 'rec-<id>' or integer string")
    doctor_email: str = Field(..., description="Email of the doctor to grant consent to")


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

    model_config = ConfigDict(from_attributes=True)
