from __future__ import annotations
import enum
from datetime import date, datetime, time, timezone
from typing import List, Optional

from sqlalchemy import (
    BigInteger,
    Boolean,
    Date,
    DateTime,
    Enum,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    Time,
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
# 3. Enums
# ----------------------------------------------------------------------
class UserRole(str, enum.Enum):
    """
    Role-Based Access Control (RBAC) user roles.
    """
    PATIENT = "patient"
    DOCTOR = "doctor"
    RESEARCHER = "researcher"
    ADMIN = "admin"


class AppointmentStatus(str, enum.Enum):
    """
    Appointment lifecycle states.
    """
    PENDING = "Pending"
    ACCEPTED = "Accepted"
    REJECTED = "Rejected"
    COMPLETED = "Completed"
    CANCELLED = "Cancelled"


class NotificationType(str, enum.Enum):
    """
    Notification event categories.
    """
    APPOINTMENT = "Appointment"
    MEDICAL_RECORD = "Medical Record"
    CONSENT = "Consent"
    AI_PREDICTION = "AI Prediction"
    RESEARCH = "Research"
    SYSTEM = "System"


class PredictionType(str, enum.Enum):
    """
    Supported AI predictive analytics models.
    """
    KIDNEY_DISEASE = "Kidney Disease"
    HEART_DISEASE = "Heart Disease"
    DIABETES = "Diabetes"


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
    patient_profile: Mapped[Optional[PatientProfile]] = relationship(
        "PatientProfile",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan",
    )
    doctor_profile: Mapped[Optional[DoctorProfile]] = relationship(
        "DoctorProfile",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan",
    )
    researcher_profile: Mapped[Optional[ResearcherProfile]] = relationship(
        "ResearcherProfile",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan",
    )
    appointments_as_patient: Mapped[List[Appointment]] = relationship(
        "Appointment",
        back_populates="patient",
        foreign_keys="[Appointment.patient_id]",
        cascade="all, delete-orphan",
    )
    appointments_as_doctor: Mapped[List[Appointment]] = relationship(
        "Appointment",
        back_populates="doctor",
        foreign_keys="[Appointment.doctor_id]",
        cascade="all, delete-orphan",
    )
    notifications: Mapped[List[Notification]] = relationship(
        "Notification",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    ai_predictions: Mapped[List[AIPrediction]] = relationship(
        "AIPrediction",
        back_populates="patient",
        cascade="all, delete-orphan",
    )
    prescriptions_given: Mapped[List[Prescription]] = relationship(
        "Prescription",
        back_populates="doctor",
        foreign_keys="[Prescription.doctor_id]",
        cascade="all, delete-orphan",
    )
    prescriptions_received: Mapped[List[Prescription]] = relationship(
        "Prescription",
        back_populates="patient",
        foreign_keys="[Prescription.patient_id]",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return f"<User(id={self.id}, email='{self.email}', role='{self.role}')>"


# ----------------------------------------------------------------------
# Core Domain Models
# ----------------------------------------------------------------------
class MedicalRecord(Base, TimestampMixin):
    __tablename__ = "medical_records"
    id: Mapped[int] = mapped_column(BigInteger().with_variant(Integer, "sqlite"), primary_key=True, autoincrement=True, index=True)
    patient_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    category: Mapped[str] = mapped_column(String(100), nullable=False)
    file_path: Mapped[str] = mapped_column(String(500), nullable=False)
    file_size: Mapped[str] = mapped_column(String(50), nullable=False)
    extracted_data: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Relationships
    patient: Mapped[User] = relationship("User", back_populates="records", foreign_keys=[patient_id])
    consents: Mapped[List[Consent]] = relationship("Consent", back_populates="record", cascade="all, delete-orphan")
    access_requests: Mapped[List[AccessRequest]] = relationship("AccessRequest", back_populates="record")


class Consent(Base, TimestampMixin):
    __tablename__ = "consents"
    id: Mapped[int] = mapped_column(BigInteger().with_variant(Integer, "sqlite"), primary_key=True, autoincrement=True, index=True)
    record_id: Mapped[int] = mapped_column(ForeignKey("medical_records.id"), nullable=False)
    doctor_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="Pending", server_default="Pending", nullable=False)
    purpose: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    approved_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    expires_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

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
    requested_duration: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    expires_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    response_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

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


# ----------------------------------------------------------------------
# Profile Models (One-to-One with User)
# ----------------------------------------------------------------------
class PatientProfile(Base, TimestampMixin):
    __tablename__ = "patient_profiles"

    id: Mapped[int] = mapped_column(
        BigInteger().with_variant(Integer, "sqlite"), primary_key=True, autoincrement=True, index=True
    )
    user_id: Mapped[int] = mapped_column(
        BigInteger().with_variant(Integer, "sqlite"),
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True,
    )
    date_of_birth: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    gender: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    blood_group: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)
    phone: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    address: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    emergency_contact: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    height_cm: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    weight_kg: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    allergies: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    chronic_conditions: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    profile_completed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    user: Mapped[User] = relationship("User", back_populates="patient_profile")


class DoctorProfile(Base, TimestampMixin):
    __tablename__ = "doctor_profiles"

    id: Mapped[int] = mapped_column(
        BigInteger().with_variant(Integer, "sqlite"), primary_key=True, autoincrement=True, index=True
    )
    user_id: Mapped[int] = mapped_column(
        BigInteger().with_variant(Integer, "sqlite"),
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True,
    )
    specialization: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    hospital: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    department: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    license_number: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    experience_years: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    phone: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    bio: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    user: Mapped[User] = relationship("User", back_populates="doctor_profile")


class ResearcherProfile(Base, TimestampMixin):
    __tablename__ = "researcher_profiles"

    id: Mapped[int] = mapped_column(
        BigInteger().with_variant(Integer, "sqlite"), primary_key=True, autoincrement=True, index=True
    )
    user_id: Mapped[int] = mapped_column(
        BigInteger().with_variant(Integer, "sqlite"),
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True,
    )
    institution: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    department: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    designation: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    research_area: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    phone: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)

    user: Mapped[User] = relationship("User", back_populates="researcher_profile")


# ----------------------------------------------------------------------
# Healthcare Platform Domain Models
# ----------------------------------------------------------------------
class Appointment(Base, TimestampMixin):
    __tablename__ = "appointments"

    id: Mapped[int] = mapped_column(
        BigInteger().with_variant(Integer, "sqlite"), primary_key=True, autoincrement=True, index=True
    )
    patient_id: Mapped[int] = mapped_column(
        BigInteger().with_variant(Integer, "sqlite"),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    doctor_id: Mapped[int] = mapped_column(
        BigInteger().with_variant(Integer, "sqlite"),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    appointment_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    appointment_time: Mapped[time] = mapped_column(Time, nullable=False)
    status: Mapped[AppointmentStatus] = mapped_column(
        Enum(AppointmentStatus, native_enum=False, length=50),
        default=AppointmentStatus.PENDING,
        nullable=False,
        index=True,
    )
    reason: Mapped[str] = mapped_column(Text, nullable=False)
    meeting_mode: Mapped[str] = mapped_column(String(50), default="In-Person", nullable=False)
    doctor_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    patient: Mapped[User] = relationship("User", back_populates="appointments_as_patient", foreign_keys=[patient_id])
    doctor: Mapped[User] = relationship("User", back_populates="appointments_as_doctor", foreign_keys=[doctor_id])
    prescriptions: Mapped[List[Prescription]] = relationship("Prescription", back_populates="appointment")


class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[int] = mapped_column(
        BigInteger().with_variant(Integer, "sqlite"), primary_key=True, autoincrement=True, index=True
    )
    user_id: Mapped[int] = mapped_column(
        BigInteger().with_variant(Integer, "sqlite"),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    type: Mapped[NotificationType] = mapped_column(
        Enum(NotificationType, native_enum=False, length=50), nullable=False, index=True
    )
    is_read: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    user: Mapped[User] = relationship("User", back_populates="notifications")


class AIPrediction(Base):
    __tablename__ = "ai_predictions"

    id: Mapped[int] = mapped_column(
        BigInteger().with_variant(Integer, "sqlite"), primary_key=True, autoincrement=True, index=True
    )
    patient_id: Mapped[int] = mapped_column(
        BigInteger().with_variant(Integer, "sqlite"),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    prediction_type: Mapped[PredictionType] = mapped_column(
        Enum(PredictionType, native_enum=False, length=50), nullable=False, index=True
    )
    result: Mapped[str] = mapped_column(String(255), nullable=False)
    confidence: Mapped[float] = mapped_column(Float, nullable=False)
    model_version: Mapped[str] = mapped_column(String(50), nullable=False)
    report_path: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    patient: Mapped[User] = relationship("User", back_populates="ai_predictions")


class Prescription(Base, TimestampMixin):
    __tablename__ = "prescriptions"

    id: Mapped[int] = mapped_column(
        BigInteger().with_variant(Integer, "sqlite"), primary_key=True, autoincrement=True, index=True
    )
    appointment_id: Mapped[Optional[int]] = mapped_column(
        BigInteger().with_variant(Integer, "sqlite"),
        ForeignKey("appointments.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    doctor_id: Mapped[int] = mapped_column(
        BigInteger().with_variant(Integer, "sqlite"),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    patient_id: Mapped[int] = mapped_column(
        BigInteger().with_variant(Integer, "sqlite"),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    diagnosis: Mapped[str] = mapped_column(Text, nullable=False)
    medications: Mapped[str] = mapped_column(Text, nullable=False)
    lab_tests: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    follow_up_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    appointment: Mapped[Optional[Appointment]] = relationship("Appointment", back_populates="prescriptions")
    doctor: Mapped[User] = relationship("User", back_populates="prescriptions_given", foreign_keys=[doctor_id])
    patient: Mapped[User] = relationship("User", back_populates="prescriptions_received", foreign_keys=[patient_id])


