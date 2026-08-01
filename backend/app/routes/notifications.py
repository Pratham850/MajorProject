from __future__ import annotations
from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.models import User
from app.schemas.notifications import NotificationResponse, NotificationItem
from app.services.notification_service import NotificationService

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("", response_model=List[NotificationResponse], status_code=status.HTTP_200_OK)
async def get_notifications(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = NotificationService(db)
    return await service.list_notifications(current_user.id)


@router.put("/{id}/read", response_model=NotificationResponse, status_code=status.HTTP_200_OK)
async def mark_notification_as_read(
    id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = NotificationService(db)
    return await service.mark_notification_as_read(id, current_user.id)
