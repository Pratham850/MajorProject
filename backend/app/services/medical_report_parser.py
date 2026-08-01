import os
import logging
from typing import Dict, Any, Optional, Union
from mimetypes import guess_type

from app.schemas.medical_report import (
    MedicalReportExtraction,
    PatientInfo,
    HospitalInfo,
    LabTest,
)
from app.services.gemini_service import GeminiService

logger = logging.getLogger("healthshare.medical_parser")


class MedicalReportParser:
    """
    Reusable Clinical Document Parser service.
    Orchestrates file format detection, Gemini API extraction, schema validation,
    deduplication, unit sanitization, and structured Pydantic model transformation.
    """

    SUPPORTED_MIME_TYPES = {
        "application/pdf": "application/pdf",
        "image/png": "image/png",
        "image/jpeg": "image/jpeg",
        "image/jpg": "image/jpeg",
    }

    def __init__(self, gemini_service: Optional[GeminiService] = None):
        self.gemini_service = gemini_service or GeminiService()

    @classmethod
    def detect_mime_type(cls, filename: str, fallback_mime: Optional[str] = None) -> str:
        """Helper method determining MIME type from filename extension or content type header."""
        if fallback_mime and fallback_mime in cls.SUPPORTED_MIME_TYPES:
            return cls.SUPPORTED_MIME_TYPES[fallback_mime]

        ext = os.path.splitext(filename)[1].lower()
        if ext == ".pdf":
            return "application/pdf"
        elif ext in [".png"]:
            return "image/png"
        elif ext in [".jpg", ".jpeg"]:
            return "image/jpeg"

        guessed, _ = guess_type(filename)
        if guessed in cls.SUPPORTED_MIME_TYPES:
            return cls.SUPPORTED_MIME_TYPES[guessed]

        return "application/pdf"

    def validate_and_clean_extraction(self, raw_data: Dict[str, Any]) -> MedicalReportExtraction:
        """
        Validation logic:
        1. Parse patient and hospital info objects safely.
        2. Deduplicate test results based on normalized test_name.
        3. Normalize status values to ('Normal', 'High', 'Low').
        4. Return clean MedicalReportExtraction instance.
        """
        if not raw_data or not isinstance(raw_data, dict):
            logger.warning("Extraction Failed: Received empty or invalid dictionary structure from parser")
            return MedicalReportExtraction()

        patient_raw = raw_data.get("patient") or {}
        patient = PatientInfo(
            name=patient_raw.get("name") if isinstance(patient_raw, dict) else None,
            age=int(patient_raw["age"]) if isinstance(patient_raw, dict) and str(patient_raw.get("age", "")).isdigit() else None,
            gender=patient_raw.get("gender") if isinstance(patient_raw, dict) else None,
        )

        hospital_raw = raw_data.get("hospital") or {}
        hospital = HospitalInfo(
            hospital=hospital_raw.get("hospital") if isinstance(hospital_raw, dict) else None,
            doctor=hospital_raw.get("doctor") if isinstance(hospital_raw, dict) else None,
            report_date=str(hospital_raw.get("report_date")) if isinstance(hospital_raw, dict) and hospital_raw.get("report_date") else None,
            laboratory_name=hospital_raw.get("laboratory_name") if isinstance(hospital_raw, dict) else None,
        )

        raw_tests = raw_data.get("test_results") or []
        seen_tests = set()
        cleaned_tests = []

        if isinstance(raw_tests, list):
            for item in raw_tests:
                if not isinstance(item, dict):
                    continue

                test_name = str(item.get("test_name") or "").strip()
                if not test_name:
                    continue

                norm_key = test_name.lower()
                if norm_key in seen_tests:
                    logger.debug("Duplicate test entry '%s' ignored during validation", test_name)
                    continue
                seen_tests.add(norm_key)

                val_str = str(item.get("value") or "").strip()
                unit_str = str(item.get("unit") or "").strip() if item.get("unit") else None
                ref_str = str(item.get("reference_range") or "").strip() if item.get("reference_range") else None

                raw_status = str(item.get("status") or "Normal").capitalize().strip()
                if "High" in raw_status or "Elevated" in raw_status or "Abnormal" in raw_status:
                    status_clean = "High"
                elif "Low" in raw_status or "Decreased" in raw_status:
                    status_clean = "Low"
                else:
                    status_clean = "Normal"

                cleaned_tests.append(
                    LabTest(
                        test_name=test_name,
                        value=val_str,
                        unit=unit_str,
                        reference_range=ref_str,
                        status=status_clean,
                    )
                )

        diagnosis = raw_data.get("diagnosis") if isinstance(raw_data.get("diagnosis"), str) else None
        recommendations = raw_data.get("recommendations") if isinstance(raw_data.get("recommendations"), str) else None

        return MedicalReportExtraction(
            patient=patient,
            hospital=hospital,
            test_results=cleaned_tests,
            diagnosis=diagnosis,
            recommendations=recommendations,
        )

    async def parse_report(
        self,
        file_bytes: bytes,
        filename: str,
        content_type: Optional[str] = None,
    ) -> MedicalReportExtraction:
        """
        Main public interface for document parsing:
        Logs progress lifecycle and returns validated MedicalReportExtraction.
        """
        logger.info("Upload Started: Beginning processing for medical report '%s'", filename)

        mime_type = self.detect_mime_type(filename, content_type)

        try:
            logger.info("Gemini Processing Started: Sending '%s' (%s) to Gemini Vision API", filename, mime_type)
            raw_extraction = await self.gemini_service.extract_medical_data(file_bytes, mime_type)
            
            extraction_result = self.validate_and_clean_extraction(raw_extraction)
            logger.info("Extraction Success: Medical report '%s' parsed into structured model with %d tests",
                        filename, len(extraction_result.test_results))
            return extraction_result

        except Exception as exc:
            logger.error("Extraction Failed: Error processing report '%s': %s", filename, str(exc))
            # Return empty extraction model rather than failing hard or crashing backend
            return MedicalReportExtraction()
