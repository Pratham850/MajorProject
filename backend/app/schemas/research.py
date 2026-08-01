from __future__ import annotations
from typing import List, Optional
from pydantic import BaseModel, Field


class CohortQueryCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=255)
    patientCount: int = Field(..., ge=100, le=100000, description="Cohort size (100 to 100,000)")
    diseaseFocus: str = Field(..., description="Oncology, Cardiology, Infectious Diseases, Neurology, or Pulmonology")
    justification: str = Field(..., min_length=10, description="Research justification statement")


class CohortQueryApproval(BaseModel):
    status: str = Field(..., description="'Approved' or 'Rejected'")


class CohortQueryResponse(BaseModel):
    id: str
    title: str
    diseaseFocus: str
    patientCount: int
    justification: str
    status: str
    sandboxSize: Optional[str] = None
    dateCreated: str

    class Config:
        orm_mode = True


class AnonymizedCohortResults(BaseModel):
    queryId: str
    title: str
    diseaseFocus: str
    totalPatients: int
    anonymizedRecordsCount: int
    privacyLevel: str = "k-anonymity (k=5)"
    demographicsSummary: dict
    sandboxDownloadUrl: str

    class Config:
        orm_mode = True

