from __future__ import annotations
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field
from app.models import NotificationType


class NotificationItem(BaseModel):
    id: str
    name: str
    action: str
    details: str
    time: str
    isRead: bool = False

    class Config:
        orm_mode = True


class NotificationCreate(BaseModel):
    user_id: int
    title: str = Field(..., max_length=255)
    message: str
    type: NotificationType


class NotificationResponse(BaseModel):
    id: int
    user_id: int
    title: str
    message: str
    type: NotificationType
    is_read: bool
    created_at: datetime

    class Config:
        orm_mode = True


