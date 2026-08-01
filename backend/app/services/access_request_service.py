from __future__ import annotations
from typing import Any, Dict, List
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import User, AuditLog
from app.repositories.access_request_repository import AccessRequestRepository
from app.repositories.consent_repository import ConsentRepository
from app.repositories.record_repository import RecordRepository
from app.repositories.user_repository import UserRepository
from app.schemas.access_requests import CreateAccessRequest, UpdateAccessRequestStatus


class AccessRequestService:
    """
    Service layer containing business logic for Doctor Access Requests,
    Patient approvals/rejections, auto-granting consent on approval, and Audit Logging.
    """

    def __init__(
        self,
        access_req_repo: AccessRequestRepository,
        user_repo: UserRepository,
        record_repo: RecordRepository,
        consent_repo: ConsentRepository,
        db: AsyncSession,
    ):
        self.access_req_repo = access_req_repo
        self.user_repo = user_repo
        self.record_repo = record_repo
        self.consent_repo = consent_repo
        self.db = db

    async def create_request(self, current_user: User, req_data: CreateAccessRequest) -> Dict[str, Any]:
        """
        Business Logic:
        1. Verifies requester is a Doctor.
        2. Queries target patient by email.
        3. Matches record by title if specified.
        4. Creates AccessRequest in 'Pending' state.
        5. Writes AuditLog record.
        """
        patient = await self.user_repo.get_by_email(req_data.patient_email)
        if not patient:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Patient with specified email address not found.",
            )

        matched_record_id = None
        if req_data.record_title:
            patient_records = await self.record_repo.list_by_patient(patient.id)
            for rec in patient_records:
                if rec.title.lower() == req_data.record_title.lower():
                    matched_record_id = rec.id
                    break

        new_req = await self.access_req_repo.create(
            requester_id=current_user.id,
            patient_id=patient.id,
            record_id=matched_record_id,
            reason=req_data.reason,
            status="Pending",
        )

        audit = AuditLog(
            user_id=current_user.id,
            action="Access Requested",
            details=f"Doctor '{current_user.full_name}' requested access from Patient '{patient.full_name}' ({patient.email}). Reason: '{req_data.reason}'.",
        )
        self.db.add(audit)
        await self.db.commit()
        await self.db.refresh(new_req)

        return {
            "id": f"req-{new_req.id}",
            "doctorName": current_user.full_name,
            "doctorEmail": current_user.email,
            "patientName": patient.full_name,
            "patientEmail": patient.email,
            "recordTitle": req_data.record_title or "All Medical Records",
            "reason": new_req.reason,
            "status": new_req.status,
            "dateRequested": new_req.created_at.strftime("%Y-%m-%d"),
        }

    async def list_requests(self, current_user: User) -> List[Dict[str, Any]]:
        """
        Retrieves pending & historic access requests for patient or doctor.
        """
        user_role = current_user.role if isinstance(current_user.role, str) else current_user.role.value

        if user_role == "patient" or user_role == "PATIENT":
            requests = await self.access_req_repo.list_by_patient(current_user.id)
            return [
                {
                    "id": f"req-{r.id}",
                    "doctorName": r.requester.full_name if r.requester else "Doctor",
                    "doctorEmail": r.requester.email if r.requester else "",
                    "recordTitle": r.record.title if r.record else "All Medical Records",
                    "reason": r.reason,
                    "status": r.status,
                    "dateRequested": r.created_at.strftime("%Y-%m-%d"),
                }
                for r in requests
            ]

        elif user_role == "doctor" or user_role == "DOCTOR":
            requests = await self.access_req_repo.list_by_doctor(current_user.id)
            return [
                {
                    "id": f"req-{r.id}",
                    "patientName": r.patient.full_name if r.patient else "Patient",
                    "patientEmail": r.patient.email if r.patient else "",
                    "recordTitle": r.record.title if r.record else "All Medical Records",
                    "reason": r.reason,
                    "status": r.status,
                    "dateRequested": r.created_at.strftime("%Y-%m-%d"),
                }
                for r in requests
            ]

        return []

    async def update_request_status(
        self,
        request_id_str: str,
        status_data: UpdateAccessRequestStatus,
        current_user: User,
    ) -> Dict[str, Any]:
        """
        Business Logic:
        1. Verify target patient owns request.
        2. Update status to 'Approved' or 'Rejected'.
        3. If Approved, auto-grant Consent relation!
        4. Writes compliance AuditLog record.
        """
        try:
            req_id = int(request_id_str.replace("req-", ""))
        except ValueError:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid request ID format.")

        access_req = await self.access_req_repo.get_by_id(req_id)
        if not access_req:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Access request not found.")

        if access_req.patient_id != current_user.id and current_user.role not in ["admin", "ADMIN"]:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only target patient can update request status.")

        new_status = status_data.status.capitalize()
        if new_status not in ["Approved", "Rejected"]:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Status must be 'Approved' or 'Rejected'.")

        await self.access_req_repo.update_status(access_req, new_status)

        # Auto-grant consent if approved
        if new_status == "Approved":
            record_ids = []
            if access_req.record_id:
                record_ids.append(access_req.record_id)
            else:
                patient_records = await self.record_repo.list_by_patient(access_req.patient_id)
                record_ids = [r.id for r in patient_records]

            for rec_id in record_ids:
                existing = await self.consent_repo.get_existing(rec_id, access_req.requester_id)
                if not existing:
                    await self.consent_repo.create(rec_id, access_req.requester_id)

        audit = AuditLog(
            user_id=current_user.id,
            action=f"Access Request {new_status}",
            details=f"Patient '{current_user.full_name}' {new_status.lower()} access request 'req-{req_id}' from Doctor ID {access_req.requester_id}.",
        )
        self.db.add(audit)
        await self.db.commit()

        return {
            "id": f"req-{access_req.id}",
            "doctorName": access_req.requester.full_name if access_req.requester else "Doctor",
            "patientName": current_user.full_name,
            "status": access_req.status,
            "message": f"Access request successfully updated to {access_req.status}.",
        }
