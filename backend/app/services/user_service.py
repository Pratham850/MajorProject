from __future__ import annotations
from typing import List
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import User, AuditLog
from app.repositories.user_repository import UserRepository
from app.schemas.user import UserUpdate, PasswordChange, UserStatusUpdate
from app.security import get_password_hash, verify_password


class UserService:
    """
    Service layer containing business logic for User profile updates,
    password changes, and admin user management with HIPAA/GDPR audit logging.
    """

    def __init__(self, user_repo: UserRepository, db: AsyncSession):
        self.user_repo = user_repo
        self.db = db

    async def update_profile(self, current_user: User, profile_data: UserUpdate) -> User:
        """
        Business Logic:
        1. Updates full_name if provided.
        2. Logs an AuditLog record for the change.
        """
        if profile_data.full_name is not None:
            updated_user = await self.user_repo.update_profile(current_user, profile_data.full_name)
        else:
            updated_user = current_user

        audit = AuditLog(
            user_id=current_user.id,
            action="Profile Updated",
            details=f"Updated profile details. New Name: '{updated_user.full_name}'",
        )
        self.db.add(audit)
        await self.db.commit()

        return updated_user

    async def change_password(self, current_user: User, data: PasswordChange) -> None:
        """
        Business Logic:
        1. Verifies current password against stored hash.
        2. Hashes new password and updates record.
        3. Creates AuditLog entry.
        """
        if not verify_password(data.current_password, current_user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Incorrect current password.",
            )

        new_hashed = get_password_hash(data.new_password)
        await self.user_repo.update_password(current_user, new_hashed)

        audit = AuditLog(
            user_id=current_user.id,
            action="Password Changed",
            details="User successfully changed account password.",
        )
        self.db.add(audit)
        await self.db.commit()

    async def list_users_admin(self) -> List[User]:
        """
        Business Logic:
        Retrieves all registered users for admin overview.
        """
        return await self.user_repo.list_all()

    async def update_user_status_admin(self, admin_user: User, user_id: int, status_data: UserStatusUpdate) -> User:
        """
        Business Logic:
        1. Query user by ID.
        2. Update is_active state.
        3. Log admin action to AuditLog.
        """
        target_user = await self.user_repo.get_by_id(user_id)
        if not target_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found.",
            )

        updated_user = await self.user_repo.update_status(target_user, status_data.is_active)

        audit = AuditLog(
            user_id=admin_user.id,
            action="User Status Modified",
            details=f"Admin changed status for user ID {target_user.id} ({target_user.email}) to active={target_user.is_active}.",
        )
        self.db.add(audit)
        await self.db.commit()

        return updated_user
