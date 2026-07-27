from __future__ import annotations
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field


class NotificationItem(BaseModel):
    id: str
    name: str
    action: str
    details: str
    time: str
    isRead: bool = False

    model_config = ConfigDict(from_attributes=True)
