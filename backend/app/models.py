from __future__ import annotations
import enum
from datetime import datetime, timezone
from typing import List, Optional

from sqlalchemy import (
    BigInteger,
    Boolean,
    DateTime,
    Enum,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.ext.asyncio import AsyncAttrs
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


# ----------------------------------------------------------------------
# 1. Base Class with AsyncAttrs
# ----------------------------------------------------------------------
class Base(AsyncAttrs, DeclarativeBase):
    """
    SQLAlchemy 2.x Declarative Base for HealthShare schema.
    Inherits AsyncAttrs to enable clean async relationship lazy-loading where needed.
    """
    pass


# ----------------------------------------------------------------------
# 2. Timestamp Mixin
# ----------------------------------------------------------------------
class TimestampMixin:
    """
    Reusable Mixin adding timezone-aware creation and update timestamps.
    Required for healthcare compliance and audit trails.
    """
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )


# ----------------------------------------------------------------------
# 3. User Role Enum
# ----------------------------------------------------------------------
class UserRole(str, enum.Enum):
    """
    Role-Based Access Control (RBAC) user roles.
    """
    PATIENT = "patient"
    DOCTOR = "doctor"
    RESEARCHER = "researcher"
    ADMIN = "admin"


# ----------------------------------------------------------------------
# 4. User Model
# ----------------------------------------------------------------------
class User(Base, TimestampMixin):
    """
    User Table: Primary identity and authentication anchor.
    Represents Patients, Doctors, Researchers, and System Administrators.
    """
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(
        BigInteger().with_variant(Integer, "sqlite"),
        primary_key=True,
        autoincrement=True,
        index=True,
        comment="Unique user ID (64-bit BigInteger)",
    )
    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        nullable=False,
        index=True,
        comment="Unique user email for authentication",
    )
    hashed_password: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        comment="Argon2id/Bcrypt hashed password",
    )
    full_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        comment="User's full legal name",
    )
    role: Mapped[UserRole] = mapped_column(
        Enum(UserRole, native_enum=False, length=50),
        nullable=False,
        default=UserRole.PATIENT,
        index=True,
        comment="User role (patient, doctor, researcher, admin)",
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
        comment="Account active status for soft disabling",
    )
    is_verified: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
        comment="Email/identity verification flag",
    )

    # Relationships
    records: Mapped[List[MedicalRecord]] = relationship(
        "MedicalRecord",
        back_populates="patient",
        cascade="all, delete-orphan",
        foreign_keys="[MedicalRecord.patient_id]",
    )
    consents: Mapped[List[Consent]] = relationship(
        "Consent",
        back_populates="doctor",
        cascade="all, delete-orphan",
        foreign_keys="[Consent.doctor_id]",
    )
    access_requests_sent: Mapped[List[AccessRequest]] = relationship(
        "AccessRequest",
        back_populates="requester",
        foreign_keys="[AccessRequest.requester_id]",
    )
    access_requests_received: Mapped[List[AccessRequest]] = relationship(
        "AccessRequest",
        back_populates="patient",
        foreign_keys="[AccessRequest.patient_id]",
    )
    cohort_queries: Mapped[List[CohortQuery]] = relationship(
        "CohortQuery",
        back_populates="researcher",
        foreign_keys="[CohortQuery.researcher_id]",
    )

    def __repr__(self) -> str:
        return f"<User(id={self.id}, email='{self.email}', role='{self.role}')>"


# ----------------------------------------------------------------------
# Stub models for system compatibility
# ----------------------------------------------------------------------
class MedicalRecord(Base, TimestampMixin):
    __tablename__ = "medical_records"
    id: Mapped[int] = mapped_column(BigInteger().with_variant(Integer, "sqlite"), primary_key=True, autoincrement=True, index=True)
    patient_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    category: Mapped[str] = mapped_column(String(100), nullable=False)
    file_path: Mapped[str] = mapped_column(String(500), nullable=False)
    file_size: Mapped[str] = mapped_column(String(50), nullable=False)

    # Relationships
    patient: Mapped[User] = relationship("User", back_populates="records", foreign_keys=[patient_id])
    consents: Mapped[List[Consent]] = relationship("Consent", back_populates="record", cascade="all, delete-orphan")
    access_requests: Mapped[List[AccessRequest]] = relationship("AccessRequest", back_populates="record")


class Consent(Base, TimestampMixin):
    __tablename__ = "consents"
    id: Mapped[int] = mapped_column(BigInteger().with_variant(Integer, "sqlite"), primary_key=True, autoincrement=True, index=True)
    record_id: Mapped[int] = mapped_column(ForeignKey("medical_records.id"), nullable=False)
    doctor_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)

    # Relationships
    record: Mapped[MedicalRecord] = relationship("MedicalRecord", back_populates="consents", foreign_keys=[record_id])
    doctor: Mapped[User] = relationship("User", back_populates="consents", foreign_keys=[doctor_id])


class AccessRequest(Base, TimestampMixin):
    __tablename__ = "access_requests"
    id: Mapped[int] = mapped_column(BigInteger().with_variant(Integer, "sqlite"), primary_key=True, autoincrement=True, index=True)
    requester_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    patient_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    record_id: Mapped[Optional[int]] = mapped_column(ForeignKey("medical_records.id"), nullable=True)
    reason: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="Pending")

    # Relationships
    requester: Mapped[User] = relationship("User", back_populates="access_requests_sent", foreign_keys=[requester_id])
    patient: Mapped[User] = relationship("User", back_populates="access_requests_received", foreign_keys=[patient_id])
    record: Mapped[Optional[MedicalRecord]] = relationship("MedicalRecord", back_populates="access_requests", foreign_keys=[record_id])


class CohortQuery(Base, TimestampMixin):
    __tablename__ = "cohort_queries"
    id: Mapped[int] = mapped_column(BigInteger().with_variant(Integer, "sqlite"), primary_key=True, autoincrement=True, index=True)
    researcher_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    disease_focus: Mapped[str] = mapped_column(String(100), nullable=False)
    patient_count: Mapped[int] = mapped_column(Integer, nullable=False)
    justification: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="Pending")
    sandbox_size: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)

    # Relationships
    researcher: Mapped[User] = relationship("User", back_populates="cohort_queries", foreign_keys=[researcher_id])


class AuditLog(Base):
    __tablename__ = "audit_logs"
    id: Mapped[int] = mapped_column(BigInteger().with_variant(Integer, "sqlite"), primary_key=True, autoincrement=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    action: Mapped[str] = mapped_column(String(255), nullable=False)
    details: Mapped[str] = mapped_column(Text, nullable=False)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class PredictionRecord(Base, TimestampMixin):
    __tablename__ = "prediction_records"
    id: Mapped[int] = mapped_column(BigInteger().with_variant(Integer, "sqlite"), primary_key=True, autoincrement=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    disease_focus: Mapped[str] = mapped_column(String(100), nullable=False)
    target_year: Mapped[int] = mapped_column(Integer, nullable=False)
    predicted_value: Mapped[float] = mapped_column(Float, nullable=False)

