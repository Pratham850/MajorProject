from __future__ import annotations
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import require_role
from app.models import User, UserRole
from app.schemas.patient_dashboard import PatientDashboardResponse
from app.services.patient_dashboard_service import PatientDashboardService

router = APIRouter(tags=["Patient Dashboard"])


@router.get("/api/patient/dashboard", response_model=PatientDashboardResponse, status_code=status.HTTP_200_OK)
@router.get("/dashboard/patient", response_model=PatientDashboardResponse, status_code=status.HTTP_200_OK)
async def get_patient_dashboard(
    current_user: User = Depends(require_role([UserRole.PATIENT])),
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieve aggregated Patient Dashboard statistics, profile info, summary counts,
    recent medical records, upcoming appointments, and recent notifications.
    Identifies logged-in patient via JWT token.
    """
    service = PatientDashboardService(db)
    return await service.get_patient_dashboard(current_user.id)
