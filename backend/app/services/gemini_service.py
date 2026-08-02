import os
import json
import logging
import asyncio
import time
import sys
import traceback
from datetime import datetime
from typing import Dict, Any, Optional
import google.generativeai as genai

from app.config import settings

logger = logging.getLogger("healthshare.gemini")

class GeminiService:
    """
    Service wrapper around Google Generative AI SDK using Gemini 2.5 Flash / 1.5 Flash
    for extracting structured clinical insights from medical reports (PDF & Images).
    """

    def __init__(self, api_key: Optional[str] = None):
        raw_key = api_key or settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY")
        if raw_key:
            self.api_key = raw_key.strip().strip("\"'")
            masked = self.api_key[:6] + "*" * (len(self.api_key) - 9) + self.api_key[-3:] if len(self.api_key) > 9 else "***"
            logger.info("========== STEP 3 ==========\nGemini API Key Loaded:\n%s", masked)
            logger.info("========== STEP 3B ==========\nInitialize Gemini Client with masked key: %s", masked)
            genai.configure(api_key=self.api_key)
        else:
            self.api_key = None
            logger.warning("GEMINI_API_KEY is not configured in environment or settings.")

    def extract_medical_data_sync(self, file_bytes: bytes, mime_type: str, filename: Optional[str] = None) -> Dict[str, Any]:
        """
        Synchronous worker method executing Gemini Multimodal analysis.
        Iterates across fallback models (gemini-flash-latest, gemini-2.5-flash, gemini-2.0-flash)
        and raises an explicit authentication error if API_KEY_INVALID occurs.
        """
        if not self.api_key:
            logger.error("Gemini API key is not configured in environment or settings.")
            raise ValueError("Gemini API authentication failed. Verify GEMINI_API_KEY in .env.")

        logger.info("PDF path / Document Bytes Received: %d bytes (MIME: %s, Filename: %s)", len(file_bytes), mime_type, filename or "uploaded_report.pdf")

        prompt = """
You are an expert senior medical report extraction AI.
Analyze the attached medical report / laboratory report document carefully and extract ALL structured clinical information.

CRITICAL INSTRUCTIONS:
1. Extract EVERY SINGLE laboratory test, biomarker, measurement, and parameter present in the document.
2. DO NOT limit extraction to any single panel (such as Kidney Function Tests). You MUST extract ALL panels found:
   - CBC (Hemoglobin, RBC, WBC, Platelets, Hematocrit, MCV, MCH, MCHC, Neutrophils, Lymphocytes, Monocytes, Eosinophils, Basophils, etc.)
   - Kidney Function Tests (Serum Creatinine, Blood Urea / BUN, Uric Acid, Sodium, Potassium, Chloride, eGFR, etc.)
   - Liver Function Tests (ALT/SGPT, AST/SGOT, Bilirubin Total/Direct, Alkaline Phosphatase, Albumin, Globulin, Total Protein)
   - Blood Sugar / Diabetes (Fasting Blood Sugar, Postprandial, HbA1c, Random Blood Glucose)
   - Lipid Profile (Total Cholesterol, Triglycerides, HDL, LDL, VLDL)
   - Thyroid Panel (TSH, Free T3, Free T4)
   - Urine Analysis & Any Additional Tests / Biomarkers found in the document.
3. Every test item MUST be returned as an individual object in the `test_results` array.
4. Categorize each test into one of: "CBC", "Kidney Function", "Liver Function", "Blood Sugar", "Lipid Profile", "Thyroid", "Urine Analysis", or "Other".
5. Return ONLY valid, parseable JSON matching the schema below. DO NOT wrap with markdown code fences (no ```json).

JSON SCHEMA:
{
  "patient": {
    "name": "Patient Full Name or null",
    "age": 45 or null,
    "gender": "Male / Female / Other or null",
    "patient_id": "Patient ID / MRN or null",
    "blood_group": "Blood Group (e.g. O Positive) or null"
  },
  "hospital": {
    "hospital": "Hospital / Clinic Name or null",
    "doctor": "Attending Doctor Name or null",
    "department": "Department / Specialty or null",
    "report_date": "Report Date (YYYY-MM-DD or string) or null",
    "laboratory_name": "Diagnostic Laboratory Name or null"
  },
  "test_results": [
    {
      "test_name": "Exact Biomarker Name",
      "value": "Measured Result Value",
      "unit": "Unit of measurement or null",
      "reference_range": "Normal Reference Range or null",
      "status": "Normal" | "High" | "Low",
      "category": "CBC" | "Kidney Function" | "Liver Function" | "Blood Sugar" | "Lipid Profile" | "Thyroid" | "Urine Analysis" | "Other"
    }
  ],
  "diagnosis": "Gemini / Doctor Clinical Summary or null",
  "recommendations": "Doctor recommendations or follow-up notes or null"
}
"""

        ext = os.path.splitext(filename)[1].lower() if filename else (".pdf" if mime_type == "application/pdf" else ".png")
        if not ext:
            ext = ".pdf"

        masked = self.api_key[:6] + "*" * (len(self.api_key) - 9) + self.api_key[-3:] if (self.api_key and len(self.api_key) > 9) else "***"
        now_ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f")[:-3]
        logger.info(f"[{now_ts}] STEP: Gemini client initialized")
        logger.info("========== STEP 3 ==========\nGemini API Key Loaded:\n%s", masked)
        logger.info("========== STEP 3B ==========\nInitialize Gemini Client: Client configured with google.generativeai SDK.")

        candidate_models = [
            "gemini-3.1-flash-lite-preview",
            "gemini-3.1-flash-lite",
            "gemini-3.5-flash-lite",
            "gemini-flash-lite-latest",
            "gemini-3.5-flash",
            "gemini-flash-latest",
            "gemini-2.0-flash",
        ]
        generation_config = {
            "temperature": 0.1,
            "response_mime_type": "application/json",
        }

        for model_name in candidate_models:
            logger.info("========== STEP 4 ==========\nGemini Model:\n%s", model_name)
            try:
                now_ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f")[:-3]
                logger.info(f"[{now_ts}] STEP: Gemini request started")
                logger.info("========== STEP 5 ==========\nCalling Gemini (using inline_data payload to bypass Discovery API restrictions with 10.0s timeout)...")
                contents = [
                    {"inline_data": {"mime_type": mime_type, "data": file_bytes}},
                    prompt,
                ]
                model = genai.GenerativeModel(model_name=model_name, generation_config=generation_config)
                t_call_start = time.time()
                # Ensure Gemini request has a reasonable timeout to respond before Frontend 15s timeout
                response = model.generate_content(contents, request_options={"timeout": 10.0})
                t_call_duration = time.time() - t_call_start
                raw_text = response.text.strip()
                now_ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f")[:-3]
                logger.info(f"[{now_ts}] STEP: Gemini response received")
                logger.info("========== STEP 6 ==========\nReceive Response (Model: %s):\n%s", model_name, raw_text)

                if raw_text.startswith("```json"):
                    raw_text = raw_text[7:]
                if raw_text.startswith("```"):
                    raw_text = raw_text[3:]
                if raw_text.endswith("```"):
                    raw_text = raw_text[:-3]
                raw_text = raw_text.strip()

                t_parse_start = time.time()
                logger.info("========== STEP 7 ==========\nParse JSON: Successfully received text response, parsing JSON structure...")
                parsed_data = json.loads(raw_text)
                t_parse_duration = time.time() - t_parse_start
                now_ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f")[:-3]
                logger.info(f"[{now_ts}] STEP: JSON parsed")
                logger.info("Gemini Request Completed: Successfully parsed %d test results using model '%s'",
                            len(parsed_data.get("test_results", [])), model_name)
                
                parsed_data["_timing"] = {
                    "calling_gemini": t_call_duration,
                    "parsing_json": t_parse_duration,
                }
                return parsed_data

            except Exception as exc:
                exc_type, exc_value, exc_tb = sys.exc_info()
                tb_entry = traceback.extract_tb(exc_tb)[-1]
                now_ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f")[:-3]
                if "timeout" in str(type(exc)).lower() or "timeout" in str(exc).lower() or "deadline" in str(type(exc)).lower() or "deadline" in str(exc).lower():
                    logger.error(f"[{now_ts}] [GEMINI TIMEOUT ERROR] Request exceeded configured timeout of 10.0 seconds on model '{model_name}': {type(exc).__name__}: {exc}")
                
                logger.error(
                    f"[{now_ts}] [EXECUTION STOPPED]\n"
                    f"Exact Stage: Calling Gemini / JSON Parsing (Model: {model_name})\n"
                    f"File: {tb_entry.filename}\n"
                    f"Function: {tb_entry.name}\n"
                    f"Line Number: {tb_entry.lineno}\n"
                    f"Exception: {exc_type.__name__}: {exc_value}"
                )
                # Do not swallow exceptions
                raise exc

        raise RuntimeError("Gemini medical report extraction failed across all candidate models.")

    async def extract_medical_data(self, file_bytes: bytes, mime_type: str, filename: Optional[str] = None) -> Dict[str, Any]:
        """
        Asynchronous wrapper delegating blocking Gemini network calls to a thread pool.
        """
        return await asyncio.to_thread(self.extract_medical_data_sync, file_bytes, mime_type, filename)
