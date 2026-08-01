from __future__ import annotations
from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import PatientProfile


class PatientProfileRepository:
    """
    Data Access Repository for PatientProfile entity.
    Encapsulates all SQLAlchemy queries for the patient_profiles table.
    """

    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_user_id(self, user_id: int) -> Optional[PatientProfile]:
        """Fetch patient profile by user foreign key."""
        result = await self.session.execute(
            select(PatientProfile).where(PatientProfile.user_id == user_id)
        )
        return result.scalar_one_or_none()

    async def create_or_update(self, user_id: int, **kwargs) -> PatientProfile:
        """Create a new patient profile or update an existing profile entry."""
        profile = await self.get_by_user_id(user_id)
        if not profile:
            profile = PatientProfile(user_id=user_id, **kwargs)
            self.session.add(profile)
        else:
            for key, value in kwargs.items():
                if value is not None:
                    setattr(profile, key, value)
        await self.session.commit()
        await self.session.refresh(profile)
        return profile
