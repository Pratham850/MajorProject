from __future__ import annotations
from typing import List
from fastapi import APIRouter, Depends, status
from pydantic import BaseModel, ConfigDict
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import AuditLog, User, UserRole
from app.routes.dependencies import RoleChecker

router = APIRouter()


class AuditLogResponse(BaseModel):
    id: int
    user_id: int
    action: str
    details: str
    timestamp: str

    model_config = ConfigDict(from_attributes=True)


# ----------------------------------------------------------------------
# Admin List Audit Logs (GET /audit-logs)
# ----------------------------------------------------------------------
@router.get(
    "",
    response_model=List[dict],
    summary="List system audit logs (Admin only)",
    description="Retrieves security and compliance audit logs for platform activities.",
)
async def list_audit_logs(
    current_user: User = Depends(RoleChecker([UserRole.ADMIN])),
    db: AsyncSession = Depends(get_db),
):
    """
    Admin endpoint to view centralized security audit trail.
    """
    result = await db.execute(select(AuditLog).order_by(AuditLog.timestamp.desc()).limit(100))
    logs = result.scalars().all()
    return [
        {
            "id": log.id,
            "userId": log.user_id,
            "action": log.action,
            "details": log.details,
            "timestamp": log.timestamp.strftime("%Y-%m-%d %H:%M:%S"),
        }
        for log in logs
    ]
