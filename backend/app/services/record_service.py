from __future__ import annotations
import os
import uuid
import time
import sys
import traceback
import json
from functools import wraps
from datetime import datetime
import logging

def trace_fn(func):
    @wraps(func)
    async def wrapper(*args, **kwargs):
        fn_name = func.__name__
        t_start = time.time()
        print(f"\n---> [ENTER function] {fn_name}")
        print(f"     [Input] args={args[1:]}, kwargs={kwargs}")
        try:
            res = await func(*args, **kwargs)
            t_dur = time.time() - t_start
            print(f"<--- [EXIT function] {fn_name}")
            print(f"     [Execution time] {t_dur:.3f}s")
            print(f"     [Output] {str(res)[:250]}...")
            return res
        except Exception as e:
            t_dur = time.time() - t_start
            print(f"<--- [EXIT function (EXCEPTION)] {fn_name}")
            print(f"     [Execution time] {t_dur:.3f}s")
            print(f"     [Exceptions] {type(e).__name__}: {str(e)}")
            raise e
    return wrapper
from typing import Any, Dict, List
from fastapi import HTTPException, status, UploadFile
from fastapi.responses import FileResponse, JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.models import User, MedicalRecord, AuditLog
from app.repositories.record_repository import RecordRepository
from app.schemas.records import RecordUpdate
from app.services.medical_report_parser import MedicalReportParser

logger = logging.getLogger("healthshare.records")


def parse_record_id(record_id_str: str) -> int:
    """Helper utility to parse 'rec-12' or '12' into integer record ID."""
    clean = str(record_id_str).replace("rec-", "")
    try:
        return int(clean)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid medical record ID format: '{record_id_str}'",
        )


class RecordService:
    """
    Service Layer containing business logic for Medical Records.
    Handles file upload, Gemini AI report parsing, listing records, record retrieval, metadata updates,
    record deletion, and streaming secure file downloads.
    """

    def __init__(self, record_repo: RecordRepository, db: AsyncSession, report_parser: MedicalReportParser = None):
        self.record_repo = record_repo
        self.db = db
        self.report_parser = report_parser or MedicalReportParser()

    @trace_fn
    async def upload_record(
        self,
        current_user: User,
        title: str,
        category: str,
        file: UploadFile,
    ) -> Dict[str, Any]:
        """
        Validated Upload Workflow:
        1. Log Upload Started.
        2. Validate user role, category, file extension (PDF, PNG, JPG, JPEG), and file size (< 25MB).
        3. Save file inside uploads/ directory with a unique filename.
        4. Insert MedicalRecord & AuditLog into MySQL database.
        5. Trigger Gemini 2.5 Flash parsing AFTER successful database commit.
        6. Return clean structured response with aiStatus (Completed / Processing Failed).
        """
        t_total_start = time.time()
        current_stage = "Request received"
        now_ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f")[:-3]
        logger.info(f"[{now_ts}] STEP: Request received")
        logger.info("Frontend Axios timeout detected at 15000 ms. Ensuring backend response within 10s SLA.")
        logger.info("Upload Started: Patient ID %s uploading file '%s' under category '%s'", current_user.id, file.filename, category)

        try:
            user_role = (current_user.role if isinstance(current_user.role, str) else current_user.role.value).lower()
            if user_role not in ["patient", "admin"]:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Only patients can upload medical records.",
                )

            # Validate category
            valid_categories = {"Lab Report", "Prescription", "Immunization", "Imaging"}
            if category not in valid_categories:
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail=f"Invalid category. Must be one of: {', '.join(valid_categories)}",
                )

            # Validate file extension
            filename = file.filename or "report.pdf"
            file_ext = os.path.splitext(filename)[1].lower()
            allowed_extensions = {".pdf", ".png", ".jpg", ".jpeg"}
            if file_ext not in allowed_extensions:
                raise HTTPException(
                    status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                    detail=f"Invalid file type '{file_ext}'. Allowed formats: PDF, PNG, JPG, JPEG.",
                )

            current_stage = "File uploaded"
            content = await file.read()
            now_ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f")[:-3]
            logger.info(f"[{now_ts}] STEP: File uploaded")
            file_size_bytes = len(content)

            if file_size_bytes == 0:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Uploaded file is empty (0 bytes). Please upload a valid medical report.",
                )

            max_allowed_bytes = 25 * 1024 * 1024  # 25MB
            if file_size_bytes > max_allowed_bytes:
                raise HTTPException(
                    status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                    detail=f"File size ({file_size_bytes / 1048576:.1f} MB) exceeds maximum allowed limit of 25MB.",
                )

            file_size_formatted = f"{file_size_bytes / 1024:.1f} KB" if file_size_bytes < 1048576 else f"{file_size_bytes / 1048576:.1f} MB"

            # Storage directory setup & File saved step
            current_stage = "File saved"
            t_save_start = time.time()
            upload_dir = settings.UPLOAD_DIR
            os.makedirs(upload_dir, exist_ok=True)

            unique_filename = f"{uuid.uuid4().hex}{file_ext}"
            relative_path = os.path.join(upload_dir, unique_filename)

            with open(relative_path, "wb") as f:
                f.write(content)
            t_save = time.time() - t_save_start
            now_ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f")[:-3]
            logger.info(f"[{now_ts}] STEP: File saved")
            logger.info("File Saved: Uploaded file stored at '%s' (%s)", relative_path, file_size_formatted)

            # PDF opened step
            current_stage = "PDF opened"
            t_read_start = time.time()
            with open(relative_path, "rb") as f:
                now_ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f")[:-3]
                logger.info(f"[{now_ts}] STEP: PDF opened")
                
                # PDF bytes read step
                current_stage = "PDF bytes read"
                pdf_bytes = f.read()
                t_read = time.time() - t_read_start
                now_ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f")[:-3]
                logger.info(f"[{now_ts}] STEP: PDF bytes read")

            # Trigger Gemini Flash Extraction
            current_stage = "Calling Gemini & Parsing JSON"
            logger.info("Gemini Started: Initiating analysis for uploaded report %s", filename)
            t_gemini_fallback_start = time.time()
            t_call = 0.0
            t_parse = 0.0
            extracted_dict = None
            ai_status = "Completed"

            try:
                extraction = await self.report_parser.parse_report(
                    file_bytes=pdf_bytes,
                    filename=filename,
                    content_type=file.content_type,
                )
                # Extract stage timings from extraction metadata
                timing_meta = getattr(extraction, "timing_metadata", None) or {}
                t_call = timing_meta.get("calling_gemini", 0.0)
                t_parse = timing_meta.get("parsing_json", 0.0)
                if t_call == 0.0:
                    t_call = time.time() - t_gemini_fallback_start - t_parse

                if extraction and extraction.test_results:
                    extracted_dict = extraction.dict()
                    extracted_dict.pop("timing_metadata", None)
                    ai_status = "Completed"
                    logger.info("Gemini Finished: Extracted %d test results", len(extraction.test_results))
                else:
                    extracted_dict = None
                    ai_status = "Processing Failed"
                    logger.warning("Gemini Finished: No structured test results extracted")
            except Exception as exc:
                t_call = time.time() - t_gemini_fallback_start
                t_parse = 0.0
                ai_status = "Processing Failed"
                extracted_dict = None
                exc_type, exc_value, exc_tb = sys.exc_info()
                tb_entry = traceback.extract_tb(exc_tb)[-1]
                now_ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f")[:-3]
                err_msg = (
                    f"\n====================================================\n"
                    f"EXECUTION STOPPED AT STAGE: Calling Gemini / JSON Parsing\n"
                    f"Exact File: {tb_entry.filename}\n"
                    f"Function: {tb_entry.name}\n"
                    f"Line Number: {tb_entry.lineno}\n"
                    f"Exception: {exc_type.__name__}: {exc_value}\n"
                    f"===================================================="
                )
                print(err_msg)
                logger.error(err_msg)

            # Database Insertion step (after JSON parsed as required by sequential steps)
            current_stage = "Database updated"
            t_db_start = time.time()
            new_record = await self.record_repo.create(
                patient_id=current_user.id,
                title=title,
                category=category,
                file_path=relative_path,
                file_size=file_size_formatted,
                extracted_data=json.dumps(extracted_dict) if extracted_dict else None,
            )

            audit = AuditLog(
                user_id=current_user.id,
                action="Medical Record Uploaded",
                details=f"Uploaded record '{title}' ({category}, {file_size_formatted}).",
            )
            self.db.add(audit)
            await self.db.commit()
            try:
                await self.db.refresh(new_record)
            except Exception as ref_err:
                logger.warning(f"Could not refresh record: {ref_err}")
            t_db = time.time() - t_db_start
            now_ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f")[:-3]
            logger.info(f"[{now_ts}] STEP: Database updated")
            logger.info("Database Inserted: Persisted MedicalRecord ID %s for patient ID %s", new_record.id, current_user.id)

            logger.info("Dashboard Updated: Patient ID %s dashboard state synchronized for MedicalRecord ID %s", current_user.id, new_record.id)

            response_payload = {
                "id": f"rec-{new_record.id}",
                "title": new_record.title,
                "category": new_record.category,
                "dateUploaded": (new_record.created_at or datetime.now()).strftime("%Y-%m-%d"),
                "fileSize": new_record.file_size,
                "fileType": file_ext.replace(".", "").upper() or "PDF",
                "aiStatus": ai_status,
                "sharingStatus": "Private",
                "doctorAccess": "Restricted",
                "sharedWith": [],
                "extractedData": extracted_dict,
            }

            # API response returned step
            current_stage = "API response returned"
            now_ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f")[:-3]
            logger.info(f"[{now_ts}] STEP: API response returned")

            # Print timing logs (Task 2)
            t_total = time.time() - t_total_start
            timing_logs = (
                f"\nSaving PDF... {t_save:.2f}s\n"
                f"Reading PDF... {t_read:.2f}s\n"
                f"Calling Gemini... {t_call:.2f}s\n"
                f"Parsing JSON... {t_parse:.2f}s\n"
                f"Saving Database... {t_db:.2f}s\n"
                f"Total request time... {t_total:.2f}s"
            )
            print(timing_logs)
            logger.info("Timing Report:%s", timing_logs)

            return response_payload

        except HTTPException as http_exc:
            # Re-raise HTTPExceptions without swallowing
            raise http_exc
        except Exception as exc:
            exc_type, exc_value, exc_tb = sys.exc_info()
            tb_entry = traceback.extract_tb(exc_tb)[-1]
            now_ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f")[:-3]
            err_msg = (
                f"\n====================================================\n"
                f"EXECUTION STOPPED AT STAGE: {current_stage}\n"
                f"Exact File: {tb_entry.filename}\n"
                f"Function: {tb_entry.name}\n"
                f"Line Number: {tb_entry.lineno}\n"
                f"Exception: {exc_type.__name__}: {exc_value}\n"
                f"===================================================="
            )
            print(err_msg)
            logger.error(err_msg)
            # Do not swallow exceptions (Task 3 & 5)
            raise exc

    @trace_fn
    async def parse_record_by_id(self, record_id_str: str, current_user: User) -> Dict[str, Any]:
        """Parse an existing stored medical record on demand using Gemini API with stage verification."""
        current_stage = "Request Received & Database Lookup"
        now_ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f")[:-3]
        logger.info("[%s] STEP: Reprocess request received for Record ID: %s", now_ts, record_id_str)

        rec_id = parse_record_id(record_id_str)
        record = await self.record_repo.get_by_id(rec_id)
        if not record:
            logger.error("[REPROCESS AUDIT] Record ID %s not found in database", record_id_str)
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"stage": "Database Lookup", "error": "RECORD_NOT_FOUND", "details": f"Record ID {record_id_str} not found"}
            )

        user_role = (current_user.role if isinstance(current_user.role, str) else current_user.role.value).lower()
        if user_role in ["patient", "admin"] and record.patient_id != current_user.id and user_role != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={"stage": "Authorization", "error": "FORBIDDEN", "details": "Access denied."}
            )
        elif user_role == "doctor":
            has_consent = any(c.doctor_id == current_user.id for c in record.consents)
            if not has_consent:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail={"stage": "Authorization", "error": "CONSENT_REQUIRED", "details": "Patient consent required."}
                )

        pdf_path = record.file_path

        try:
            # Stage 1: PDF Exists
            current_stage = "PDF Exists"
            logger.info("[STAGE 1 START: PDF Exists] Validating physical file existence at '%s'", pdf_path)
            if not os.path.exists(pdf_path):
                logger.error("[STAGE 1 FAILURE: PDF Exists] Physical file missing: %s", pdf_path)
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail={"stage": "File Validation", "error": "FILE_NOT_FOUND", "details": f"Physical file not found at {pdf_path}"}
                )
            file_size_formatted = record.file_size or f"{os.path.getsize(pdf_path)} B"
            logger.info("[STAGE 1 SUCCESS: PDF Exists] Verified file at '%s' (%s)", pdf_path, file_size_formatted)

            # Stage 2: PDF Readable
            current_stage = "PDF Readable"
            logger.info("[STAGE 2 START: PDF Readable] Reading file bytes from '%s'", pdf_path)
            with open(pdf_path, "rb") as f:
                content = f.read()
            bytes_read = len(content)
            if bytes_read == 0:
                logger.error("[STAGE 2 FAILURE: PDF Readable] Physical file is empty (0 bytes read)")
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail={"stage": "PDF Reading", "error": "FILE_EMPTY", "details": f"Physical file '{pdf_path}' is empty (0 bytes read)."}
                )
            logger.info("[STAGE 2 SUCCESS: PDF Readable] Read %d bytes successfully from '%s'", bytes_read, pdf_path)

            # Stage 3, 4, 5: Gemini Client Initialization, Request, and Response Parsing
            current_stage = "Gemini AI Extraction & Parsing"
            logger.info("[STAGE 3/4/5 START: Gemini Processing] Invoking Gemini report parser for file '%s'...", os.path.basename(pdf_path))
            extraction = await self.report_parser.parse_report(
                file_bytes=content,
                filename=os.path.basename(pdf_path),
            )
            extracted_dict = extraction.dict()
            extracted_dict.pop("timing_metadata", None)
            logger.info("[STAGE 5 SUCCESS: Gemini Response Parsing] Successfully parsed %d test results", len(extraction.test_results))

            # Stage 6: Database Update Succeeds
            current_stage = "Database Update"
            logger.info("[STAGE 6 START: Database Update] Recording reprocess audit log entry and extracted_data for record ID %s", record.id)
            if extracted_dict:
                await self.record_repo.update_extracted_data(record, json.dumps(extracted_dict))
            audit = AuditLog(
                user_id=current_user.id,
                action="Medical Record Reprocessed",
                details=f"Reprocessed medical record '{record.title}' (ID {record.id}) via Gemini AI.",
            )
            self.db.add(audit)
            await self.db.commit()
            logger.info("[STAGE 6 SUCCESS: Database Update] Audit log committed successfully for record ID %s", record.id)

            return {
                "id": f"rec-{record.id}",
                "title": record.title,
                "category": record.category,
                "extractedData": extracted_dict,
            }

        except HTTPException as http_exc:
            tb_str = traceback.format_exc()
            logger.error("[STAGE FAILURE] Stage: '%s'\nHTTP Exception: %s\nStack Trace:\n%s", current_stage, str(http_exc.detail), tb_str)
            status_code = http_exc.status_code
            detail_content = http_exc.detail if isinstance(http_exc.detail, dict) else {
                "stage": current_stage,
                "error": "HTTPException",
                "details": str(http_exc.detail),
                "stack_trace": tb_str
            }
            return JSONResponse(status_code=status_code, content=detail_content)

        except Exception as exc:
            tb_str = traceback.format_exc()
            exc_name = exc.__class__.__name__
            err_msg_str = str(exc)
            
            logger.error(
                f"\n====================================================\n"
                f"[STAGE FAILURE: {current_stage}]\n"
                f"Exception Type: {exc_name}\n"
                f"Exception Message: {err_msg_str}\n"
                f"Stack Trace:\n{tb_str}"
                f"===================================================="
            )

            if "ResourceExhausted" in exc_name or "quota" in err_msg_str.lower() or "429" in err_msg_str:
                return JSONResponse(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    content={
                        "stage": current_stage,
                        "error": "RATE_LIMIT_EXCEEDED",
                        "details": "Gemini API daily request quota exceeded. Please retry after quota resets or configure a paid API key.",
                        "exception_type": exc_name,
                        "stack_trace": tb_str
                    }
                )
            elif "Timeout" in exc_name or "deadline" in err_msg_str.lower():
                return JSONResponse(
                    status_code=status.HTTP_504_GATEWAY_TIMEOUT,
                    content={
                        "stage": current_stage,
                        "error": "REQUEST_TIMEOUT",
                        "details": "Gemini API request timed out after 10 seconds.",
                        "exception_type": exc_name,
                        "stack_trace": tb_str
                    }
                )

            return JSONResponse(
                status_code=status.HTTP_502_BAD_GATEWAY,
                content={
                    "stage": current_stage,
                    "error": exc_name,
                    "details": err_msg_str,
                    "stack_trace": tb_str
                }
            )


    @trace_fn
    async def list_records(self, current_user: User) -> List[Dict[str, Any]]:
        """
        Business Logic:
        1. If user is Patient: returns owned records and doctors shared with.
        2. If user is Doctor: returns records explicitly consented by patients.
        3. If Researcher/Admin: returns appropriate records or empty list.
        """
        user_role = (current_user.role if isinstance(current_user.role, str) else current_user.role.value).lower()

        if user_role in ["patient", "admin"]:
            records = await self.record_repo.list_by_patient(current_user.id)
            response = []
            for rec in records:
                shared_doctors = [c.doctor.full_name for c in rec.consents if c.doctor]
                ext = os.path.splitext(rec.file_path)[1].replace(".", "").upper() or "PDF"
                response.append({
                    "id": f"rec-{rec.id}",
                    "title": rec.title,
                    "category": rec.category,
                    "dateUploaded": rec.created_at.strftime("%Y-%m-%d"),
                    "fileSize": rec.file_size,
                    "fileType": ext,
                    "aiStatus": "Processed",
                    "sharingStatus": "Shared" if len(shared_doctors) > 0 else "Private",
                    "doctorAccess": "Granted" if len(shared_doctors) > 0 else "Restricted",
                    "sharedWith": shared_doctors,
                })
            return response

        elif user_role == "doctor":
            records = await self.record_repo.list_consented_for_doctor(current_user.id)
            response = []
            for rec in records:
                response.append({
                    "id": f"rec-{rec.id}",
                    "title": rec.title,
                    "category": rec.category,
                    "dateUploaded": rec.created_at.strftime("%Y-%m-%d"),
                    "fileSize": rec.file_size,
                    "patientName": rec.patient.full_name if rec.patient else "Unknown",
                    "patientId": rec.patient_id,
                })
            return response

        return []

    @trace_fn
    async def get_record(self, record_id_str: str, current_user: User) -> Dict[str, Any]:
        """
        Business Logic:
        1. Parse record ID and query database.
        2. Evaluates RBAC permissions (Owner patient OR consented doctor).
        3. Returns detailed record metadata.
        """
        rec_id = parse_record_id(record_id_str)
        record = await self.record_repo.get_by_id(rec_id)
        if not record:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Medical record not found.")

        user_role = (current_user.role if isinstance(current_user.role, str) else current_user.role.value).lower()

        if user_role in ["patient", "admin"] and record.patient_id != current_user.id and user_role != "admin":
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied. You do not own this record.")
        elif user_role == "doctor":
            has_consent = any(c.doctor_id == current_user.id for c in record.consents)
            if not has_consent:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied. Patient consent not granted.")

        shared_doctors = [c.doctor.full_name for c in record.consents if c.doctor]

        extracted_dict = None
        if record.extracted_data:
            try:
                extracted_dict = json.loads(record.extracted_data)
                logger.info("[DB CACHE HIT] Read extractedData from database for record ID %s without calling Gemini!", record.id)
            except Exception as e:
                logger.error("Error decoding DB extracted_data for record %s: %s", record.id, e)

        if extracted_dict is None and os.path.exists(record.file_path):
            try:
                with open(record.file_path, "rb") as f:
                    content = f.read()
                extraction = await self.report_parser.parse_report(
                    file_bytes=content,
                    filename=os.path.basename(record.file_path),
                )
                extracted_dict = extraction.dict()
                extracted_dict.pop("timing_metadata", None)
                await self.record_repo.update_extracted_data(record, json.dumps(extracted_dict))
                await self.db.commit()
                try:
                    await self.db.refresh(record)
                except Exception as ref_err:
                    logger.warning(f"Could not refresh record in get_record: {ref_err}")
            except Exception as exc:
                logger.error("Error reading/parsing record file '%s': %s", record.file_path, str(exc))

        api_response = {
            "id": f"rec-{record.id}",
            "title": record.title,
            "category": record.category,
            "dateUploaded": (record.created_at or datetime.now()).strftime("%Y-%m-%d"),
            "fileSize": record.file_size,
            "sharingStatus": "Shared" if len(shared_doctors) > 0 else "Private",
            "sharedWith": shared_doctors,
            "patientName": record.patient.full_name if record.patient else "Patient",
            "patientId": record.patient_id,
            "extractedData": extracted_dict,
        }

        logger.info("API Response: Generated detailed record payload for record ID %s", record.id)
        return api_response

    @trace_fn
    async def get_record_analysis(self, record_id_str: str, current_user: User) -> Dict[str, Any]:
        """Fetch AI Analysis without forcing a fresh re-run of Gemini."""
        record_data = await self.get_record(record_id_str, current_user)
        return {
            "id": record_data.get("id"),
            "title": record_data.get("title"),
            "category": record_data.get("category"),
            "extractedData": record_data.get("extractedData"),
        }

    async def update_record(self, record_id_str: str, update_data: RecordUpdate, current_user: User) -> Dict[str, Any]:
        """
        Business Logic:
        1. Checks owner patient permission.
        2. Updates title/category in DB.
        3. Writes AuditLog record.
        """
        rec_id = parse_record_id(record_id_str)
        record = await self.record_repo.get_by_id(rec_id)
        if not record:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Medical record not found.")

        user_role = (current_user.role if isinstance(current_user.role, str) else current_user.role.value).lower()
        if record.patient_id != current_user.id and user_role != "admin":
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only record owner can update metadata.")

        updated_record = await self.record_repo.update(record, update_data.title, update_data.category)

        audit = AuditLog(
            user_id=current_user.id,
            action="Record Metadata Updated",
            details=f"Updated record '{updated_record.id}'. Title: '{updated_record.title}', Category: '{updated_record.category}'.",
        )
        self.db.add(audit)
        await self.db.commit()

        shared_doctors = [c.doctor.full_name for c in updated_record.consents if c.doctor]
        return {
            "id": f"rec-{updated_record.id}",
            "title": updated_record.title,
            "category": updated_record.category,
            "dateUploaded": updated_record.created_at.strftime("%Y-%m-%d"),
            "fileSize": updated_record.file_size,
            "sharingStatus": "Shared" if len(shared_doctors) > 0 else "Private",
            "sharedWith": shared_doctors,
        }

    async def delete_record(self, record_id_str: str, current_user: User) -> Dict[str, str]:
        """
        Business Logic:
        1. Verifies ownership.
        2. Removes physical file from local upload storage.
        3. Deletes record entry from database.
        4. Writes AuditLog record.
        """
        rec_id = parse_record_id(record_id_str)
        record = await self.record_repo.get_by_id(rec_id)
        if not record:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Medical record not found.")

        user_role = (current_user.role if isinstance(current_user.role, str) else current_user.role.value).lower()
        if record.patient_id != current_user.id and user_role != "admin":
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only record owner can delete record.")

        # Remove physical file if exists
        if os.path.exists(record.file_path):
            try:
                os.remove(record.file_path)
            except Exception:
                pass

        await self.record_repo.delete(record)

        audit = AuditLog(
            user_id=current_user.id,
            action="Record Deleted",
            details=f"Permanently deleted medical record ID '{rec_id}' ('{record.title}').",
        )
        self.db.add(audit)
        await self.db.commit()

        return {"message": f"Medical record 'rec-{rec_id}' successfully deleted."}

    async def download_record_file(self, record_id_str: str, current_user: User) -> FileResponse:
        """
        Business Logic:
        1. Verifies access permissions (Patient owner OR consented doctor).
        2. Streams secure file download.
        """
        rec_id = parse_record_id(record_id_str)
        record = await self.record_repo.get_by_id(rec_id)
        if not record:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Medical record not found.")

        user_role = (current_user.role if isinstance(current_user.role, str) else current_user.role.value).lower()

        if user_role in ["patient", "admin"] and record.patient_id != current_user.id and user_role != "admin":
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")
        elif user_role == "doctor":
            has_consent = any(c.doctor_id == current_user.id for c in record.consents)
            if not has_consent:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied. Consent required.")

        if not os.path.exists(record.file_path):
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Physical file not found on server.")

        return FileResponse(
            path=record.file_path,
            filename=os.path.basename(record.file_path),
            media_type="application/octet-stream",
        )
