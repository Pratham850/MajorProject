from __future__ import annotations
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import User
from app.repositories.user_repository import UserRepository
from app.routes.dependencies import get_current_user
from app.schemas.auth import (
    MessageResponse,
    TokenRefreshRequest,
    TokenRefreshResponse,
    TokenResponse,
    UserLogin,
    UserRegister,
    UserRegisterResponse,
)
from app.schemas.user import UserResponse
from app.services.auth_service import AuthService

router = APIRouter()


def get_auth_service(db: AsyncSession = Depends(get_db)) -> AuthService:
    """Dependency injection helper for AuthService."""
    user_repo = UserRepository(db)
    return AuthService(user_repo)


# ----------------------------------------------------------------------
# 1. User Registration Endpoint
# ----------------------------------------------------------------------
@router.post(
    "/register",
    response_model=UserRegisterResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user account",
    description="Registers a Patient, Doctor, Researcher, or Admin with password hashing and email uniqueness check.",
)
async def register(
    user_in: UserRegister,
    auth_service: AuthService = Depends(get_auth_service),
):
    """
    Registers a new user account in the system.
    """
    return await auth_service.register_user(user_in)


# ----------------------------------------------------------------------
# 2. User Login Endpoint
# ----------------------------------------------------------------------
@router.post(
    "/login",
    response_model=TokenResponse,
    summary="User Login",
    description="Authenticates user credentials and returns JWT Access Token and Refresh Token.",
)
async def login(
    credentials: UserLogin,
    auth_service: AuthService = Depends(get_auth_service),
):
    """
    Authenticates email and password, returning JWT access and refresh tokens.
    """
    return await auth_service.authenticate_user(credentials)


# ----------------------------------------------------------------------
# 3. Refresh Access Token Endpoint
# ----------------------------------------------------------------------
@router.post(
    "/refresh",
    response_model=TokenRefreshResponse,
    summary="Refresh Access Token",
    description="Validates a long-lived JWT Refresh Token and issues a new Access Token.",
)
async def refresh_access_token(
    refresh_req: TokenRefreshRequest,
    auth_service: AuthService = Depends(get_auth_service),
):
    """
    Exchanges a valid refresh token for a new short-lived access token.
    """
    return await auth_service.refresh_access_token(refresh_req.refresh_token)


# ----------------------------------------------------------------------
# 4. Logout Endpoint
# ----------------------------------------------------------------------
@router.post(
    "/logout",
    response_model=MessageResponse,
    summary="Logout User",
    description="Invalidates current user session.",
)
async def logout(
    current_user: User = Depends(get_current_user),
):
    """
    Logs out the authenticated user.
    """
    return MessageResponse(message="Successfully logged out.")


# ----------------------------------------------------------------------
# 5. Get Current Authenticated Profile (/auth/me)
# ----------------------------------------------------------------------
@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get Current User Profile",
    description="Returns profile details of the currently authenticated active user.",
)
async def get_me(
    current_user: User = Depends(get_current_user),
):
    """
    Returns profile info for the currently authenticated user.
    """
    return current_user
