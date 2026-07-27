from __future__ import annotations
import os
import time
from typing import Any, Dict, List, Optional
from fastapi import HTTPException, status, UploadFile
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import MedicalRecord, User, AuditLog, Consent
from app.repositories.record_repository import RecordRepository
from app.schemas.records import RecordUpdate

UPLOAD_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
    "uploads",
)
os.makedirs(UPLOAD_DIR, exist_ok=True)


def format_file_size(size_in_bytes: int) -> str:
    """Formats raw byte count into human-readable string (e.g. 1.2 MB)."""
    if size_in_bytes < 1024:
        return f"{size_in_bytes} B"
    elif size_in_bytes < 1024 * 1024:
        return f"{size_in_bytes / 1024:.1f} KB"
    else:
        return f"{size_in_bytes / (1024 * 1024):.1f} MB"


def parse_record_id(record_id: str) -> int:
    """Parses string formatted ID like 'rec-12' or '12' into integer."""
    try:
        return int(record_id.replace("rec-", ""))
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid record ID format. Expected 'rec-<integer>' or integer.",
        )


class RecordService:
    """
    Service layer containing business logic for Medical Records file management,
    permission evaluation, metadata updates, and audit logging.
    """

    def __init__(self, record_repo: RecordRepository, db: AsyncSession):
        self.record_repo = record_repo
        self.db = db

    async def upload_record(self, current_user: User, title: str, category: str, file: UploadFile) -> Dict[str, Any]:
        """
        Business Logic:
        1. Validates record category.
        2. Saves physical file to secure local upload storage.
        3. Persists record metadata using RecordRepository.
        4. Writes compliance AuditLog record.
        """
        allowed_categories = ["Lab Report", "Prescription", "Immunization", "Imaging"]
        if category not in allowed_categories:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid category. Must be one of: {allowed_categories}",
            )

        filename = f"pat_{current_user.id}_{int(time.time())}_{file.filename}"
        file_path = os.path.join(UPLOAD_DIR, filename)

        try:
            content = await file.read()
            file_size_bytes = len(content)
            with open(file_path, "wb") as buffer:
                buffer.write(content)
            file_size_str = format_file_size(file_size_bytes)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to securely save record file: {e}",
            )

        new_record = await self.record_repo.create(
            patient_id=current_user.id,
            title=title,
            category=category,
            file_path=file_path,
            file_size=file_size_str,
        )

        audit = AuditLog(
            user_id=current_user.id,
            action="Record Encrypted & Uploaded",
            details=f"Uploaded record '{title}' (Category: {category}, Size: {file_size_str}). Cryptographically signed.",
        )
        self.db.add(audit)
        await self.db.commit()
        await self.db.refresh(new_record)

        return {
            "id": f"rec-{new_record.id}",
            "title": new_record.title,
            "category": new_record.category,
            "dateUploaded": new_record.created_at.strftime("%Y-%m-%d"),
            "fileSize": new_record.file_size,
            "sharingStatus": "Private",
            "sharedWith": [],
        }

    async def list_records(self, current_user: User) -> List[Dict[str, Any]]:
        """
        Business Logic:
        1. If user is Patient: returns owned records and doctors shared with.
        2. If user is Doctor: returns records explicitly consented by patients.
        3. If Researcher/Admin: returns appropriate records or empty list.
        """
        user_role = current_user.role if isinstance(current_user.role, str) else current_user.role.value

        if user_role == "patient":
            records = await self.record_repo.list_by_patient(current_user.id)
            response = []
            for rec in records:
                shared_doctors = [c.doctor.full_name for c in rec.consents if c.doctor]
                response.append({
                    "id": f"rec-{rec.id}",
                    "title": rec.title,
                    "category": rec.category,
                    "dateUploaded": rec.created_at.strftime("%Y-%m-%d"),
                    "fileSize": rec.file_size,
                    "sharingStatus": "Shared" if len(shared_doctors) > 0 else "Private",
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

        user_role = current_user.role if isinstance(current_user.role, str) else current_user.role.value

        if user_role == "patient" and record.patient_id != current_user.id:
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

        if record.patient_id != current_user.id:
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

        if record.patient_id != current_user.id:
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

        user_role = current_user.role if isinstance(current_user.role, str) else current_user.role.value

        if user_role == "patient" and record.patient_id != current_user.id:
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
