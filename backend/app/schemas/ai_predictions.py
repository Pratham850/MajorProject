from __future__ import annotations
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
from app.models import PredictionType


class AIPredictionCreate(BaseModel):
    patient_id: int
    prediction_type: PredictionType
    result: str = Field(..., max_length=255)
    confidence: float = Field(..., ge=0.0, le=1.0)
    model_version: str = Field(..., max_length=50)
    report_path: Optional[str] = Field(None, max_length=500)


class AIPredictionResponse(BaseModel):
    id: int
    patient_id: int
    prediction_type: PredictionType
    result: str
    confidence: float
    model_version: str
    report_path: Optional[str] = None
    created_at: datetime

    class Config:
        orm_mode = True

