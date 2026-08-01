"""Application-wide dependency utilities.

Provides:
- ``get_db``: Async DB session dependency.
- ``get_current_user``: Extracts the user from request.state populated by ``JWTAuthMiddleware``.
- ``require_role``: Role-based authorization dependency.

All functions are async and designed for FastAPI's ``Depends`` system.
"""

from typing import Callable, Iterable, Union

from fastapi import Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import async_session_factory, get_db
from app.models import User, UserRole


async def get_current_user(request: Request) -> User:
    """Retrieve the authenticated ``User`` instance.

    ``JWTAuthMiddleware`` stores the user object (or ``None``) on ``request.state.user``.
    If the user is absent, a ``401 Unauthorized`` error is raised.
    If the user is inactive, a ``403 Forbidden`` error is raised.
    """
    user = getattr(request.state, "user", None)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate authentication credentials.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive.",
        )
    return user


def require_role(roles: Union[UserRole, Iterable[UserRole], list, set] = None, *allowed_roles: UserRole) -> Callable[[User], User]:
    """Dependency factory that ensures the current user has one of the allowed roles.
    Admin role is granted superuser override access across endpoints.
    """
    flat_roles = set()
    if roles:
        if isinstance(roles, (list, tuple, set)):
            flat_roles.update(roles)
        else:
            flat_roles.add(roles)
    if allowed_roles:
        flat_roles.update(allowed_roles)

    flat_roles.add(UserRole.ADMIN)
    flat_roles.add("admin")

    async def dependency(current_user: User = Depends(get_current_user)) -> User:
        user_role = current_user.role if isinstance(current_user.role, str) else current_user.role.value
        allowed_values = {r.value if hasattr(r, "value") else str(r) for r in flat_roles}
        if user_role not in allowed_values:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions",
            )
        return current_user

    return dependency
