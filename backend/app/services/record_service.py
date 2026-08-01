from __future__ import annotations
import os
import uuid
import logging
from typing import Any, Dict, List
from fastapi import HTTPException, status, UploadFile
from fastapi.responses import FileResponse
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
        logger.info("Upload Started: Patient ID %s uploading file '%s' under category '%s'", current_user.id, file.filename, category)

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

        # Read file content & validate size
        content = await file.read()
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

        # Storage directory setup
        upload_dir = settings.UPLOAD_DIR
        os.makedirs(upload_dir, exist_ok=True)

        unique_filename = f"{uuid.uuid4().hex}{file_ext}"
        relative_path = os.path.join(upload_dir, unique_filename)

        with open(relative_path, "wb") as f:
            f.write(content)
        logger.info("File Saved: Uploaded file stored at '%s' (%s)", relative_path, file_size_formatted)

        # Database Insertion
        new_record = await self.record_repo.create(
            patient_id=current_user.id,
            title=title,
            category=category,
            file_path=relative_path,
            file_size=file_size_formatted,
        )

        audit = AuditLog(
            user_id=current_user.id,
            action="Medical Record Uploaded",
            details=f"Uploaded record '{title}' ({category}, {file_size_formatted}).",
        )
        self.db.add(audit)
        await self.db.commit()
        logger.info("Database Inserted: Persisted MedicalRecord ID %s for patient ID %s", new_record.id, current_user.id)

        # Trigger Gemini 2.5 Flash Extraction (After successful upload & DB commit)
        ai_status = "Completed"
        extracted_dict = None
        logger.info("Gemini Started: Initiating Gemini 2.5 Flash analysis for MedicalRecord ID %s", new_record.id)

        try:
            extraction = await self.report_parser.parse_report(
                file_bytes=content,
                filename=filename,
                content_type=file.content_type,
            )
            if extraction and extraction.test_results:
                extracted_dict = extraction.dict()
                ai_status = "Completed"
                logger.info("Gemini Finished: Extracted %d test results for MedicalRecord ID %s", len(extraction.test_results), new_record.id)
            else:
                ai_status = "Processing Failed"
                logger.warning("Gemini Finished: No structured test results extracted for MedicalRecord ID %s", new_record.id)
        except Exception as exc:
            ai_status = "Processing Failed"
            logger.error("Gemini Finished: Extraction failed for MedicalRecord ID %s: %s", new_record.id, str(exc))

        logger.info("Dashboard Updated: Patient ID %s dashboard state synchronized for MedicalRecord ID %s", current_user.id, new_record.id)

        return {
            "id": f"rec-{new_record.id}",
            "title": new_record.title,
            "category": new_record.category,
            "dateUploaded": new_record.created_at.strftime("%Y-%m-%d"),
            "fileSize": new_record.file_size,
            "fileType": file_ext.replace(".", "").upper() or "PDF",
            "aiStatus": ai_status,
            "sharingStatus": "Private",
            "doctorAccess": "Restricted",
            "sharedWith": [],
            "extractedData": extracted_dict,
        }

    async def parse_record_by_id(self, record_id_str: str, current_user: User) -> Dict[str, Any]:
        """Parse an existing stored medical record on demand using Gemini API."""
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

        with open(record.file_path, "rb") as f:
            content = f.read()

        extraction = await self.report_parser.parse_report(
            file_bytes=content,
            filename=os.path.basename(record.file_path),
        )

        return {
            "id": f"rec-{record.id}",
            "title": record.title,
            "category": record.category,
            "extractedData": extraction.dict(),
        }


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
        return {
            "id": f"rec-{record.id}",
            "title": record.title,
            "category": record.category,
            "dateUploaded": record.created_at.strftime("%Y-%m-%d"),
            "fileSize": record.file_size,
            "sharingStatus": "Shared" if len(shared_doctors) > 0 else "Private",
            "sharedWith": shared_doctors,
            "patientName": record.patient.full_name if record.patient else "Patient",
            "patientId": record.patient_id,
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
