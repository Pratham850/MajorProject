from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import User, UserRole
from app.repositories.user_repository import UserRepository
from app.routes.dependencies import get_current_user, RoleChecker
from app.schemas.auth import MessageResponse
from app.schemas.user import PasswordChange, UserResponse, UserStatusUpdate, UserUpdate
from app.services.user_service import UserService

router = APIRouter()


def get_user_service(db: AsyncSession = Depends(get_db)) -> UserService:
    """Dependency injection helper for UserService."""
    user_repo = UserRepository(db)
    return UserService(user_repo, db)


# ----------------------------------------------------------------------
# 1. Get Current User Profile
# ----------------------------------------------------------------------
@router.get(
    "/profile",
    response_model=UserResponse,
    summary="Get user profile",
    description="Returns the profile details of the currently logged-in user.",
)
async def get_profile(
    current_user: User = Depends(get_current_user),
):
    """
    Retrieves current user details.
    """
    return current_user


# ----------------------------------------------------------------------
# 2. Update User Profile
# ----------------------------------------------------------------------
@router.put(
    "/profile",
    response_model=UserResponse,
    summary="Update profile",
    description="Allows updating the current user's full name.",
)
async def update_profile(
    profile_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    user_service: UserService = Depends(get_user_service),
):
    """
    Updates the authenticated user's profile details.
    """
    return await user_service.update_profile(current_user, profile_data)


# ----------------------------------------------------------------------
# 3. Change Password
# ----------------------------------------------------------------------
@router.post(
    "/change-password",
    response_model=MessageResponse,
    summary="Change password",
    description="Changes the current user's password securely after verifying their current password.",
)
async def change_password(
    data: PasswordChange,
    current_user: User = Depends(get_current_user),
    user_service: UserService = Depends(get_user_service),
):
    """
    Verifies current password and updates to a new password.
    """
    await user_service.change_password(current_user, data)
    return MessageResponse(message="Password successfully updated.")


# ----------------------------------------------------------------------
# 4. Admin User Management: List Users
# ----------------------------------------------------------------------
@router.get(
    "/admin/users",
    response_model=List[UserResponse],
    summary="List all users (Admin only)",
    description="Retrieves a list of all registered users in the database.",
)
async def list_users_admin(
    current_user: User = Depends(RoleChecker([UserRole.ADMIN])),
    user_service: UserService = Depends(get_user_service),
):
    """
    Admin-only endpoint to list all registered users.
    """
    return await user_service.list_users_admin()


# ----------------------------------------------------------------------
# 5. Admin User Management: Update User Status
# ----------------------------------------------------------------------
@router.put(
    "/admin/users/{user_id}/status",
    response_model=UserResponse,
    summary="Update user status (Admin only)",
    description="Enables or disables (soft-deletes/suspends) a user account.",
)
async def update_user_status(
    user_id: int,
    status_data: UserStatusUpdate,
    current_user: User = Depends(RoleChecker([UserRole.ADMIN])),
    user_service: UserService = Depends(get_user_service),
):
    """
    Admin-only endpoint to enable or disable a user account.
    """
    return await user_service.update_user_status_admin(current_user, user_id, status_data)
