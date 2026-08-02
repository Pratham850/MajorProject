import os
import asyncio
import logging
import sys
import traceback
from pathlib import Path
from dotenv import load_dotenv
from unittest.mock import AsyncMock, MagicMock

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
env_path = Path("c:/AlphaProjects/MajorProject/.env")
load_dotenv(dotenv_path=env_path)

from app.services.record_service import RecordService
from app.models import User, MedicalRecord

async def debug_reprocess():
    print("=== DEBUGGING REPROCESS AI ENDPOINT ===")
    mock_repo = AsyncMock()
    mock_db = AsyncMock()
    
    upload_dir = Path("c:/AlphaProjects/MajorProject/backend/uploads")
    pdf_files = [f for f in upload_dir.glob("*.pdf") if f.stat().st_size > 100]
    
    if not pdf_files:
        print("No valid pdf files found in uploads.")
        return
        
    target_pdf = pdf_files[0]
    print(f"Targeting real PDF: {target_pdf} ({target_pdf.stat().st_size} bytes)")
    
    mock_rec = MedicalRecord(
        id=12,
        patient_id=1,
        title="Diagnostic Report",
        category="Lab Report",
        file_path=str(target_pdf),
        file_size=f"{target_pdf.stat().st_size} B",
        consents=[]
    )
    mock_repo.get_by_id.return_value = mock_rec
    
    service = RecordService(record_repo=mock_repo, db=mock_db)
    user = User(id=1, role="patient", full_name="Test Patient")
    
    try:
        result = await service.parse_record_by_id("rec-12", user)
        print("\n=== REPROCESS SUCCESS ===")
        print("Keys returned:", list(result.keys()))
        print("Extracted test results count:", len(result.get("extractedData", {}).get("test_results", [])))
    except Exception as e:
        print("\n=== REPROCESS FAILED WITH EXCEPTION ===")
        exc_type, exc_val, exc_tb = sys.exc_info()
        traceback.print_exception(exc_type, exc_val, exc_tb)

if __name__ == "__main__":
    asyncio.run(debug_reprocess())
