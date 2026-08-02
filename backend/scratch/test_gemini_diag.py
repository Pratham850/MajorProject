import os
import json
from pathlib import Path
from dotenv import load_dotenv
import google.generativeai as genai

env_path = Path("c:/AlphaProjects/MajorProject/.env")
load_dotenv(dotenv_path=env_path)

key = os.getenv("GEMINI_API_KEY")
print("=== TESTING REAL DOCUMENT EXTRACTION WITH GEMINI FLASH LATEST ===")
genai.configure(api_key=key.strip().strip("\"'"))

# Candidate models in fallback order
candidate_models = ["gemini-flash-latest", "gemini-2.5-flash", "gemini-2.0-flash", "gemini-2.5-flash-lite"]

prompt = """
You are an expert senior medical report extraction AI.
Analyze the attached medical report / laboratory report document carefully and extract ALL structured clinical information.

CRITICAL INSTRUCTIONS:
1. Extract EVERY SINGLE laboratory test, biomarker, measurement, and parameter present in the document.
2. Every test item MUST be returned as an individual object in the `test_results` array with fields: test_name, value, unit, reference_range, status, category.
3. Return ONLY valid, parseable JSON matching the schema below. DO NOT wrap with markdown code fences (no ```json).

JSON SCHEMA:
{
  "patient": {
    "name": "Patient Full Name or null",
    "age": 45 or null,
    "gender": "Male / Female / Other or null",
    "patient_id": "Patient ID / MRN or null",
    "blood_group": "Blood Group or null"
  },
  "hospital": {
    "hospital": "Hospital / Clinic Name or null",
    "doctor": "Attending Doctor Name or null",
    "department": "Department / Specialty or null",
    "report_date": "Report Date or null",
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
  "diagnosis": "Clinical Impression or null",
  "recommendations": "Doctor recommendations or null"
}
"""

generation_config = {
    "temperature": 0.1,
    "response_mime_type": "application/json",
}

# Find any pdf file in uploads/ to test real extraction
upload_dir = Path("c:/AlphaProjects/MajorProject/backend/uploads")
pdf_files = list(upload_dir.glob("*.pdf")) + list(upload_dir.glob("*.png")) + list(upload_dir.glob("*.jpg"))

if not pdf_files:
    print("No uploaded files found in uploads directory. Creating dummy test image...")
    # Create a small dummy image or text sample
    sample_text = "Sample test"
else:
    test_file = pdf_files[0]
    print(f"Testing real uploaded file: {test_file}")
    
    with open(test_file, "rb") as f:
        file_bytes = f.read()

    mime_type = "application/pdf" if test_file.suffix == ".pdf" else "image/png"

    success = False
    for model_name in candidate_models:
        print(f"\nAttempting extraction with model: {model_name}...")
        try:
            model = genai.GenerativeModel(model_name=model_name, generation_config=generation_config)
            
            # Test using upload_file
            import tempfile
            with tempfile.NamedTemporaryFile(delete=False, suffix=test_file.suffix) as tmp:
                tmp.write(file_bytes)
                tmp_path = tmp.name
                
            uploaded_file = genai.upload_file(path=tmp_path, mime_type=mime_type)
            res = model.generate_content([uploaded_file, prompt])
            raw_text = res.text.strip()
            print(f"RAW RESPONSE FROM {model_name}:\n{raw_text}\n")
            
            if raw_text.startswith("```json"):
                raw_text = raw_text[7:]
            if raw_text.startswith("```"):
                raw_text = raw_text[3:]
            if raw_text.endswith("```"):
                raw_text = raw_text[:-3]
            raw_text = raw_text.strip()

            parsed = json.loads(raw_text)
            print("SUCCESSFULLY PARSED JSON!")
            print(f"Patient Name: {parsed.get('patient', {}).get('name')}")
            print(f"Extracted Test Count: {len(parsed.get('test_results', []))}")
            success = True
            break
        except Exception as e:
            print(f"FAILED with model {model_name}: {e}")

    if not success:
        print("\nALL CANDIDATE MODELS FAILED!")
