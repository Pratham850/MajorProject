import pytest
from unittest.mock import AsyncMock, MagicMock
from app.schemas.medical_report import (
    MedicalReportExtraction,
    PatientInfo,
    HospitalInfo,
    LabTest,
)
from app.services.medical_report_parser import MedicalReportParser
from app.services.gemini_service import GeminiService


def test_medical_report_schemas_pydantic_v1():
    patient = PatientInfo(name="John Doe", age=42, gender="Male")
    hospital = HospitalInfo(hospital="Apollo Hospital", doctor="Dr. Smith", report_date="2026-08-01")
    test1 = LabTest(test_name="Hemoglobin", value="14.2", unit="g/dL", reference_range="13.0 - 17.0", status="Normal")
    test2 = LabTest(test_name="Serum Creatinine", value="2.1", unit="mg/dL", reference_range="0.7 - 1.3", status="High")

    extraction = MedicalReportExtraction(
        patient=patient,
        hospital=hospital,
        test_results=[test1, test2],
        diagnosis="Elevated serum creatinine indicating potential CKD stage 2.",
        recommendations="Nephrology consultation recommended.",
    )

    data = extraction.dict()
    assert data["patient"]["name"] == "John Doe"
    assert data["hospital"]["hospital"] == "Apollo Hospital"
    assert len(data["test_results"]) == 2
    assert data["test_results"][1]["status"] == "High"


def test_parser_validation_and_deduplication():
    parser = MedicalReportParser()

    raw_response = {
        "patient": {"name": "Jane Doe", "age": "35", "gender": "Female"},
        "hospital": {"hospital": "City Lab", "doctor": "Dr. House", "report_date": "2026-07-15"},
        "test_results": [
            {"test_name": "HbA1c", "value": "6.8", "unit": "%", "reference_range": "< 5.7%", "status": "High"},
            {"test_name": "HbA1c", "value": "6.8", "unit": "%", "reference_range": "< 5.7%", "status": "High"}, # Duplicate
            {"test_name": "Fasting Glucose", "value": "110", "unit": "mg/dL", "reference_range": "70 - 99", "status": "Elevated"},
        ],
        "diagnosis": "Impaired fasting glucose",
    }

    result = parser.validate_and_clean_extraction(raw_response)
    assert result.patient.name == "Jane Doe"
    assert result.patient.age == 35
    assert len(result.test_results) == 2  # Deduplicated from 3 to 2
    assert result.test_results[0].test_name == "HbA1c"
    assert result.test_results[1].status == "High"  # Elevated mapped to High


@pytest.mark.anyio
async def test_parser_parse_report_mock():
    mock_gemini = MagicMock(spec=GeminiService)
    mock_gemini.extract_medical_data = AsyncMock(return_value={
        "patient": {"name": "Test Patient", "age": 50, "gender": "Male"},
        "hospital": {"hospital": "General Hospital"},
        "test_results": [
            {"test_name": "Blood Urea Nitrogen", "value": "18", "unit": "mg/dL", "status": "Normal"}
        ]
    })

    parser = MedicalReportParser(gemini_service=mock_gemini)
    res = await parser.parse_report(b"dummy_pdf_bytes", "report.pdf", "application/pdf")

    assert res.patient.name == "Test Patient"
    assert len(res.test_results) == 1
    assert res.test_results[0].test_name == "Blood Urea Nitrogen"
    mock_gemini.extract_medical_data.assert_called_once()
