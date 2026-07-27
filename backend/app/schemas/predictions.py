from __future__ import annotations
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field


class PredictionRequest(BaseModel):
    disease: str = Field(..., description="Disease category (e.g. Oncology, Cardiology, Infectious Diseases, Neurology, Pulmonology)")
    year: int = Field(..., ge=2026, le=2035, description="Target forecast year (2026-2035)")


class PredictionResponse(BaseModel):
    id: Optional[int] = None
    disease: str
    year: int
    predictedValue: float
    message: str

    model_config = ConfigDict(from_attributes=True)


class PredictionHistoryItem(BaseModel):
    id: int
    disease: str
    year: int
    predictedValue: float
    createdAt: str

    model_config = ConfigDict(from_attributes=True)
