import os
import asyncio
import logging
from pathlib import Path
from dotenv import load_dotenv
from unittest.mock import AsyncMock, MagicMock
from fastapi import UploadFile
from datetime import datetime

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
env_path = Path("c:/AlphaProjects/MajorProject/.env")
load_dotenv(dotenv_path=env_path)

from app.services.record_service import RecordService
from app.models import User, MedicalRecord

async def run_test():
    print("=== TESTING UPLOAD & GEMINI PROCESSING PIPELINE ===")
    mock_repo = AsyncMock()
    mock_db = AsyncMock()
    
    mock_rec = MedicalRecord(
        id=101,
        patient_id=1,
        title="CBC Test Report",
        category="Lab Report",
        file_path="uploads/test.pdf",
        file_size="3.3 KB",
        created_at=datetime.now()
    )
    mock_repo.create.return_value = mock_rec
    
    service = RecordService(record_repo=mock_repo, db=mock_db)
    mock_user = User(id=1, role="patient", full_name="Test Patient")
    
    upload_dir = Path("c:/AlphaProjects/MajorProject/backend/uploads")
    real_pdf = upload_dir / "ced2be2509e3400eaaa3ce863dd58d50.pdf"
    
    with open(real_pdf, "rb") as f:
        file_content = f.read()
        
    mock_file = AsyncMock(spec=UploadFile)
    mock_file.filename = "ced2be2509e3400eaaa3ce863dd58d50.pdf"
    mock_file.content_type = "application/pdf"
    mock_file.read.return_value = file_content
    
    try:
        res = await service.upload_record(
            current_user=mock_user,
            title="CBC Test Report",
            category="Lab Report",
            file=mock_file
        )
        print("\n=== UPLOAD RECORD RESULT ===")
        print(f"Record ID: {res.get('id')}")
        print(f"AI Status: {res.get('aiStatus')}")
        print(f"Extracted Biomarkers Count: {len(res.get('extractedData', {}).get('test_results', []))}")
    except Exception as e:
        print(f"\n=== PIPELINE EXCEPTION CAUGHT (NOT SWALLOWED) ===")
        print(f"Error: {type(e).__name__}: {e}")

if __name__ == "__main__":
    asyncio.run(run_test())
