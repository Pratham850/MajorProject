import pytest
import httpx
from httpx import ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import create_app
from app.database import get_db
import app.models
from app.models import Base
import app.database as db_module
import app.middleware.auth_middleware as auth_mw

# Shared in-memory SQLite database URI for all tests
DATABASE_URL = "sqlite+aiosqlite:///file:testdb_global?mode=memory&cache=shared"

engine = create_async_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False, "uri": True},
    poolclass=StaticPool,
)

TestingSessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
    autocommit=False,
)

# Global session monkeypatch for middleware and database modules
db_module.AsyncSessionLocal = TestingSessionLocal
auth_mw.AsyncSessionLocal = TestingSessionLocal


async def override_get_db():
    async with TestingSessionLocal() as session:
        yield session


@pytest.fixture
def anyio_backend():
    return "asyncio"


@pytest.fixture(autouse=True)
async def init_db():
    """Fixture that initializes fresh database tables before each test case."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest.fixture
async def app_instance():
    """Creates a fresh FastAPI app instance with dependency overrides."""
    app = create_app()
    app.dependency_overrides[get_db] = override_get_db
    return app


@pytest.fixture
async def client(app_instance):
    """Provides an AsyncClient connected to the test FastAPI app instance."""
    transport = ASGITransport(app=app_instance)
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as ac:
        yield ac
