from __future__ import annotations
from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import AuditLog


class AuditRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def log_action(self, user_id: int, action: str, details: str) -> AuditLog:
        audit = AuditLog(user_id=user_id, action=action, details=details)
        self.session.add(audit)
        await self.session.commit()
        await self.session.refresh(audit)
        return audit

    async def list_logs(self, user_id: Optional[int] = None, limit: int = 100) -> List[AuditLog]:
        query = select(AuditLog).order_by(AuditLog.timestamp.desc()).limit(limit)
        if user_id is not None:
            query = query.where(AuditLog.user_id == user_id)
        result = await self.session.execute(query)
        return list(result.scalars().all())
