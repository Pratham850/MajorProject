from __future__ import annotations
from typing import List
from fastapi import APIRouter, Depends, File, Form, status, UploadFile
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import User
from app.repositories.record_repository import RecordRepository
from app.dependencies import get_current_user, require_role
from app.schemas.auth import MessageResponse
from app.schemas.records import RecordResponse, RecordUpdate
from app.services.record_service import RecordService

router = APIRouter(prefix="/medical-records", tags=["Medical Records"])


def get_record_service(db: AsyncSession = Depends(get_db)) -> RecordService:
    record_repo = RecordRepository(db)
    return RecordService(record_repo, db)


@router.post(
    "",
    status_code=status.HTTP_201_CREATED,
    response_model=RecordResponse,
    summary="Create / Upload medical record",
)
@router.post(
    "/upload",
    status_code=status.HTTP_201_CREATED,
    response_model=RecordResponse,
    summary="Upload medical record alias",
)
async def upload_record(
    title: str = Form(...),
    category: str = Form(...),
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    record_service: RecordService = Depends(get_record_service),
):
    return await record_service.upload_record(current_user, title, category, file)


@router.get(
    "",
    response_model=List[dict],
    summary="List medical records",
)
async def list_records(
    current_user: User = Depends(get_current_user),
    record_service: RecordService = Depends(get_record_service),
):
    return await record_service.list_records(current_user)


@router.get(
    "/{id}",
    response_model=dict,
    summary="Get record metadata",
)
async def get_record(
    id: str,
    current_user: User = Depends(get_current_user),
    record_service: RecordService = Depends(get_record_service),
):
    return await record_service.get_record(id, current_user)


@router.put(
    "/{id}",
    response_model=dict,
    summary="Update record metadata",
)
async def update_record(
    id: str,
    update_data: RecordUpdate,
    current_user: User = Depends(get_current_user),
    record_service: RecordService = Depends(get_record_service),
):
    return await record_service.update_record(id, update_data, current_user)


@router.delete(
    "/{id}",
    response_model=MessageResponse,
    summary="Delete medical record",
)
async def delete_record(
    id: str,
    current_user: User = Depends(get_current_user),
    record_service: RecordService = Depends(get_record_service),
):
    return await record_service.delete_record(id, current_user)


@router.get(
    "/{id}/download",
    summary="Download medical record file",
)
async def download_record_file(
    id: str,
    current_user: User = Depends(get_current_user),
    record_service: RecordService = Depends(get_record_service),
):
    return await record_service.download_record_file(id, current_user)


@router.post(
    "/{id}/parse",
    response_model=dict,
    summary="Parse existing medical record via Gemini AI",
)
@router.post(
    "/{id}/reprocess",
    response_model=dict,
    summary="Reprocess medical record via Gemini AI",
)
async def parse_record(
    id: str,
    current_user: User = Depends(get_current_user),
    record_service: RecordService = Depends(get_record_service),
):
    return await record_service.parse_record_by_id(id, current_user)


@router.get(
    "/{id}/analysis",
    response_model=dict,
    summary="Get AI Analysis for medical record",
)
async def get_record_analysis(
    id: str,
    current_user: User = Depends(get_current_user),
    record_service: RecordService = Depends(get_record_service),
):
    return await record_service.get_record_analysis(id, current_user)


