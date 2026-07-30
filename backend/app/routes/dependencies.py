from __future__ import annotations
from typing import List, Optional, Union
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import User, UserRole
from app.security import decode_token

# HTTP Bearer security scheme with auto_error=False to allow custom 401 Unauthorized handling
security_scheme = HTTPBearer(auto_error=False)


async def get_current_user(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    """
    Dependency that extracts, decodes, and verifies the JWT Access Token from the Authorization header.
    Reuses request.state.user if populated by JWTAuthMiddleware to avoid duplicate DB queries per request.
    Returns the authenticated active User instance.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate authentication credentials.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    # 1. Reuse user from middleware context if available
    state_user = getattr(request.state, "user", None)
    if state_user is not None:
        if not state_user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is inactive.",
            )
        return state_user

    # 2. Check credentials presence from HTTPBearer
    if credentials is None:
        raise credentials_exception

    # 3. Direct token verification fallback
    token = credentials.credentials
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
    Admin role is granted superuser override access across endpoints.
    Usage: Depends(RoleChecker([UserRole.DOCTOR, UserRole.ADMIN]))
    """
    def __init__(self, allowed_roles: List[Union[UserRole, str]]):
        self.allowed_roles = [
            r if isinstance(r, str) else r.value for r in allowed_roles
        ]
        # Always grant Admin access
        if UserRole.ADMIN.value not in self.allowed_roles and "admin" not in self.allowed_roles:
            self.allowed_roles.append(UserRole.ADMIN.value)

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
