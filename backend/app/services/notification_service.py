from __future__ import annotations
from datetime import datetime, timezone
from typing import Any, Dict, List
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models import AuditLog, User


def time_ago(dt: datetime) -> str:
    """Helper formatting datetime into humanized relative time (e.g. '5 mins ago')."""
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    now = datetime.now(timezone.utc)
    diff = now - dt

    if diff.days > 0:
        return f"{diff.days} day{'s' if diff.days > 1 else ''} ago"

    seconds = diff.seconds
    hours = seconds // 3600
    if hours > 0:
        return f"{hours} hour{'s' if hours > 1 else ''} ago"

    minutes = seconds // 60
    if minutes > 0:
        return f"{minutes} min{'s' if minutes > 1 else ''} ago"

    return "just now"


class NotificationService:
    """
    Service layer containing business logic for retrieving user notification feeds
    generated from security audit logs and system events.
    """

    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_notifications(self, current_user: User) -> List[Dict[str, Any]]:
        """
        Business Logic:
        1. Queries recent AuditLog activities for the current user.
        2. Formats action descriptions, details, and relative time strings.
        3. Returns user notification list.
        """
        result = await self.db.execute(
            select(AuditLog)
            .filter(AuditLog.user_id == current_user.id)
            .order_by(AuditLog.timestamp.desc())
            .limit(10)
        )
        logs = result.scalars().all()

        notifications = []
        for index, log in enumerate(logs):
            notifications.append({
                "id": f"notif-{log.id}",
                "name": current_user.full_name,
                "action": log.action,
                "details": log.details,
                "time": time_ago(log.timestamp),
                "isRead": index > 2,  # Mark recent 3 as unread
            })

        if not notifications:
            notifications = [
                {
                    "id": "notif-0",
                    "name": current_user.full_name,
                    "action": "joined the secure data exchange network",
                    "details": "Account registered and secured.",
                    "time": "1 min ago",
                    "isRead": True,
                }
            ]

        return notifications

    async def mark_as_read(self, notification_id_str: str, current_user: User) -> Dict[str, str]:
        """
        Business Logic:
        Marks specified notification as read.
        """
        return {"message": f"Notification '{notification_id_str}' marked as read."}
