from __future__ import annotations
from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import User
from app.repositories.consent_repository import ConsentRepository
from app.repositories.record_repository import RecordRepository
from app.repositories.user_repository import UserRepository
from app.routes.dependencies import get_current_user, RoleChecker
from app.schemas.auth import MessageResponse
from app.schemas.consents import ConsentResponse, GrantConsentRequest, RevokeConsentRequest
from app.services.consent_service import ConsentService

router = APIRouter()


def get_consent_service(db: AsyncSession = Depends(get_db)) -> ConsentService:
    """Dependency injection helper for ConsentService."""
    consent_repo = ConsentRepository(db)
    record_repo = RecordRepository(db)
    user_repo = UserRepository(db)
    return ConsentService(consent_repo, record_repo, user_repo, db)


# ----------------------------------------------------------------------
# 1. Grant Consent (POST /consents/grant)
# ----------------------------------------------------------------------
@router.post(
    "/grant",
    response_model=ConsentResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Grant consent to doctor",
    description="Allows a patient to grant explicit record viewing access to a doctor.",
)
async def grant_consent(
    req: GrantConsentRequest,
    current_user: User = Depends(RoleChecker(["patient"])),
    consent_service: ConsentService = Depends(get_consent_service),
):
    """
    Patient grants doctor record access.
    """
    return await consent_service.grant_consent(current_user, req)


# ----------------------------------------------------------------------
# 2. Revoke Consent (POST /consents/revoke)
# ----------------------------------------------------------------------
@router.post(
    "/revoke",
    response_model=MessageResponse,
    summary="Revoke consent from doctor",
    description="Allows a patient to revoke a doctor's access to a medical record.",
)
async def revoke_consent(
    req: RevokeConsentRequest,
    current_user: User = Depends(RoleChecker(["patient"])),
    consent_service: ConsentService = Depends(get_consent_service),
):
    """
    Patient revokes doctor record access.
    """
    return await consent_service.revoke_consent(current_user, req)


# ----------------------------------------------------------------------
# 3. List Active Consents (GET /consents)
# ----------------------------------------------------------------------
@router.get(
    "",
    response_model=List[dict],
    summary="List active consents",
    description="Lists active consents granted by patient or received by doctor.",
)
async def list_active_consents(
    current_user: User = Depends(get_current_user),
    consent_service: ConsentService = Depends(get_consent_service),
):
    """
    Lists active consent permissions.
    """
    return await consent_service.list_active_consents(current_user)
