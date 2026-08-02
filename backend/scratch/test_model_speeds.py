import os
import time
from pathlib import Path
from dotenv import load_dotenv
import google.generativeai as genai

env_path = Path("c:/AlphaProjects/MajorProject/.env")
load_dotenv(dotenv_path=env_path)
key = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=key.strip().strip("\"'"))

upload_dir = Path("c:/AlphaProjects/MajorProject/backend/uploads")
real_pdf = upload_dir / "ced2be2509e3400eaaa3ce863dd58d50.pdf"

with open(real_pdf, "rb") as f:
    file_bytes = f.read()

models_to_test = ["gemini-2.5-flash", "gemini-1.5-flash", "gemini-2.0-flash", "gemini-flash-latest"]
prompt = "Extract all test results from this report into simple valid JSON with keys: test_name, value, unit, status."

for m in models_to_test:
    print(f"--- Testing {m} ---")
    t0 = time.time()
    try:
        model = genai.GenerativeModel(model_name=m)
        contents = [
            {"inline_data": {"mime_type": "application/pdf", "data": file_bytes}},
            prompt,
        ]
        res = model.generate_content(contents, request_options={"timeout": 8.0})
        t1 = time.time()
        print(f"[{m}] SUCCESS in {t1 - t0:.2f}s! Output len: {len(res.text)}")
    except Exception as e:
        t1 = time.time()
        print(f"[{m}] FAILED in {t1 - t0:.2f}s with error: {type(e).__name__}: {e}")
