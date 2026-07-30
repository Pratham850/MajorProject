import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse

from app.middleware.auth_middleware import JWTAuthMiddleware
from app.middleware.exception_handlers import register_exception_handlers
from app.routes import access_requests, audit, auth, consents, dashboard, ml, notifications, records, research, user


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager replacing deprecated @app.on_event."""
    import sys
    if "pytest" not in sys.modules:
        from app.ml_model import train_and_save_models
        train_and_save_models()
    yield


def create_app() -> FastAPI:
    app = FastAPI(
        title="HealthShare Backend",
        version="1.0.0",
        description="Production-ready healthcare data exchange & ML trend prediction backend.",
        lifespan=lifespan,
    )

    # CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # JWT auth middleware
    app.add_middleware(JWTAuthMiddleware)

    # Register Exception Handlers
    register_exception_handlers(app)

    # Register routers
    app.include_router(auth.router, prefix="/auth", tags=["auth"])
    app.include_router(user.router, prefix="/users", tags=["users"])
    app.include_router(records.router, prefix="/records", tags=["records"])
    app.include_router(consents.router, prefix="/consents", tags=["consents"])
    app.include_router(access_requests.router, prefix="/access-requests", tags=["access-requests"])
    app.include_router(research.router, prefix="/research", tags=["research"])
    app.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
    app.include_router(ml.router, prefix="/ml", tags=["ml"])
    app.include_router(notifications.router, prefix="/notifications", tags=["notifications"])
    app.include_router(audit.router, prefix="/audit-logs", tags=["audit-logs"])

    @app.get("/healthz", include_in_schema=False)
    async def health_check():
        return {"status": "ok"}

    # Frontend Integration & Root Endpoint
    frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist"))
    assets_dir = os.path.join(frontend_dist, "assets")

    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="static_assets")

    @app.get("/", include_in_schema=False)
    async def root():
        index_path = os.path.join(frontend_dist, "index.html")
        if os.path.exists(index_path):
            return FileResponse(index_path)
        return {
            "message": "Welcome to HealthShare Healthcare Data Platform API",
            "status": "online",
            "version": "1.0.0",
            "docs": "/docs",
            "health": "/healthz",
        }

    return app


app = create_app()
