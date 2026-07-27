from __future__ import annotations
from typing import List, Union
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import User, UserRole
from app.security import decode_token

# HTTP Bearer security scheme for Swagger / OpenAPI docs
security_scheme = HTTPBearer(auto_error=True)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    """
    Dependency that extracts, decodes, and verifies the JWT Access Token from the Authorization header.
    Returns the authenticated active User instance.
    """
    token = credentials.credentials
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate authentication credentials.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = decode_token(token)
        user_id_str: str = payload.get("sub")
        token_type: str = payload.get("type")

        if user_id_str is None or token_type != "access":
            raise credentials_exception
            
        user_id = int(user_id_str)
    except (JWTError, ValueError):
        raise credentials_exception

    # Query active user from database
    result = await db.execute(select(User).filter(User.id == user_id))
    user = result.scalars().first()

    if user is None:
        raise credentials_exception
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive.",
        )

    return user


class RoleChecker:
    """
    Dependency for Role-Based Access Control (RBAC).
    Usage: Depends(RoleChecker([UserRole.DOCTOR, UserRole.ADMIN]))
    """
    def __init__(self, allowed_roles: List[Union[UserRole, str]]):
        self.allowed_roles = [
            r if isinstance(r, str) else r.value for r in allowed_roles
        ]

    def __call__(self, current_user: User = Depends(get_current_user)) -> User:
        user_role_str = (
            current_user.role if isinstance(current_user.role, str) else current_user.role.value
        )
        if user_role_str not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Requires one of roles: {self.allowed_roles}",
            )
        return current_user
