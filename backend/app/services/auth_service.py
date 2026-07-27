from __future__ import annotations
from typing import Tuple
from fastapi import HTTPException, status
from jose import JWTError

from app.models import User
from app.repositories.user_repository import UserRepository
from app.schemas.auth import UserLogin, UserRegister, TokenResponse, TokenRefreshResponse
from app.schemas.user import UserResponse
from app.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    get_password_hash,
    verify_password,
)


class AuthService:
    """
    Service layer containing business logic for User Authentication,
    Registration, Password Verification, and Token Lifecycle Management.
    """

    def __init__(self, user_repo: UserRepository):
        self.user_repo = user_repo

    async def register_user(self, user_in: UserRegister) -> User:
        """
        Business Logic:
        1. Check if email is already registered in the system.
        2. Hash the user's password using bcrypt.
        3. Persist the new user via UserRepository.
        """
        existing_user = await self.user_repo.get_by_email(user_in.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A user account with this email address already exists.",
            )

        hashed_password = get_password_hash(user_in.password)
        new_user = await self.user_repo.create(
            email=user_in.email,
            hashed_password=hashed_password,
            full_name=user_in.full_name,
            role=user_in.role,
            is_active=True,
            is_verified=False,
        )
        return new_user

    async def authenticate_user(self, credentials: UserLogin) -> TokenResponse:
        """
        Business Logic:
        1. Retrieve user by email.
        2. Verify password against stored bcrypt hash.
        3. Check account is_active flag.
        4. Generate JWT Access Token and Refresh Token.
        """
        user = await self.user_repo.get_by_email(credentials.email)
        if not user or not verify_password(credentials.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email address or password.",
                headers={"WWW-Authenticate": "Bearer"},
            )

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is inactive. Please contact support.",
            )

        role_str = user.role if isinstance(user.role, str) else user.role.value
        access_token = create_access_token(subject=user.id, role=role_str)
        refresh_token = create_refresh_token(subject=user.id)

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            user=UserResponse.model_validate(user),
        )

    async def refresh_access_token(self, refresh_token_str: str) -> TokenRefreshResponse:
        """
        Business Logic:
        1. Decode and validate refresh token JWT signature & claims.
        2. Ensure token type is 'refresh'.
        3. Query corresponding user and verify active status.
        4. Issue a fresh JWT Access Token.
        """
        credentials_exception = HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

        try:
            payload = decode_token(refresh_token_str)
            user_id_str: str = payload.get("sub")
            token_type: str = payload.get("type")

            if user_id_str is None or token_type != "refresh":
                raise credentials_exception

            user_id = int(user_id_str)
        except (JWTError, ValueError):
            raise credentials_exception

        user = await self.user_repo.get_by_id(user_id)
        if not user or not user.is_active:
            raise credentials_exception

        role_str = user.role if isinstance(user.role, str) else user.role.value
        new_access_token = create_access_token(subject=user.id, role=role_str)

        return TokenRefreshResponse(
            access_token=new_access_token,
            token_type="bearer",
        )
