from __future__ import annotations
from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import User, UserRole
from app.repositories.research_repository import ResearchRepository
from app.dependencies import get_current_user, require_role
from app.schemas.research import AnonymizedCohortResults, CohortQueryApproval, CohortQueryCreate, CohortQueryResponse
from app.services.research_service import ResearchService

router = APIRouter(tags=["Research"])


def get_research_service(db: AsyncSession = Depends(get_db)) -> ResearchService:
    research_repo = ResearchRepository(db)
    return ResearchService(research_repo, db)


@router.post("/cohort-queries", status_code=status.HTTP_201_CREATED, response_model=dict)
@router.post("/research/cohort-query", status_code=status.HTTP_201_CREATED, response_model=dict)
async def submit_cohort_query(
    data: CohortQueryCreate,
    current_user: User = Depends(require_role([UserRole.RESEARCHER])),
    research_service: ResearchService = Depends(get_research_service),
):
    return await research_service.submit_cohort_query(current_user, data)


@router.get("/cohort-queries", response_model=List[dict], status_code=status.HTTP_200_OK)
@router.get("/research/queries", response_model=List[dict], status_code=status.HTTP_200_OK)
async def list_cohort_queries(
    current_user: User = Depends(get_current_user),
    research_service: ResearchService = Depends(get_research_service),
):
    return await research_service.list_cohort_queries(current_user)


@router.put("/research/queries/{query_id}/approve", response_model=dict, status_code=status.HTTP_200_OK)
async def approve_cohort_query_admin(
    query_id: str,
    approval_data: CohortQueryApproval,
    current_user: User = Depends(require_role([UserRole.ADMIN])),
    research_service: ResearchService = Depends(get_research_service),
):
    return await research_service.approve_cohort_query_admin(query_id, approval_data, current_user)


@router.get("/research/queries/{query_id}/results", response_model=dict, status_code=status.HTTP_200_OK)
async def generate_anonymized_results(
    query_id: str,
    current_user: User = Depends(get_current_user),
    research_service: ResearchService = Depends(get_research_service),
):
    return await research_service.generate_anonymized_results(query_id, current_user)
