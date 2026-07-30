from __future__ import annotations
from typing import Optional
from pydantic import BaseModel, ConfigDict


class PatientProfileSchema(BaseModel):
  name: str
  healthIndex: int = 98


class PatientSummarySchema(BaseModel):
  medicalRecords: int
  appointments: int = 0
  activeConsents: int
  notifications: int = 0
  latestCkdRisk: Optional[str] = "Low Risk (8.2%)"
  nextAppointment: Optional[str] = "Tomorrow, 10:30 AM"


class PatientDashboardResponse(BaseModel):
  profile: PatientProfileSchema
  summary: PatientSummarySchema

  # Legacy / Root level fields for backward compatibility
  totalFilesCount: int
  activeConsentCount: int
  pendingRequestsCount: int
  securityStandard: str = "AES-256 / SHA-256"

  model_config = ConfigDict(from_attributes=True)


class DoctorDashboardResponse(BaseModel):
  totalPatients: int
  activeConsults: int
  recordsShared: int
  appointments: int

  model_config = ConfigDict(from_attributes=True)


class ResearcherDashboardResponse(BaseModel):
  unlockedDatasets: int
  activeQueries: int
  patientCohort: int
  modelAccuracy: str = "96.5%"

  model_config = ConfigDict(from_attributes=True)


class AdminDashboardResponse(BaseModel):
  totalUsersCount: int
  totalMedicalRecords: int
  totalConsentsGranted: int
  totalAuditLogs: int
  systemHealth: str = "100% Operational"

  model_config = ConfigDict(from_attributes=True)
