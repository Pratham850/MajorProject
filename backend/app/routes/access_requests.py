from __future__ import annotations
from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import User
from app.repositories.access_request_repository import AccessRequestRepository
from app.repositories.consent_repository import ConsentRepository
from app.repositories.record_repository import RecordRepository
from app.repositories.user_repository import UserRepository
from app.routes.dependencies import get_current_user, RoleChecker
from app.schemas.access_requests import AccessRequestResponse, CreateAccessRequest, UpdateAccessRequestStatus
from app.services.access_request_service import AccessRequestService

router = APIRouter()


def get_access_req_service(db: AsyncSession = Depends(get_db)) -> AccessRequestService:
    """Dependency injection helper for AccessRequestService."""
    access_req_repo = AccessRequestRepository(db)
    user_repo = UserRepository(db)
    record_repo = RecordRepository(db)
    consent_repo = ConsentRepository(db)
    return AccessRequestService(access_req_repo, user_repo, record_repo, consent_repo, db)


# ----------------------------------------------------------------------
# 1. Doctor Submits Access Request (POST /access-requests)
# ----------------------------------------------------------------------
@router.post(
    "",
    status_code=status.HTTP_201_CREATED,
    response_model=dict,
    summary="Doctor requests patient record access",
    description="Allows a Doctor to request medical record viewing permission from a Patient.",
)
async def create_access_request(
    req_data: CreateAccessRequest,
    current_user: User = Depends(RoleChecker(["doctor"])),
    access_req_service: AccessRequestService = Depends(get_access_req_service),
):
    """
    Doctor submits access request.
    """
    return await access_req_service.create_request(current_user, req_data)


# ----------------------------------------------------------------------
# 2. List Access Requests (GET /access-requests)
# ----------------------------------------------------------------------
@router.get(
    "",
    response_model=List[dict],
    summary="List access requests",
    description="Retrieves incoming requests for Patient or outgoing requests for Doctor.",
)
async def list_access_requests(
    current_user: User = Depends(get_current_user),
    access_req_service: AccessRequestService = Depends(get_access_req_service),
):
    """
    Lists access requests based on user role.
    """
    return await access_req_service.list_requests(current_user)


# ----------------------------------------------------------------------
# 3. Patient Approves or Rejects Request (PUT /access-requests/{request_id}/status)
# ----------------------------------------------------------------------
@router.put(
    "/{request_id}/status",
    response_model=dict,
    summary="Patient approves or rejects request",
    description="Allows a Patient to approve or reject a Doctor's access request.",
)
async def update_request_status(
    request_id: str,
    status_data: UpdateAccessRequestStatus,
    current_user: User = Depends(RoleChecker(["patient"])),
    access_req_service: AccessRequestService = Depends(get_access_req_service),
):
    """
    Patient updates access request status.
    """
    return await access_req_service.update_request_status(request_id, status_data, current_user)
