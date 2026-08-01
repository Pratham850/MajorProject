from __future__ import annotations
from typing import List, Optional
from pydantic import BaseModel, Field


class RecordResponse(BaseModel):
    id: str
    title: str
    category: str
    dateUploaded: str
    fileSize: str
    sharingStatus: str
    sharedWith: List[str]

    class Config:
        orm_mode = True


class RecordDetailResponse(BaseModel):
    id: str
    title: str
    category: str
    dateUploaded: str
    fileSize: str
    sharingStatus: str
    sharedWith: List[str]
    patientName: str
    patientId: int

    class Config:
        orm_mode = True


class RecordUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=2, max_length=255)
    category: Optional[str] = Field(None, description="Must be Lab Report, Prescription, Immunization, or Imaging")

