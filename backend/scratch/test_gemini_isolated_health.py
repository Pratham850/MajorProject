import os
from pathlib import Path
from dotenv import load_dotenv
import google.generativeai as genai

env_path = Path("c:/AlphaProjects/MajorProject/.env")
load_dotenv(dotenv_path=env_path)

key = os.getenv("GEMINI_API_KEY")
print("=== ISOLATED GEMINI HEALTH TEST ON REAL PDF ===")
genai.configure(api_key=key.strip().strip("\"'"))

upload_dir = Path("c:/AlphaProjects/MajorProject/backend/uploads")
pdf_files = [f for f in upload_dir.glob("*.pdf") if f.stat().st_size > 100]
target_pdf = pdf_files[0]
print(f"Targeting PDF: {target_pdf.name} ({target_pdf.stat().st_size} bytes)")

with open(target_pdf, "rb") as f:
    pdf_bytes = f.read()

prompt = """
Analyze this clinical document and extract medical parameters.
Respond ONLY with valid JSON matching this structure:
{
  "test_results": [
    {"test_name": "...", "value": "...", "unit": "...", "status": "Normal"}
  ]
}
"""

contents = [
    prompt,
    {"mime_type": "application/pdf", "data": pdf_bytes}
]

candidate_models = [
    "gemini-3.1-flash-lite-preview",
    "gemini-3.1-flash-lite",
    "gemini-3.5-flash-lite",
    "gemini-flash-lite-latest",
    "gemini-3.5-flash",
    "gemini-omni-flash-preview",
    "gemma-4-31b-it"
]

for m_name in candidate_models:
    print(f"\nTesting extraction with model: {m_name} ...", end=" ", flush=True)
    try:
        model = genai.GenerativeModel(m_name)
        res = model.generate_content(contents, request_options={"timeout": 15.0})
        text = res.text.strip()
        print(f"SUCCESS! Length: {len(text)} chars\nPreview: {text[:200]}...")
        break
    except Exception as e:
        err = str(e).split('\n')[0]
        print(f"FAILED ({type(e).__name__}): {err[:120]}")
