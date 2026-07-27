from __future__ import annotations
from typing import Optional
from pydantic import BaseModel, ConfigDict


class PatientDashboardResponse(BaseModel):
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
