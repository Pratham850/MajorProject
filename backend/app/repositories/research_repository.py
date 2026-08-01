from __future__ import annotations
from typing import List, Optional
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models import CohortQuery


class ResearchRepository:
    """
    Data Access Repository for CohortQuery entities.
    """

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, query_id: int) -> Optional[CohortQuery]:
        """Fetch CohortQuery by ID."""
        result = await self.db.execute(
            select(CohortQuery)
            .filter(CohortQuery.id == query_id)
            .options(selectinload(CohortQuery.researcher))
        )
        return result.scalars().first()

    async def create(
        self,
        researcher_id: int,
        title: str,
        disease_focus: str,
        patient_count: int,
        justification: str,
        status: str = "Pending",
        sandbox_size: Optional[str] = None,
    ) -> CohortQuery:
        """Create and persist a new CohortQuery."""
        query = CohortQuery(
            researcher_id=researcher_id,
            title=title,
            disease_focus=disease_focus,
            patient_count=patient_count,
            justification=justification,
            status=status,
            sandbox_size=sandbox_size,
        )
        self.db.add(query)
        await self.db.flush()
        await self.db.commit()
        await self.db.refresh(query)
        return query

    async def list_by_researcher(self, researcher_id: int, limit: Optional[int] = None) -> List[CohortQuery]:
        """Retrieve queries created by a researcher."""
        q = (
            select(CohortQuery)
            .filter(CohortQuery.researcher_id == researcher_id)
            .order_by(CohortQuery.id.desc())
        )
        if limit:
            q = q.limit(limit)
        result = await self.db.execute(q)
        return list(result.scalars().all())

    async def list_all(self, limit: Optional[int] = None) -> List[CohortQuery]:
        """Retrieve all cohort queries (for admin)."""
        q = (
            select(CohortQuery)
            .options(selectinload(CohortQuery.researcher))
            .order_by(CohortQuery.id.desc())
        )
        if limit:
            q = q.limit(limit)
        result = await self.db.execute(q)
        return list(result.scalars().all())

    async def update_status(self, query: CohortQuery, status: str, sandbox_size: Optional[str] = None) -> CohortQuery:
        """Update approval status and sandbox size."""
        query.status = status
        if sandbox_size:
            query.sandbox_size = sandbox_size
        self.db.add(query)
        await self.db.commit()
        await self.db.refresh(query)
        return query

    async def count_by_researcher(self, researcher_id: int) -> int:
        result = await self.db.execute(
            select(func.count(CohortQuery.id)).where(CohortQuery.researcher_id == researcher_id)
        )
        return result.scalar() or 0

    async def count_by_status(self, researcher_id: Optional[int], status: str) -> int:
        query = select(func.count(CohortQuery.id)).where(CohortQuery.status == status)
        if researcher_id is not None:
            query = query.where(CohortQuery.researcher_id == researcher_id)
        result = await self.db.execute(query)
        return result.scalar() or 0
