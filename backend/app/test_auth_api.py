import pytest
import httpx
from httpx import ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.database import get_db
from app.models import Base
import app.database as db_module
import app.middleware.auth_middleware as auth_mw

from sqlalchemy.pool import StaticPool

# Setup async sqlite database for testing with StaticPool
DATABASE_URL = "sqlite+aiosqlite:///:memory:"

engine = create_async_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
    autocommit=False,
)

async def override_get_db():
    async with TestingSessionLocal() as session:
        yield session

db_module.AsyncSessionLocal = TestingSessionLocal
auth_mw.AsyncSessionLocal = TestingSessionLocal
app.dependency_overrides[get_db] = override_get_db


@pytest.fixture
def anyio_backend():
    return "asyncio"


@pytest.fixture(autouse=True)
async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest.mark.anyio
async def test_auth_flow():
    transport = ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as client:

        # 1. Testing User Registration
        reg_payload = {
            "email": "testpatient@healthshare.com",
            "password": "Password123!",
            "full_name": "John Patient",
            "role": "patient"
        }
        res = await client.post("/auth/register", json=reg_payload)
        assert res.status_code == 201, f"Registration failed: {res.text}"
        assert res.json()["email"] == "testpatient@healthshare.com"
        assert res.json()["role"] == "patient"

        # 2. Testing User Login
        login_payload = {
            "email": "testpatient@healthshare.com",
            "password": "Password123!"
        }
        res = await client.post("/auth/login", json=login_payload)
        assert res.status_code == 200, f"Login failed: {res.text}"
        data = res.json()
        access_token = data["access_token"]
        refresh_token = data["refresh_token"]
        assert "access_token" in data
        assert "refresh_token" in data

        # 3. Testing /auth/me Endpoint
        headers = {"Authorization": f"Bearer {access_token}"}
        res = await client.get("/auth/me", headers=headers)
        assert res.status_code == 200, f"/auth/me failed: {res.text}"
        assert res.json()["email"] == "testpatient@healthshare.com"

        # 4. Testing Refresh Token Endpoint
        res = await client.post("/auth/refresh", json={"refresh_token": refresh_token})
        assert res.status_code == 200, f"Refresh failed: {res.text}"
        assert "access_token" in res.json()

        # 5. Testing Logout Endpoint
        res = await client.post("/auth/logout", headers=headers)
        assert res.status_code == 200, f"Logout failed: {res.text}"
        assert res.json()["message"] == "Successfully logged out."
