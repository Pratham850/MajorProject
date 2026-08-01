from __future__ import annotations
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import User, UserRole
from app.dependencies import get_current_user, require_role
from app.services.dashboard_service import DashboardService

router = APIRouter(prefix="/dashboard", tags=["Dashboards"])


def get_dashboard_service(db: AsyncSession = Depends(get_db)) -> DashboardService:
    return DashboardService(db)


@router.get("/patient", status_code=status.HTTP_200_OK)
async def get_patient_dashboard(
    current_user: User = Depends(require_role([UserRole.PATIENT])),
    dash_service: DashboardService = Depends(get_dashboard_service),
):
    return await dash_service.get_patient_dashboard(current_user)


@router.get("/doctor", status_code=status.HTTP_200_OK)
async def get_doctor_dashboard(
    current_user: User = Depends(require_role([UserRole.DOCTOR])),
    dash_service: DashboardService = Depends(get_dashboard_service),
):
    return await dash_service.get_doctor_dashboard(current_user)


@router.get("/researcher", status_code=status.HTTP_200_OK)
async def get_researcher_dashboard(
    current_user: User = Depends(require_role([UserRole.RESEARCHER])),
    dash_service: DashboardService = Depends(get_dashboard_service),
):
    return await dash_service.get_researcher_dashboard(current_user)


@router.get("/admin", status_code=status.HTTP_200_OK)
async def get_admin_dashboard(
    current_user: User = Depends(require_role([UserRole.ADMIN])),
    dash_service: DashboardService = Depends(get_dashboard_service),
):
    return await dash_service.get_admin_dashboard(current_user)


@router.get("/stats", status_code=status.HTTP_200_OK)
async def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    dash_service: DashboardService = Depends(get_dashboard_service),
):
    return await dash_service.get_stats_by_role(current_user)
