from __future__ import annotations
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import User, UserRole
from app.routes.dependencies import get_current_user, RoleChecker
from app.schemas.dashboard import (
    AdminDashboardResponse,
    DoctorDashboardResponse,
    PatientDashboardResponse,
    ResearcherDashboardResponse,
)
from app.services.dashboard_service import DashboardService

router = APIRouter()


def get_dashboard_service(db: AsyncSession = Depends(get_db)) -> DashboardService:
    """Dependency injection helper for DashboardService."""
    return DashboardService(db)


# ----------------------------------------------------------------------
# 1. Patient Dashboard (GET /dashboard/patient)
# ----------------------------------------------------------------------
@router.get(
    "/patient",
    response_model=PatientDashboardResponse,
    summary="Patient dashboard metrics",
    description="Retrieves aggregated file counts, active consents, and pending requests for Patients.",
)
async def get_patient_dashboard(
    current_user: User = Depends(RoleChecker([UserRole.PATIENT])),
    dash_service: DashboardService = Depends(get_dashboard_service),
):
    """
    Patient dashboard metrics.
    """
    return await dash_service.get_patient_dashboard(current_user)


# ----------------------------------------------------------------------
# 2. Doctor Dashboard (GET /dashboard/doctor)
# ----------------------------------------------------------------------
@router.get(
    "/doctor",
    response_model=DoctorDashboardResponse,
    summary="Doctor dashboard metrics",
    description="Retrieves active patient metrics and shared record statistics for Doctors.",
)
async def get_doctor_dashboard(
    current_user: User = Depends(RoleChecker([UserRole.DOCTOR])),
    dash_service: DashboardService = Depends(get_dashboard_service),
):
    """
    Doctor dashboard metrics.
    """
    return await dash_service.get_doctor_dashboard(current_user)


# ----------------------------------------------------------------------
# 3. Researcher Dashboard (GET /dashboard/researcher)
# ----------------------------------------------------------------------
@router.get(
    "/researcher",
    response_model=ResearcherDashboardResponse,
    summary="Researcher dashboard metrics",
    description="Retrieves unlocked research dataset counts and cohort metrics for Researchers.",
)
async def get_researcher_dashboard(
    current_user: User = Depends(RoleChecker([UserRole.RESEARCHER])),
    dash_service: DashboardService = Depends(get_dashboard_service),
):
    """
    Researcher dashboard metrics.
    """
    return await dash_service.get_researcher_dashboard(current_user)


# ----------------------------------------------------------------------
# 4. Admin Dashboard (GET /dashboard/admin)
# ----------------------------------------------------------------------
@router.get(
    "/admin",
    response_model=AdminDashboardResponse,
    summary="Admin dashboard metrics",
    description="Retrieves system-wide users count, total records, consents, and audit metrics for Admins.",
)
async def get_admin_dashboard(
    current_user: User = Depends(RoleChecker([UserRole.ADMIN])),
    dash_service: DashboardService = Depends(get_dashboard_service),
):
    """
    Admin dashboard metrics.
    """
    return await dash_service.get_admin_dashboard(current_user)


# ----------------------------------------------------------------------
# 5. Role-Adaptive Stats Endpoint (GET /dashboard/stats)
# ----------------------------------------------------------------------
@router.get(
    "/stats",
    summary="Dynamic role-based dashboard stats",
    description="Dynamically evaluates user role and returns appropriate dashboard metrics.",
)
async def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    dash_service: DashboardService = Depends(get_dashboard_service),
):
    """
    Dynamic stats for frontend dashboard routing.
    """
    return await dash_service.get_stats_by_role(current_user)
