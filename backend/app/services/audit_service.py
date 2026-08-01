from __future__ import annotations
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.audit_repository import AuditRepository
from app.models import AuditLog


class AuditService:
    def __init__(self, db: AsyncSession):
        self.audit_repo = AuditRepository(db)

    async def get_audit_logs(self, user_id: Optional[int] = None, limit: int = 100) -> List[dict]:
        logs = await self.audit_repo.list_logs(user_id=user_id, limit=limit)
        return [
            {
                "id": log.id,
                "user_id": log.user_id,
                "action": log.action,
                "details": log.details,
                "timestamp": log.timestamp.isoformat()
            }
            for log in logs
        ]
