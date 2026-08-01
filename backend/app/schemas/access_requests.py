from __future__ import annotations
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field


class CreateAccessRequest(BaseModel):
    patient_email: str = Field(..., description="Target patient's email address")
    record_title: Optional[str] = Field(None, description="Optional title of requested medical record")
    reason: str = Field(..., min_length=5, description="Medical justification for access request")
    requested_duration: Optional[str] = Field(None, description="Requested duration for access (e.g., '7 days')")
    expires_at: Optional[datetime] = Field(None, description="Access request expiration timestamp")


class UpdateAccessRequestStatus(BaseModel):
    status: str = Field(..., description="New status: 'Approved' or 'Rejected'")
    response_message: Optional[str] = Field(None, description="Response or rejection explanation message")


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
    requested_duration: Optional[str] = None
    expires_at: Optional[datetime] = None
    response_message: Optional[str] = None

    class Config:
        orm_mode = True


