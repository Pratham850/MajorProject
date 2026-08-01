from typing import List, Optional
from pydantic import BaseModel, Field


class PatientInfo(BaseModel):
    name: Optional[str] = Field(None, description="Patient's full name")
    age: Optional[int] = Field(None, description="Patient's age in years")
    gender: Optional[str] = Field(None, description="Patient's gender (Male, Female, Other)")

    class Config:
        orm_mode = True


class HospitalInfo(BaseModel):
    hospital: Optional[str] = Field(None, description="Hospital or medical center name")
    doctor: Optional[str] = Field(None, description="Attending or ordering doctor's name")
    report_date: Optional[str] = Field(None, description="Date of report issuance (YYYY-MM-DD format if possible)")
    laboratory_name: Optional[str] = Field(None, description="Diagnostic laboratory name")

    class Config:
        orm_mode = True


class LabTest(BaseModel):
    test_name: str = Field(..., description="Name of lab test or biomarker (e.g. Hemoglobin, Serum Creatinine, HbA1c)")
    value: str = Field(..., description="Result value")
    unit: Optional[str] = Field(None, description="Measurement unit (e.g. mg/dL, g/dL, %)")
    reference_range: Optional[str] = Field(None, description="Normal reference range")
    status: Optional[str] = Field("Normal", description="Clinical status: Normal, High, Low")

    class Config:
        orm_mode = True


class MedicalReportExtraction(BaseModel):
    patient: PatientInfo = Field(default_factory=PatientInfo)
    hospital: HospitalInfo = Field(default_factory=HospitalInfo)
    test_results: List[LabTest] = Field(default_factory=list)
    diagnosis: Optional[str] = Field(None, description="Clinical summary or diagnosis")
    recommendations: Optional[str] = Field(None, description="Doctor recommendations or follow-up notes")

    class Config:
        orm_mode = True
