from typing import List, Optional
from pydantic import BaseModel, Field


class PatientInfo(BaseModel):
    name: Optional[str] = Field(None, description="Patient's full name")
    age: Optional[int] = Field(None, description="Patient's age in years")
    gender: Optional[str] = Field(None, description="Patient's gender (Male, Female, Other)")
    patient_id: Optional[str] = Field(None, description="Patient ID or MRN")
    blood_group: Optional[str] = Field(None, description="Patient's blood group if specified")

    class Config:
        orm_mode = True


class HospitalInfo(BaseModel):
    hospital: Optional[str] = Field(None, description="Hospital or medical center name")
    doctor: Optional[str] = Field(None, description="Attending or ordering doctor's name")
    department: Optional[str] = Field(None, description="Department or specialty unit")
    report_date: Optional[str] = Field(None, description="Date of report issuance")
    laboratory_name: Optional[str] = Field(None, description="Diagnostic laboratory name")

    class Config:
        orm_mode = True


class LabTest(BaseModel):
    test_name: str = Field(..., description="Name of lab test or biomarker")
    value: str = Field(..., description="Result value")
    unit: Optional[str] = Field(None, description="Measurement unit")
    reference_range: Optional[str] = Field(None, description="Normal reference range")
    status: Optional[str] = Field("Normal", description="Clinical status: Normal, High, Low")
    category: Optional[str] = Field("Other", description="Biomarker category (CBC, Kidney Function, Liver Function, Blood Sugar, Lipid Profile, Thyroid, Other)")

    class Config:
        orm_mode = True


class MedicalReportExtraction(BaseModel):
    patient: PatientInfo = Field(default_factory=PatientInfo)
    hospital: HospitalInfo = Field(default_factory=HospitalInfo)
    test_results: List[LabTest] = Field(default_factory=list)
    diagnosis: Optional[str] = Field(None, description="Clinical summary or diagnosis")
    recommendations: Optional[str] = Field(None, description="Doctor recommendations or follow-up notes")
    timing_metadata: Optional[dict] = Field(None, description="Diagnostic timing metadata for debugging")

    class Config:
        orm_mode = True
