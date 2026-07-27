from __future__ import annotations
import os

from pathlib import Path
from pydantic.v1 import BaseSettings, Field, RedisDsn




from typing import Optional

class Settings(BaseSettings):
    # Core
    PROJECT_NAME: str = Field(default="HealthShare Backend", env="PROJECT_NAME")
    DEBUG: bool = Field(default=False, env="DEBUG")

    # Database (MySQL)
    MYSQL_USER: str = Field(..., env="MYSQL_USER")
    MYSQL_PASSWORD: str = Field(..., env="MYSQL_PASSWORD")
    MYSQL_HOST: str = Field(..., env="MYSQL_HOST")
    MYSQL_PORT: int = Field(default=3306, env="MYSQL_PORT")
    MYSQL_DB: str = Field(..., env="MYSQL_DB")
    DATABASE_URL: Optional[str] = None


    # Redis (optional)
    REDIS_URL: RedisDsn = Field(default="redis://localhost:6379/0", env="REDIS_URL")

    # JWT
    JWT_SECRET_KEY: str = Field(..., env="JWT_SECRET_KEY")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=30, env="ACCESS_TOKEN_EXPIRE_MINUTES")
    REFRESH_TOKEN_EXPIRE_DAYS: int = Field(default=7, env="REFRESH_TOKEN_EXPIRE_DAYS")

    # External services (placeholders)
    STRIPE_API_KEY: str = Field(default="sk_test_placeholder", env="STRIPE_API_KEY")
    TWILIO_ACCOUNT_SID: str = Field(default="ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX", env="TWILIO_ACCOUNT_SID")
    TWILIO_AUTH_TOKEN: str = Field(default="your_auth_token", env="TWILIO_AUTH_TOKEN")
    SENDGRID_API_KEY: str = Field(default="SG.xxxxxxxx", env="SENDGRID_API_KEY")
    FHIR_BASE_URL: str = Field(default="https://fhir.example.com", env="FHIR_BASE_URL")

    class Config:
        case_sensitive = False
        env_file = Path(__file__).parent.parent.parent / ".env"
        env_file_encoding = "utf-8"

    @property
    def sqlalchemy_database_url(self) -> str:
        if self.DATABASE_URL:
            return str(self.DATABASE_URL)
        # Build MySQL async DSN
        return f"mysql+aiomysql://{self.MYSQL_USER}:{self.MYSQL_PASSWORD}@{self.MYSQL_HOST}:{self.MYSQL_PORT}/{self.MYSQL_DB}"

settings = Settings()
