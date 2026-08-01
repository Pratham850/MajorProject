from __future__ import annotations
import re
from typing import Any, Optional, Union
from pydantic import BaseModel, EmailStr, Field, validator, root_validator

from app.models import UserRole
from app.schemas.user import UserResponse


class RegisteredUserSchema(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str

    class Config:
        orm_mode = True


class UserRegisterResponse(BaseModel):
    message: str = "Registration successful"
    user: RegisteredUserSchema


class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(
        ...,
        max_length=128,
        description="Password must be at least 8 characters long with uppercase, lowercase, digit, and special character.",
    )
    confirm_password: Optional[str] = Field(
        None,
        max_length=128,
        description="Optional password confirmation field.",
    )
    full_name: Optional[str] = Field(None, min_length=2, max_length=255)
    name: Optional[str] = Field(None, min_length=2, max_length=255)
    role: UserRole = UserRole.PATIENT

    @validator("email", pre=True)
    def normalize_email(cls, v: str) -> str:
        if isinstance(v, str):
            cleaned = v.strip().lower()
            if not cleaned:
                raise ValueError("Email cannot be empty.")
            return cleaned
        return v

    @validator("full_name", "name", pre=True)
    def trim_name(cls, v: Any) -> Any:
        if isinstance(v, str):
            stripped = v.strip()
            return stripped if stripped else None
        return v

    @validator("role", pre=True)
    def validate_and_normalize_role(cls, v: Any) -> UserRole:
        if isinstance(v, UserRole):
            return v
        if isinstance(v, str):
            normalized = v.strip().lower()
            valid_roles = {r.value: r for r in UserRole}
            if normalized in valid_roles:
                return valid_roles[normalized]
        raise ValueError("Invalid role. Role must be one of: PATIENT, DOCTOR, RESEARCHER, ADMIN")

    @validator("password")
    def validate_password_complexity(cls, v: str) -> str:
        weak_msg = "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character."
        if len(v) < 8 or len(v) > 128:
            raise ValueError(weak_msg)
        if not re.search(r"[A-Z]", v):
            raise ValueError(weak_msg)
        if not re.search(r"[a-z]", v):
            raise ValueError(weak_msg)
        if not re.search(r"[0-9]", v):
            raise ValueError(weak_msg)
        if not re.search(r"[^A-Za-z0-9]", v):
            raise ValueError(weak_msg)
        return v

    @root_validator
    def validate_registration_fields(cls, values: dict) -> dict:
        password = values.get("password")
        confirm_password = values.get("confirm_password")
        if confirm_password is not None and password != confirm_password:
            raise ValueError("Password and confirm password do not match.")

        full_name = values.get("full_name")
        name = values.get("name")
        if not full_name and name:
            values["full_name"] = name
        elif not full_name and not name:
            raise ValueError("Full name is required.")
        return values


class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=1)

    @validator("email", pre=True)
    def normalize_email(cls, v: str) -> str:
        if isinstance(v, str):
            return v.strip().lower()
        return v


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse


class TokenRefreshRequest(BaseModel):
    refresh_token: str = Field(..., description="JWT Refresh Token")


class TokenRefreshResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class MessageResponse(BaseModel):
    message: str

