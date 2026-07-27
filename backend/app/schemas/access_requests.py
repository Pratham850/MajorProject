from __future__ import annotations
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field


class CreateAccessRequest(BaseModel):
    patient_email: str = Field(..., description="Target patient's email address")
    record_title: Optional[str] = Field(None, description="Optional title of requested medical record")
    reason: str = Field(..., min_length=5, description="Medical justification for access request")


class UpdateAccessRequestStatus(BaseModel):
    status: str = Field(..., description="New status: 'Approved' or 'Rejected'")


class AccessRequestResponse(BaseModel):
    id: str
    doctorName: str
    doctorEmail: str
    patientName: str
    patientEmail: str
    recordTitle: Optional[str] = None
    reason: str
    status: str
    dateRequested: str

    model_config = ConfigDict(from_attributes=True)
