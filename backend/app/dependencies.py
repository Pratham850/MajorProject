"""Application-wide dependency utilities.

Provides:
- ``get_db``: Async DB session dependency.
- ``get_current_user``: Extracts the user from request.state populated by ``JWTAuthMiddleware``.
- ``require_role``: Role‑based authorisation dependency.

All functions are async and designed for FastAPI's ``Depends`` system.
"""

from __future__ import annotations

from typing import Callable

from fastapi import Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import async_session_factory
from app.models import User, UserRole


async def get_db() -> AsyncSession:
    """Yield an ``AsyncSession`` for a request.

    The session is created from ``async_session_factory`` (see ``database.py``) and
    closed automatically after the request finishes.
    """
    async with async_session_factory() as session:
        yield session


async def get_current_user(request: Request) -> User:
    """Retrieve the authenticated ``User`` instance.

    ``JWTAuthMiddleware`` stores the user object (or ``None``) on ``request.state.user``.
    If the user is absent, a ``401 Unauthorized`` error is raised.
    """
    user = getattr(request.state, "user", None)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    return user


def require_role(*allowed_roles: UserRole) -> Callable[[User], User]:
    """Dependency factory that ensures the current user has one of the ``allowed_roles``.

    Usage::

        @router.get("/admin")
        async def admin_endpoint(current_user: User = Depends(require_role(UserRole.ADMIN))):
            ...
    """

    async def dependency(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions",
            )
        return current_user

    return dependency
