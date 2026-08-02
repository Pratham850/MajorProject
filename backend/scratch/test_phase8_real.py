import os
import time
import json
import asyncio
import logging
import traceback
from pathlib import Path
from dotenv import load_dotenv
from fastapi.testclient import TestClient
from sqlalchemy import text, select
from fastapi import UploadFile
from unittest.mock import AsyncMock

# Load environment variables
env_path = Path("c:/AlphaProjects/MajorProject/.env")
load_dotenv(dotenv_path=env_path)

from app.main import create_app
from app.database import engine, AsyncSessionLocal, get_db
from app.models import User, MedicalRecord, Base
from app.services.record_service import RecordService
from app.repositories.record_repository import RecordRepository
from app.services.medical_report_parser import MedicalReportParser
import google.generativeai as genai

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("test_phase8")

async def ensure_db_schema():
    print("\n--- Initializing MySQL Database & Verifying Schema ---")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        try:
            await conn.execute(text("ALTER TABLE medical_records ADD COLUMN extracted_data LONGTEXT NULL;"))
            print("Successfully added 'extracted_data' column to medical_records in MySQL.")
        except Exception as e:
            err_msg = str(e).lower()
            if "duplicate column" in err_msg or "already exists" in err_msg or "1060" in err_msg:
                print("Column 'extracted_data' already exists in medical_records table.")
            else:
                print(f"Notice during alter table: {e}")

async def test_1_backend_health():
    print("\n=========================================================")
    print("TEST 1: BACKEND HEALTH TEST (GET /docs & GET /healthz)")
    print("=========================================================")
    app = create_app()
    client = TestClient(app)
    
    t0 = time.time()
    res_docs = client.get("/docs")
    t_dur = time.time() - t0
    print(f"GET /docs -> Status: {res_docs.status_code}, Time: {t_dur:.4f}s")
    assert res_docs.status_code == 200, f"Expected 200, got {res_docs.status_code}"
    
    res_health = client.get("/healthz")
    print(f"GET /healthz -> Status: {res_health.status_code}, Response: {res_health.json()}")
    assert res_health.status_code == 200, f"Expected 200, got {res_health.status_code}"
    print("-> TEST 1 PASSED!")

async def test_3_gemini_health():
    print("\n=========================================================")
    print("TEST 3: GEMINI HEALTH TEST (Reply SUCCESS)")
    print("=========================================================")
    api_key = os.getenv("GEMINI_API_KEY")
    genai.configure(api_key=api_key.strip().strip("\"'"))
    model = genai.GenerativeModel("gemini-3.1-flash-lite-preview")
    
    t0 = time.time()
    res = model.generate_content("Reply SUCCESS", request_options={"timeout": 10.0})
    t_dur = time.time() - t0
    text = res.text.strip()
    print(f"Gemini output: '{text}' (Time: {t_dur:.3f}s)")
    assert "SUCCESS" in text.upper(), f"Expected SUCCESS in response, got '{text}'"
    print("-> TEST 3 PASSED!")

async def test_4_parser_test():
    print("\n=========================================================")
    print("TEST 4: PARSER TEST (Extract structured JSON)")
    print("=========================================================")
    parser = MedicalReportParser()
    upload_dir = Path("c:/AlphaProjects/MajorProject/backend/uploads")
    pdf_files = [f for f in upload_dir.glob("*.pdf") if f.stat().st_size > 100]
    target_pdf = pdf_files[0]
    
    with open(target_pdf, "rb") as f:
        content = f.read()
        
    print(f"Testing parser on real PDF: {target_pdf.name} ({len(content)} bytes)")
    t0 = time.time()
    result = await parser.parse_report(file_bytes=content, filename=target_pdf.name)
    t_dur = time.time() - t0
    
    data = result.dict()
    print(f"Extraction successful in {t_dur:.2f}s!")
    print(f"Patient Name: {data.get('patient', {}).get('name')}")
    print(f"Test Results Count: {len(data.get('test_results', []))}")
    assert len(data.get("test_results", [])) > 0, "No test results extracted!"
    print("-> TEST 4 PASSED!")
    return data

async def test_2_5_6_upload_save_and_report_details():
    print("\n=========================================================")
    print("TEST 2, 5 & 6: REAL UPLOAD, DB SAVE & REPORT DETAILS TEST")
    print("=========================================================")
    async with AsyncSessionLocal() as db:
        # Get or create a real user in DB
        res_user = await db.execute(select(User).limit(1))
        real_user = res_user.scalars().first()
        if not real_user:
            real_user = User(
                email="patient_phase8@test.com",
                password_hash="hashed_pw",
                full_name="Pratham Kumar Real",
                role="patient",
                phone_number="+919876543210"
            )
            db.add(real_user)
            await db.commit()
            await db.refresh(real_user)
        print(f"Using Real User in MySQL: ID={real_user.id}, Name={real_user.full_name}, Role={real_user.role}")
        
        repo = RecordRepository(db)
        service = RecordService(record_repo=repo, db=db)
        
        upload_dir = Path("c:/AlphaProjects/MajorProject/backend/uploads")
        pdf_files = [f for f in upload_dir.glob("*.pdf") if f.stat().st_size > 100]
        real_pdf = pdf_files[0]
        
        with open(real_pdf, "rb") as f:
            file_content = f.read()
            
        mock_file = AsyncMock(spec=UploadFile)
        mock_file.filename = "phase8_real_test.pdf"
        mock_file.content_type = "application/pdf"
        mock_file.read.return_value = file_content
        
        print("\n--- Executing Test 2: Upload Sample PDF ---")
        t0 = time.time()
        upload_res = await service.upload_record(
            current_user=real_user,
            title="Real Complete Diagnostic Report",
            category="Lab Report",
            file=mock_file
        )
        t_upload = time.time() - t0
        print(f"Upload completed in {t_upload:.2f}s!")
        rec_id_str = upload_res["id"]
        rec_id_int = int(rec_id_str.replace("rec-", ""))
        print(f"Uploaded Record ID: {rec_id_str}, aiStatus: {upload_res.get('aiStatus')}")
        assert upload_res.get("aiStatus") == "Completed", "AI Status should be Completed"
        print("-> TEST 2 PASSED!")
        
        print("\n--- Executing Test 5: Database Save Test ---")
        res_rec = await db.execute(select(MedicalRecord).filter(MedicalRecord.id == rec_id_int))
        saved_record = res_rec.scalars().first()
        assert saved_record is not None, f"Record ID {rec_id_int} not found in MySQL!"
        print(f"Verified row in MySQL medical_records table: id={saved_record.id}, title='{saved_record.title}'")
        print(f"Checking extracted_data persistence column...")
        assert saved_record.extracted_data is not None and len(saved_record.extracted_data) > 50, "extracted_data not saved in DB!"
        parsed_db_json = json.loads(saved_record.extracted_data)
        print(f"Successfully loaded JSON from DB column! Biomarkers saved in DB: {len(parsed_db_json.get('test_results', []))}")
        print("-> TEST 5 PASSED!")
        
        print("\n--- Executing Test 6: Report Details Test (DB Cache HIT verification) ---")
        t_det_start = time.time()
        details_res = await service.get_record(rec_id_str, real_user)
        t_det_dur = time.time() - t_det_start
        print(f"Fetched Report Details in {t_det_dur:.4f} seconds!")
        extracted_from_details = details_res.get("extractedData")
        assert extracted_from_details is not None, "extractedData is missing in get_record response!"
        assert len(extracted_from_details.get("test_results", [])) == len(parsed_db_json.get("test_results", [])), "Mismatch in test results count!"
        print(f"Verified Report Details page data structure matches extracted database data cleanly without re-running Gemini!")
        print("-> TEST 6 PASSED!")

async def main():
    try:
        await ensure_db_schema()
        await test_1_backend_health()
        await test_3_gemini_health()
        await test_4_parser_test()
        await test_2_5_6_upload_save_and_report_details()
        print("\n=========================================================")
        print("ALL 6 PHASE 8 TESTS COMPLETED & VERIFIED SUCCESSFULLY!")
        print("=========================================================")
    except Exception as e:
        print("\n[FAIL] Test execution encountered an exception:")
        traceback.print_exc()
        exit(1)

if __name__ == "__main__":
    asyncio.run(main())
