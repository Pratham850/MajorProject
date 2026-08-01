from __future__ import annotations
from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import User, UserRole
from app.repositories.consent_repository import ConsentRepository
from app.repositories.record_repository import RecordRepository
from app.repositories.user_repository import UserRepository
from app.dependencies import get_current_user, require_role
from app.schemas.consents import ConsentResponse, GrantConsentRequest
from app.services.consent_service import ConsentService

router = APIRouter(prefix="/consents", tags=["Consents"])


def get_consent_service(db: AsyncSession = Depends(get_db)) -> ConsentService:
    consent_repo = ConsentRepository(db)
    record_repo = RecordRepository(db)
    user_repo = UserRepository(db)
    return ConsentService(consent_repo, record_repo, user_repo, db)


@router.post("", response_model=ConsentResponse, status_code=status.HTTP_201_CREATED)
@router.post("/grant", response_model=ConsentResponse, status_code=status.HTTP_201_CREATED)
async def create_consent(
    req: GrantConsentRequest,
    current_user: User = Depends(require_role([UserRole.PATIENT])),
    consent_service: ConsentService = Depends(get_consent_service),
):
    return await consent_service.grant_consent(current_user, req)


@router.get("", response_model=List[dict], status_code=status.HTTP_200_OK)
async def list_consents(
    current_user: User = Depends(get_current_user),
    consent_service: ConsentService = Depends(get_consent_service),
):
    return await consent_service.list_active_consents(current_user)


@router.put("/{id}", response_model=ConsentResponse, status_code=status.HTTP_200_OK)
async def update_consent_status(
    id: int,
    status_val: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    repo = ConsentRepository(db)
    updated = await repo.update_status(consent_id=id, status=status_val)
    return ConsentResponse(
        id=str(updated.id),
        recordId=str(updated.record_id),
        recordTitle=updated.record.title if updated.record else "",
        doctorName=updated.doctor.full_name if updated.doctor else "",
        doctorEmail=updated.doctor.email if updated.doctor else "",
        status=updated.status,
        purpose=updated.purpose,
        approved_at=updated.approved_at,
        expires_at=updated.expires_at
    )
