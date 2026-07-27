from __future__ import annotations
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field


class RecordResponse(BaseModel):
    id: str
    title: str
    category: str
    dateUploaded: str
    fileSize: str
    sharingStatus: str
    sharedWith: List[str]

    model_config = ConfigDict(from_attributes=True)


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

    model_config = ConfigDict(from_attributes=True)


class RecordUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=2, max_length=255)
    category: Optional[str] = Field(None, description="Must be Lab Report, Prescription, Immunization, or Imaging")
