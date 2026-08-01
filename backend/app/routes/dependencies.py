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
    Dependency that extracts, decodes, and verifies the JWT Access Token.
    Queries the User from the current request's DB session to avoid session detachment errors.
    Returns the authenticated active User instance.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate authentication credentials.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    user_id = getattr(request.state, "user_id", None)
    if not user_id and credentials and credentials.credentials:
        try:
            payload = decode_token(credentials.credentials)
            if payload.get("type") == "access":
                user_id = int(payload.get("sub"))
        except (JWTError, ValueError):
            pass

    if not user_id:
        raise credentials_exception

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
        ).lower()
        allowed_roles_lower = [r.lower() for r in self.allowed_roles]
        allowed_roles_lower.append("admin")

        if user_role_str not in allowed_roles_lower:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Requires one of roles: {self.allowed_roles}",
            )
        return current_user
