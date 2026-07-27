from __future__ import annotations
from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models import AccessRequest, MedicalRecord, User


class AccessRequestRepository:
    """
    Data Access Repository for AccessRequest entities.
    """

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, request_id: int) -> Optional[AccessRequest]:
        """Fetch AccessRequest by primary key ID with relationships loaded."""
        result = await self.db.execute(
            select(AccessRequest)
            .filter(AccessRequest.id == request_id)
            .options(
                selectinload(AccessRequest.requester),
                selectinload(AccessRequest.patient),
                selectinload(AccessRequest.record),
            )
        )
        return result.scalars().first()

    async def create(
        self,
        requester_id: int,
        patient_id: int,
        reason: str,
        record_id: Optional[int] = None,
        status: str = "Pending",
    ) -> AccessRequest:
        """Create and persist a new AccessRequest."""
        new_req = AccessRequest(
            requester_id=requester_id,
            patient_id=patient_id,
            record_id=record_id,
            reason=reason,
            status=status,
        )
        self.db.add(new_req)
        await self.db.flush()
        return new_req

    async def list_by_patient(self, patient_id: int) -> List[AccessRequest]:
        """Retrieve access requests targeted to a specific patient."""
        result = await self.db.execute(
            select(AccessRequest)
            .filter(AccessRequest.patient_id == patient_id)
            .options(
                selectinload(AccessRequest.requester),
                selectinload(AccessRequest.record),
            )
            .order_by(AccessRequest.id.desc())
        )
        return list(result.scalars().all())

    async def list_by_doctor(self, doctor_id: int) -> List[AccessRequest]:
        """Retrieve access requests submitted by a doctor."""
        result = await self.db.execute(
            select(AccessRequest)
            .filter(AccessRequest.requester_id == doctor_id)
            .options(
                selectinload(AccessRequest.patient),
                selectinload(AccessRequest.record),
            )
            .order_by(AccessRequest.id.desc())
        )
        return list(result.scalars().all())

    async def update_status(self, access_req: AccessRequest, status: str) -> AccessRequest:
        """Update request status ('Approved' or 'Rejected')."""
        access_req.status = status
        self.db.add(access_req)
        return access_req
