from __future__ import annotations
from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import User
from app.routes.dependencies import get_current_user
from app.schemas.auth import MessageResponse
from app.schemas.notifications import NotificationItem
from app.services.notification_service import NotificationService

router = APIRouter()


def get_notification_service(db: AsyncSession = Depends(get_db)) -> NotificationService:
    """Dependency injection helper for NotificationService."""
    return NotificationService(db)


# ----------------------------------------------------------------------
# 1. Retrieve System Notifications (GET /notifications)
# ----------------------------------------------------------------------
@router.get(
    "",
    response_model=List[NotificationItem],
    summary="List notifications",
    description="Retrieves security activity log feed notifications for logged-in user.",
)
async def list_notifications(
    current_user: User = Depends(get_current_user),
    notif_service: NotificationService = Depends(get_notification_service),
):
    """
    Lists system notifications for current user.
    """
    return await notif_service.list_notifications(current_user)


# ----------------------------------------------------------------------
# 2. Mark Notification as Read (PUT /notifications/{notification_id}/read)
# ----------------------------------------------------------------------
@router.put(
    "/{notification_id}/read",
    response_model=MessageResponse,
    summary="Mark notification as read",
    description="Marks a specific notification item as read.",
)
async def mark_notification_read(
    notification_id: str,
    current_user: User = Depends(get_current_user),
    notif_service: NotificationService = Depends(get_notification_service),
):
    """
    Marks notification as read.
    """
    return await notif_service.mark_as_read(notification_id, current_user)
