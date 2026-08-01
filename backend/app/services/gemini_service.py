import os
import json
import logging
import asyncio
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
        self.api_key = api_key or settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY")
        if self.api_key:
            genai.configure(api_key=self.api_key)
        else:
            logger.warning("GEMINI_API_KEY is not configured in environment or settings.")

    def _get_model(self):
        """Instantiate Gemini model instance with strict JSON schema instructions."""
        # Primary target: gemini-2.5-flash, fallback to gemini-1.5-flash
        model_name = "gemini-2.5-flash"
        generation_config = {
            "temperature": 0.1,
            "response_mime_type": "application/json",
        }
        try:
            return genai.GenerativeModel(model_name=model_name, generation_config=generation_config)
        except Exception:
            return genai.GenerativeModel(model_name="gemini-1.5-flash", generation_config=generation_config)

    def extract_medical_data_sync(self, file_bytes: bytes, mime_type: str) -> Dict[str, Any]:
        """
        Synchronous worker method executing Gemini Multimodal analysis.
        Converts file bytes into inline media parts and enforces STRICT JSON format.
        """
        if not self.api_key:
            raise ValueError("Gemini API key is not configured. Please set GEMINI_API_KEY in .env.")

        logger.info("Gemini Processing Started: Sending document bytes (MIME: %s) to Gemini Vision", mime_type)

        model = self._get_model()

        prompt = """
You are a senior medical report extraction AI.
Analyze the attached medical report / laboratory report document carefully and extract structured medical information.

STRICT REQUIREMENTS:
1. You MUST return ONLY valid, parseable JSON matching the following schema.
2. DO NOT include markdown code blocks (e.g. do NOT wrap with ```json).
3. DO NOT include introductory or concluding conversational text.
4. Format output strictly according to this JSON structure:

{
  "patient": {
    "name": "Patient Full Name or null",
    "age": 45 or null,
    "gender": "Male / Female / Other or null"
  },
  "hospital": {
    "hospital": "Hospital or Medical Center Name or null",
    "doctor": "Doctor Name or null",
    "report_date": "YYYY-MM-DD or report date string or null",
    "laboratory_name": "Lab Name or null"
  },
  "test_results": [
    {
      "test_name": "Hemoglobin / Creatinine / Glucose etc.",
      "value": "13.5",
      "unit": "g/dL",
      "reference_range": "12.0 - 16.0",
      "status": "Normal" or "High" or "Low"
    }
  ],
  "diagnosis": "Clinical Impression or null",
  "recommendations": "Doctor recommendations or null"
}

Extract all available lab test measurements, reference ranges, and abnormal indicators accurately.
"""

        contents = [
            {"mime_type": mime_type, "data": file_bytes},
            prompt,
        ]

        try:
            response = model.generate_content(contents)
            raw_text = response.text.strip()

            # Clean markdown code block fences if present
            if raw_text.startswith("```json"):
                raw_text = raw_text[7:]
            if raw_text.startswith("```"):
                raw_text = raw_text[3:]
            if raw_text.endswith("```"):
                raw_text = raw_text[:-3]
            raw_text = raw_text.strip()

            parsed_data = json.loads(raw_text)
            logger.info("Extraction Success: Successfully extracted %d lab test results from document", 
                        len(parsed_data.get("test_results", [])))
            return parsed_data
        except Exception as exc:
            logger.error("Extraction Failed: Gemini API processing error: %s", str(exc), exc_info=True)
            raise RuntimeError(f"Gemini medical report extraction failed: {str(exc)}") from exc

    async def extract_medical_data(self, file_bytes: bytes, mime_type: str) -> Dict[str, Any]:
        """
        Asynchronous wrapper delegating blocking Gemini network calls to a thread pool
        to prevent blocking FastAPI's event loop.
        """
        return await asyncio.to_thread(self.extract_medical_data_sync, file_bytes, mime_type)
