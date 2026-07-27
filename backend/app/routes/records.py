from __future__ import annotations
from typing import List
from fastapi import APIRouter, Depends, File, Form, status, UploadFile
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import User
from app.repositories.record_repository import RecordRepository
from app.routes.dependencies import get_current_user, RoleChecker
from app.schemas.auth import MessageResponse
from app.schemas.records import RecordResponse, RecordUpdate
from app.services.record_service import RecordService

router = APIRouter()


def get_record_service(db: AsyncSession = Depends(get_db)) -> RecordService:
    """Dependency injection helper for RecordService."""
    record_repo = RecordRepository(db)
    return RecordService(record_repo, db)


# ----------------------------------------------------------------------
# 1. Upload Medical Record
# ----------------------------------------------------------------------
@router.post(
    "/upload",
    status_code=status.HTTP_201_CREATED,
    response_model=RecordResponse,
    summary="Upload medical record",
    description="Allows patients to securely upload a medical record file and save metadata.",
)
async def upload_record(
    title: str = Form(...),
    category: str = Form(...),
    file: UploadFile = File(...),
    current_user: User = Depends(RoleChecker(["patient"])),
    record_service: RecordService = Depends(get_record_service),
):
    """
    Patient endpoint to upload medical files.
    """
    return await record_service.upload_record(current_user, title, category, file)


# ----------------------------------------------------------------------
# 2. List Medical Records
# ----------------------------------------------------------------------
@router.get(
    "",
    response_model=List[dict],
    summary="List medical records",
    description="Retrieves list of medical records owned by patient or consented to doctor.",
)
async def list_records(
    current_user: User = Depends(get_current_user),
    record_service: RecordService = Depends(get_record_service),
):
    """
    Lists medical records based on user role.
    """
    return await record_service.list_records(current_user)


# ----------------------------------------------------------------------
# 3. Get Record Metadata
# ----------------------------------------------------------------------
@router.get(
    "/{record_id}",
    response_model=dict,
    summary="Get record metadata",
    description="Retrieves metadata for a specific medical record.",
)
async def get_record(
    record_id: str,
    current_user: User = Depends(get_current_user),
    record_service: RecordService = Depends(get_record_service),
):
    """
    Retrieves record details by record ID.
    """
    return await record_service.get_record(record_id, current_user)


# ----------------------------------------------------------------------
# 4. Update Record Metadata
# ----------------------------------------------------------------------
@router.put(
    "/{record_id}",
    response_model=dict,
    summary="Update record metadata",
    description="Allows patient owner to update title or category of a record.",
)
async def update_record(
    record_id: str,
    update_data: RecordUpdate,
    current_user: User = Depends(RoleChecker(["patient"])),
    record_service: RecordService = Depends(get_record_service),
):
    """
    Updates medical record title or category.
    """
    return await record_service.update_record(record_id, update_data, current_user)


# ----------------------------------------------------------------------
# 5. Delete Medical Record
# ----------------------------------------------------------------------
@router.delete(
    "/{record_id}",
    response_model=MessageResponse,
    summary="Delete medical record",
    description="Deletes medical record metadata and physical file.",
)
async def delete_record(
    record_id: str,
    current_user: User = Depends(RoleChecker(["patient"])),
    record_service: RecordService = Depends(get_record_service),
):
    """
    Deletes medical record owned by patient.
    """
    return await record_service.delete_record(record_id, current_user)


# ----------------------------------------------------------------------
# 6. Download Record File
# ----------------------------------------------------------------------
@router.get(
    "/{record_id}/download",
    summary="Download medical record file",
    description="Securely downloads physical medical record file if authorized.",
)
async def download_record_file(
    record_id: str,
    current_user: User = Depends(get_current_user),
    record_service: RecordService = Depends(get_record_service),
):
    """
    Streams file download for authorized user.
    """
    return await record_service.download_record_file(record_id, current_user)
