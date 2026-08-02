import os
from pathlib import Path
from dotenv import load_dotenv
import google.generativeai as genai

env_path = Path("c:/AlphaProjects/MajorProject/.env")
load_dotenv(dotenv_path=env_path)

key = os.getenv("GEMINI_API_KEY")
clean_key = key.strip().strip("\"'")
genai.configure(api_key=clean_key)

# Let's test with the 3365 bytes PDF file or simple text
upload_dir = Path("c:/AlphaProjects/MajorProject/backend/uploads")
real_pdf = upload_dir / "ced2be2509e3400eaaa3ce863dd58d50.pdf"

if not real_pdf.exists():
    print(f"File {real_pdf} does not exist!")
    exit(1)

with open(real_pdf, "rb") as f:
    data = f.read()

print(f"Read {len(data)} bytes from {real_pdf.name}")
mime_type = "application/pdf"
prompt = "Analyze this PDF and reply with a one-sentence summary."

candidate_models = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-flash-latest"]

for model_name in candidate_models:
    print(f"\n--- Testing model: {model_name} with inline_data ---")
    try:
        model = genai.GenerativeModel(model_name=model_name)
        contents = [
            {"inline_data": {"mime_type": mime_type, "data": data}},
            prompt
        ]
        res = model.generate_content(contents)
        print("SUCCESS! Response text:")
        print(res.text)
        break
    except Exception as e:
        print(f"FAILED with model {model_name}: {e}")
