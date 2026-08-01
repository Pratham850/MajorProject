from __future__ import annotations
from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy import select, func
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import User, UserRole


class UserRepository:
    """
    Data Access Repository for User entities.
    Encapsulates all SQLAlchemy queries for the User table.
    """

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, user_id: int) -> Optional[User]:
        """Fetch user by primary key ID."""
        result = await self.db.execute(select(User).filter(User.id == user_id))
        return result.scalars().first()

    async def get_by_email(self, email: str) -> Optional[User]:
        """Fetch user by unique email address."""
        result = await self.db.execute(select(User).filter(User.email == email.lower().strip()))
        return result.scalars().first()

    async def create(
        self,
        email: str,
        hashed_password: str,
        full_name: str,
        role: UserRole = UserRole.PATIENT,
        is_active: bool = True,
        is_verified: bool = False,
    ) -> User:
        """Create and persist a new User record with atomic transaction management."""
        try:
            new_user = User(
                email=email.lower().strip(),
                hashed_password=hashed_password,
                full_name=full_name.strip(),
                role=role,
                is_active=is_active,
                is_verified=is_verified,
            )
            self.db.add(new_user)
            await self.db.commit()
            await self.db.refresh(new_user)
            return new_user
        except IntegrityError as exc:
            await self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="An account with this email already exists.",
            ) from exc
        except SQLAlchemyError as exc:
            await self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Something went wrong. Please try again later.",
            ) from exc

    async def update_profile(self, user: User, full_name: str) -> User:
        """Update full_name field for a user."""
        user.full_name = full_name.strip()
        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)
        return user

    async def update_password(self, user: User, hashed_password: str) -> User:
        """Update hashed_password field for a user."""
        user.hashed_password = hashed_password
        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)
        return user

    async def list_all(self) -> List[User]:
        """Retrieve all registered users ordered by ID."""
        result = await self.db.execute(select(User).order_by(User.id.asc()))
        return list(result.scalars().all())

    async def update_status(self, user: User, is_active: bool) -> User:
        """Update active status for a user."""
        user.is_active = is_active
        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)
        return user

    async def count_total(self) -> int:
        result = await self.db.execute(select(func.count(User.id)))
        return result.scalar() or 0

    async def count_by_role(self, role: UserRole) -> int:
        result = await self.db.execute(select(func.count(User.id)).where(User.role == role))
        return result.scalar() or 0
