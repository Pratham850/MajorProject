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
        request.state.user = None
        request.state.user_id = None
        
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
            return await call_next(request)

        auth_header = request.headers.get("Authorization") or request.headers.get("authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return await call_next(request)

        token = auth_header.split(" ")[1]
        try:
            payload = decode_token(token)
            if payload.get("type") != "access":
                return await call_next(request)
            
            user_id_str = payload.get("sub")
            if not user_id_str:
                return await call_next(request)
            
            user_id = int(user_id_str)
            request.state.user_id = user_id
            
            async with AsyncSessionLocal() as session:
                result = await session.execute(select(User).filter(User.id == user_id))
                user = result.scalars().first()
                if user:
                    request.state.user = user
        except (JWTError, ValueError):
            pass

        return await call_next(request)
