from __future__ import annotations
from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import User, UserRole
from app.repositories.access_request_repository import AccessRequestRepository
from app.repositories.consent_repository import ConsentRepository
from app.repositories.record_repository import RecordRepository
from app.repositories.user_repository import UserRepository
from app.dependencies import get_current_user, require_role
from app.schemas.access_requests import AccessRequestResponse, CreateAccessRequest, UpdateAccessRequestStatus
from app.services.access_request_service import AccessRequestService

router = APIRouter(prefix="/access-requests", tags=["Access Requests"])


def get_access_req_service(db: AsyncSession = Depends(get_db)) -> AccessRequestService:
    access_req_repo = AccessRequestRepository(db)
    user_repo = UserRepository(db)
    record_repo = RecordRepository(db)
    consent_repo = ConsentRepository(db)
    return AccessRequestService(access_req_repo, user_repo, record_repo, consent_repo, db)


@router.post("", status_code=status.HTTP_201_CREATED, response_model=dict)
async def create_access_request(
    req_data: CreateAccessRequest,
    current_user: User = Depends(require_role([UserRole.DOCTOR])),
    access_req_service: AccessRequestService = Depends(get_access_req_service),
):
    return await access_req_service.create_request(current_user, req_data)


@router.get("", response_model=List[dict], status_code=status.HTTP_200_OK)
async def list_access_requests(
    current_user: User = Depends(get_current_user),
    access_req_service: AccessRequestService = Depends(get_access_req_service),
):
    return await access_req_service.list_requests(current_user)


@router.put("/{id}", response_model=dict, status_code=status.HTTP_200_OK)
@router.put("/{id}/status", response_model=dict, status_code=status.HTTP_200_OK)
async def update_request_status(
    id: str,
    status_data: UpdateAccessRequestStatus,
    current_user: User = Depends(require_role([UserRole.PATIENT, UserRole.ADMIN])),
    access_req_service: AccessRequestService = Depends(get_access_req_service),
):
    return await access_req_service.update_request_status(id, status_data, current_user)
