from datetime import timedelta
from unittest.mock import AsyncMock, patch
import httpx
import pytest
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError

from app.conftest import TestingSessionLocal
from app.models import User
from app.security import create_access_token


def get_error_message(res: httpx.Response) -> str:
    """Helper to safely extract error message from standardized JSON response or detail field."""
    data = res.json()
    if isinstance(data, dict) and "error" in data and "message" in data["error"]:
        return data["error"]["message"]
    if isinstance(data, dict) and "detail" in data:
        return str(data["detail"])
    return str(data)


@pytest.mark.anyio
async def test_register_success(client: httpx.AsyncClient):
    """1. Test User Registration with valid payload & password complexity."""
    payload = {
        "name": "Jane Patient",
        "email": "jane.patient@healthshare.org",
        "password": "SecurePassword123!",
        "confirm_password": "SecurePassword123!",
        "role": "patient",
    }
    res = await client.post("/auth/register", json=payload)
    assert res.status_code == 201, f"Registration failed: {res.text}"
    data = res.json()
    assert data["message"] == "Registration successful"
    assert data["user"]["email"] == "jane.patient@healthshare.org"
    assert data["user"]["name"] == "Jane Patient"
    assert data["user"]["role"] == "PATIENT"
    assert "password" not in data["user"]
    assert "hashed_password" not in data["user"]
    assert "secret" not in data["user"]
    assert "access_token" not in data


@pytest.mark.anyio
async def test_register_duplicate_email(client: httpx.AsyncClient):
    """2. Test Registration with an already existing email returns 409 Conflict."""
    payload = {
        "name": "John Doe",
        "email": "duplicate@healthshare.org",
        "password": "SecurePassword123!",
        "role": "patient",
    }
    res1 = await client.post("/auth/register", json=payload)
    assert res1.status_code == 201

    res2 = await client.post("/auth/register", json=payload)
    assert res2.status_code == 409
    data = res2.json()
    assert data["success"] is False
    assert data["message"] == "An account with this email already exists."


@pytest.mark.anyio
async def test_register_weak_password(client: httpx.AsyncClient):
    """3. Test Registration with weak password returns 422 Unprocessable Entity."""
    weak_passwords = [
        "short",  # < 8 chars
        "alllowercase1!",  # no uppercase
        "ALLUPPERCASE1!",  # no lowercase
        "NoDigitsHere!",  # no digit
        "NoSpecialChar123",  # no special char
    ]
    for pwd in weak_passwords:
        payload = {
            "name": "Weak User",
            "email": f"weak_{hash(pwd)}@healthshare.org",
            "password": pwd,
            "role": "patient",
        }
        res = await client.post("/auth/register", json=payload)
        assert res.status_code == 422
        data = res.json()
        assert data["success"] is False
        assert data["message"] == "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character."


@pytest.mark.anyio
async def test_register_invalid_email(client: httpx.AsyncClient):
    """4. Test Registration with invalid email returns 422 Unprocessable Entity."""
    payload = {
        "name": "Bad Email User",
        "email": "invalid-email-format",
        "password": "SecurePassword123!",
        "role": "patient",
    }
    res = await client.post("/auth/register", json=payload)
    assert res.status_code == 422
    data = res.json()
    assert data["success"] is False
    assert data["message"] == "Please enter a valid email address."


@pytest.mark.anyio
async def test_register_invalid_role(client: httpx.AsyncClient):
    """5. Test Registration with unauthorized/invalid role returns 422 Unprocessable Entity."""
    payload = {
        "name": "Hacker User",
        "email": "hacker@healthshare.org",
        "password": "SecurePassword123!",
        "role": "SUPERUSER",
    }
    res = await client.post("/auth/register", json=payload)
    assert res.status_code == 422
    data = res.json()
    assert data["success"] is False
    assert "Invalid role" in data["message"]


@pytest.mark.anyio
async def test_register_missing_fields(client: httpx.AsyncClient):
    """6. Test Registration with missing required fields returns 422 Unprocessable Entity."""
    payload = {
        "email": "missingname@healthshare.org",
        "password": "SecurePassword123!",
    }
    res = await client.post("/auth/register", json=payload)
    assert res.status_code == 422
    data = res.json()
    assert data["success"] is False


@pytest.mark.anyio
async def test_register_database_failure(client: httpx.AsyncClient):
    """7. Test Database Failure during registration returns 500 Internal Server Error."""
    payload = {
        "name": "DB Fail User",
        "email": "dbfail@healthshare.org",
        "password": "SecurePassword123!",
        "role": "patient",
    }
    from fastapi import HTTPException
    with patch("app.repositories.user_repository.UserRepository.create", side_effect=HTTPException(500, detail="Something went wrong. Please try again later.")):
        res = await client.post("/auth/register", json=payload)
        assert res.status_code == 500
        data = res.json()
        assert data["success"] is False
        assert data["message"] == "Something went wrong. Please try again later."


@pytest.mark.anyio
async def test_login_success(client: httpx.AsyncClient):
    """8. Test User Login returning JWT access, refresh tokens, and user details."""
    reg_payload = {
        "name": "Dr. Smith",
        "email": "dr.smith@hospital.com",
        "password": "DoctorSecret123!",
        "role": "doctor",
    }
    await client.post("/auth/register", json=reg_payload)

    login_payload = {
        "email": "dr.smith@hospital.com",
        "password": "DoctorSecret123!",
    }
    res = await client.post("/auth/login", json=login_payload)
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "dr.smith@hospital.com"
    assert data["user"]["name"] == "Dr. Smith"


@pytest.mark.anyio
async def test_login_wrong_password(client: httpx.AsyncClient):
    """9. Test Login with incorrect password returns 401 Unauthorized."""
    await client.post("/auth/register", json={
        "name": "Alice User",
        "email": "alice@healthshare.org",
        "password": "CorrectPassword123!",
        "role": "patient",
    })

    res = await client.post("/auth/login", json={
        "email": "alice@healthshare.org",
        "password": "WrongPassword123!",
    })
    assert res.status_code == 401
    assert "incorrect email address or password" in get_error_message(res).lower()


@pytest.mark.anyio
async def test_login_invalid_email(client: httpx.AsyncClient):
    """10. Test Login with non-existent email returns 401 Unauthorized."""
    res = await client.post("/auth/login", json={
        "email": "nonexistent@healthshare.org",
        "password": "SomePassword123!",
    })
    assert res.status_code == 401
    assert "incorrect email address or password" in get_error_message(res).lower()


@pytest.mark.anyio
async def test_expired_jwt(client: httpx.AsyncClient):
    """11. Test accessing protected endpoint with an expired JWT returns 401 Unauthorized."""
    reg_res = await client.post("/auth/register", json={
        "name": "Bob Patient",
        "email": "bob@healthshare.org",
        "password": "Password123!",
        "role": "patient",
    })
    user_id = reg_res.json()["user"]["id"]

    expired_token = create_access_token(
        subject=user_id,
        role="patient",
        expires_delta=timedelta(seconds=-10),
    )

    res = await client.get("/auth/me", headers={"Authorization": f"Bearer {expired_token}"})
    assert res.status_code == 401


@pytest.mark.anyio
async def test_missing_jwt(client: httpx.AsyncClient):
    """12. Test accessing protected endpoint without JWT returns 401 Unauthorized."""
    res = await client.get("/auth/me")
    assert res.status_code == 401


@pytest.mark.anyio
async def test_wrong_role_access(client: httpx.AsyncClient):
    """13. Test Role-Based Authorization: Patient attempting to access Doctor endpoint returns 403 Forbidden."""
    reg_res = await client.post("/auth/register", json={
        "name": "Patient One",
        "email": "patient1@healthshare.org",
        "password": "PatientSecret123!",
        "role": "patient",
    })
    login_res = await client.post("/auth/login", json={
        "email": "patient1@healthshare.org",
        "password": "PatientSecret123!",
    })
    token = login_res.json()["access_token"]

    # Attempt to access Doctor Dashboard API
    res = await client.get("/dashboard/doctor", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 403


@pytest.mark.anyio
async def test_inactive_user(client: httpx.AsyncClient):
    """14. Test Inactive User account: Login and endpoint access return 403 Forbidden."""
    reg_res = await client.post("/auth/register", json={
        "name": "Inactive User",
        "email": "inactive@healthshare.org",
        "password": "InactivePass123!",
        "role": "patient",
    })
    user_id = reg_res.json()["user"]["id"]

    # Deactivate user in test DB
    async with TestingSessionLocal() as session:
        result = await session.execute(select(User).filter(User.id == user_id))
        user = result.scalars().first()
        user.is_active = False
        await session.commit()

    # Login attempt
    res_login = await client.post("/auth/login", json={
        "email": "inactive@healthshare.org",
        "password": "InactivePass123!",
    })
    assert res_login.status_code == 403
    assert "inactive" in get_error_message(res_login).lower()
