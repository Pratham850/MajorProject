from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response
from app.security import decode_token
from jose import JWTError
from sqlalchemy.future import select
from app.database import AsyncSessionLocal
from app.models import User

class JWTAuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        path = request.url.path
        
        # Exclude standard public endpoints & static assets from middleware lookup
        if (
            path in ["/", "/healthz", "/docs", "/openapi.json", "/favicon.ico"] 
            or path.startswith("/assets")
            or path.startswith("/auth/login") 
            or path.startswith("/auth/register") 
            or path.startswith("/auth/token") 
            or path.startswith("/auth/refresh")
            or request.method == "OPTIONS"
        ):
            request.state.user = None
            return await call_next(request)

        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            request.state.user = None
            return await call_next(request)

        token = auth_header.split(" ")[1]
        try:
            payload = decode_token(token)
            if payload.get("type") != "access":
                request.state.user = None
                return await call_next(request)
            
            user_id = payload.get("sub")
            if not user_id:
                request.state.user = None
                return await call_next(request)
            
            async with AsyncSessionLocal() as session:
                result = await session.execute(select(User).filter(User.id == int(user_id)))
                user = result.scalars().first()
                if user:
                    request.state.user = user
                else:
                    request.state.user = None
        except (JWTError, ValueError):
            request.state.user = None

        return await call_next(request)
