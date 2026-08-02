import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse

from app.middleware.auth_middleware import JWTAuthMiddleware
from app.middleware.exception_handlers import register_exception_handlers
from app.routes import (
    access_requests, ai_predictions, appointments, audit, auth, consents,
    dashboard, ml, notifications, patient_dashboard, patient_profile, prescriptions, profiles, records, research, user
)


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
        title="HealthShare Backend API",
        version="1.0.0",
        description="Production-ready healthcare data exchange, appointments, profiles, AI predictions & research platform.",
        lifespan=lifespan,
    )

    # CORS configuration allowing explicit frontend origins with credentials
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "http://localhost:4173",
            "http://127.0.0.1:4173",
        ],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # JWT auth middleware
    app.add_middleware(JWTAuthMiddleware)

    # Register Exception Handlers
    register_exception_handlers(app)

    # Register routers (Directly matching specified endpoint paths)
    app.include_router(auth.router, prefix="/auth", tags=["Auth"])
    app.include_router(user.router, prefix="/users", tags=["Users"])
    app.include_router(patient_dashboard.router)  # GET /api/patient/dashboard
    app.include_router(patient_profile.router)  # GET /patient/profile, PUT /patient/profile
    app.include_router(profiles.router)  # /patient/profile, /doctor/profile, /researcher/profile
    app.include_router(records.router)  # /medical-records
    app.include_router(appointments.router)  # /appointments
    app.include_router(notifications.router)  # /notifications
    app.include_router(ai_predictions.router)  # /ai
    app.include_router(prescriptions.router)  # /prescriptions
    app.include_router(consents.router)  # /consents
    app.include_router(access_requests.router)  # /access-requests
    app.include_router(research.router)  # /cohort-queries
    app.include_router(audit.router)  # /audit-logs
    app.include_router(dashboard.router)  # /dashboard
    app.include_router(ml.router, prefix="/ml", tags=["ML"])

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
