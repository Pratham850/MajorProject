import os
import asyncio
import logging
from pathlib import Path
from dotenv import load_dotenv

# Set up logging to stdout so we can see all STEP logs
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

# Load environment variables
env_path = Path("c:/AlphaProjects/MajorProject/.env")
load_dotenv(dotenv_path=env_path)

from app.services.medical_report_parser import MedicalReportParser

async def run_test():
    print("=== STARTING PIPELINE VERIFICATION TEST ===")
    parser = MedicalReportParser()

    upload_dir = Path("c:/AlphaProjects/MajorProject/backend/uploads")
    real_pdf = upload_dir / "ced2be2509e3400eaaa3ce863dd58d50.pdf"

    if not real_pdf.exists():
        print(f"ERROR: {real_pdf} missing!")
        return

    with open(real_pdf, "rb") as f:
        data = f.read()

    print(f"Testing pipeline with file: {real_pdf.name} ({len(data)} bytes)\n")

    try:
        result = await parser.parse_report(data, real_pdf.name, "application/pdf")
        print("\n=== EXTRACTION SUCCESS VERIFIED ===")
        print(f"Patient Name: {result.patient.name}")
        print(f"Patient Age: {result.patient.age}")
        print(f"Hospital Name: {result.hospital.hospital}")
        print(f"Total Biomarkers Extracted: {len(result.test_results)}")
        for test in result.test_results[:5]:
            print(f"  - [{test.category}] {test.test_name}: {test.value} {test.unit or ''} ({test.status})")
        if len(result.test_results) > 5:
            print(f"  ... and {len(result.test_results) - 5} more tests.")
    except Exception as e:
        print(f"\n=== EXTRACTION FAILED ===")
        print(f"Exception: {e}")

if __name__ == "__main__":
    asyncio.run(run_test())
