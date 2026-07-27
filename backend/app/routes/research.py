from __future__ import annotations
from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import User, UserRole
from app.repositories.research_repository import ResearchRepository
from app.routes.dependencies import get_current_user, RoleChecker
from app.schemas.research import AnonymizedCohortResults, CohortQueryApproval, CohortQueryCreate, CohortQueryResponse
from app.services.research_service import ResearchService

router = APIRouter()


def get_research_service(db: AsyncSession = Depends(get_db)) -> ResearchService:
    """Dependency injection helper for ResearchService."""
    research_repo = ResearchRepository(db)
    return ResearchService(research_repo, db)


# ----------------------------------------------------------------------
# 1. Submit Cohort Research Query (POST /research/cohort-query)
# ----------------------------------------------------------------------
@router.post(
    "/cohort-query",
    status_code=status.HTTP_201_CREATED,
    response_model=dict,
    summary="Submit cohort query",
    description="Allows a Researcher to request access to a de-identified patient cohort for clinical research.",
)
async def submit_cohort_query(
    data: CohortQueryCreate,
    current_user: User = Depends(RoleChecker([UserRole.RESEARCHER])),
    research_service: ResearchService = Depends(get_research_service),
):
    """
    Researcher submits cohort query.
    """
    return await research_service.submit_cohort_query(current_user, data)


# ----------------------------------------------------------------------
# 2. List Cohort Queries (GET /research/queries)
# ----------------------------------------------------------------------
@router.get(
    "/queries",
    response_model=List[dict],
    summary="List cohort research queries",
    description="Retrieves list of cohort queries for researcher or admin review.",
)
async def list_cohort_queries(
    current_user: User = Depends(get_current_user),
    research_service: ResearchService = Depends(get_research_service),
):
    """
    Lists cohort queries based on user role.
    """
    return await research_service.list_cohort_queries(current_user)


# ----------------------------------------------------------------------
# 3. Admin Approval (PUT /research/queries/{query_id}/approve)
# ----------------------------------------------------------------------
@router.put(
    "/queries/{query_id}/approve",
    response_model=dict,
    summary="Admin approve or reject cohort query",
    description="Allows Admin to approve or reject a large cohort research query.",
)
async def approve_cohort_query_admin(
    query_id: str,
    approval_data: CohortQueryApproval,
    current_user: User = Depends(RoleChecker([UserRole.ADMIN])),
    research_service: ResearchService = Depends(get_research_service),
):
    """
    Admin approves or rejects cohort query.
    """
    return await research_service.approve_cohort_query_admin(query_id, approval_data, current_user)


# ----------------------------------------------------------------------
# 4. Generate Anonymized Results (GET /research/queries/{query_id}/results)
# ----------------------------------------------------------------------
@router.get(
    "/queries/{query_id}/results",
    response_model=dict,
    summary="Generate anonymized cohort results",
    description="Generates Safe-Harbor k-anonymity (k=5) de-identified research dataset summary for an approved query.",
)
async def generate_anonymized_results(
    query_id: str,
    current_user: User = Depends(get_current_user),
    research_service: ResearchService = Depends(get_research_service),
):
    """
    Generates anonymized dataset results for approved cohort query.
    """
    return await research_service.generate_anonymized_results(query_id, current_user)
