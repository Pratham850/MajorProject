from __future__ import annotations
from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.notification_repository import NotificationRepository
from app.schemas.notifications import NotificationResponse, NotificationCreate
from app.models import NotificationType, User


class NotificationService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.notif_repo = NotificationRepository(db)

    async def list_notifications(self, user_id: int) -> List[NotificationResponse]:
        notifications = await self.notif_repo.list_by_user(user_id)
        return [NotificationResponse.from_orm(n) for n in notifications]

    async def mark_notification_as_read(self, notification_id: int, user_id: int) -> NotificationResponse:
        updated = await self.notif_repo.mark_as_read(notification_id=notification_id, user_id=user_id)
        if not updated:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Notification not found or access denied."
            )
        return NotificationResponse.from_orm(updated)

    async def create_notification(self, payload: NotificationCreate) -> NotificationResponse:
        created = await self.notif_repo.create(
            user_id=payload.user_id,
            title=payload.title,
            message=payload.message,
            type=payload.type
        )
        return NotificationResponse.from_orm(created)
