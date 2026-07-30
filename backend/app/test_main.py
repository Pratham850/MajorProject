import pytest
import httpx



@pytest.mark.anyio
async def test_healthz(client):
    response = await client.get("/healthz")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


@pytest.mark.anyio
async def test_register_login_flow(client):
    # 1. Register Patient
    reg_response = await client.post("/auth/register", json={
        "full_name": "Jane Doe",
        "email": "jane@example.com",
        "password": "Password123!",
        "role": "patient"
    })
    assert reg_response.status_code == 201
    assert reg_response.json()["full_name"] == "Jane Doe"
    assert reg_response.json()["email"] == "jane@example.com"
    assert reg_response.json()["role"] == "patient"

    # 2. Login Patient
    login_response = await client.post("/auth/login", json={
        "email": "jane@example.com",
        "password": "Password123!"
    })
    assert login_response.status_code == 200
    assert "access_token" in login_response.json()
    assert "refresh_token" in login_response.json()
    assert login_response.json()["user"]["full_name"] == "Jane Doe"

    # 3. Fail Login
    failed_login = await client.post("/auth/login", json={
        "email": "jane@example.com",
        "password": "WrongPassword!"
    })
    assert failed_login.status_code == 401


@pytest.mark.anyio
async def test_user_profile_and_admin_flows(client):
    # 1. Register Admin
    reg_admin = await client.post("/auth/register", json={
        "full_name": "Admin User",
        "email": "admin@example.com",
        "password": "AdminPassword123!",
        "role": "admin"
    })
    assert reg_admin.status_code == 201

    # 2. Login Admin
    login_admin = await client.post("/auth/login", json={
        "email": "admin@example.com",
        "password": "AdminPassword123!"
    })
    admin_token = login_admin.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # 3. Register Patient
    reg_patient = await client.post("/auth/register", json={
        "full_name": "Patient User",
        "email": "patient@example.com",
        "password": "PatientPassword123!",
        "role": "patient"
    })
    assert reg_patient.status_code == 201
    patient_id = reg_patient.json()["id"]

    # 4. Login Patient
    login_patient = await client.post("/auth/login", json={
        "email": "patient@example.com",
        "password": "PatientPassword123!"
    })
    patient_token = login_patient.json()["access_token"]
    patient_headers = {"Authorization": f"Bearer {patient_token}"}

    # 5. Get profile
    get_prof = await client.get("/users/profile", headers=patient_headers)
    assert get_prof.status_code == 200
    assert get_prof.json()["full_name"] == "Patient User"

    # 6. Update profile
    up_prof = await client.put("/users/profile", json={"full_name": "Updated Patient Name"}, headers=patient_headers)
    assert up_prof.status_code == 200
    assert up_prof.json()["full_name"] == "Updated Patient Name"

    # 7. Change password
    chg_pwd = await client.post("/users/change-password", json={
        "current_password": "PatientPassword123!",
        "new_password": "NewPatientPassword123!"
    }, headers=patient_headers)
    assert chg_pwd.status_code == 200

    # Verify old login fails, new login succeeds
    old_login = await client.post("/auth/login", json={
        "email": "patient@example.com",
        "password": "PatientPassword123!"
    })
    assert old_login.status_code == 401

    new_login = await client.post("/auth/login", json={
        "email": "patient@example.com",
        "password": "NewPatientPassword123!"
    })
    assert new_login.status_code == 200

    # 8. Admin List Users
    list_users = await client.get("/users/admin/users", headers=admin_headers)
    assert list_users.status_code == 200
    assert len(list_users.json()) >= 2

    # 9. Admin Disable User
    disable_user = await client.put(f"/users/admin/users/{patient_id}/status", json={"is_active": False}, headers=admin_headers)
    assert disable_user.status_code == 200
    assert disable_user.json()["is_active"] is False

    # 10. Login disabled user should fail
    disabled_login = await client.post("/auth/login", json={
        "email": "patient@example.com",
        "password": "NewPatientPassword123!"
    })
    assert disabled_login.status_code == 403


@pytest.mark.anyio
async def test_medical_record_flows(client):
    # 1. Register and login patient
    await client.post("/auth/register", json={
        "full_name": "Test Patient",
        "email": "testpatient@example.com",
        "password": "Password123!",
        "role": "patient"
    })
    login_res = await client.post("/auth/login", json={
        "email": "testpatient@example.com",
        "password": "Password123!"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Upload file
    files = {"file": ("report.pdf", b"pdf content dummy", "application/pdf")}
    data = {"title": "Lab Report A", "category": "Lab Report"}
    up_res = await client.post("/records/upload", data=data, files=files, headers=headers)
    assert up_res.status_code == 201
    record_id = up_res.json()["id"]

    # 3. List records
    list_res = await client.get("/records", headers=headers)
    assert list_res.status_code == 200
    assert len(list_res.json()) >= 1

    # 4. Get record details
    get_res = await client.get(f"/records/{record_id}", headers=headers)
    assert get_res.status_code == 200

    # 5. Download record file
    dl_res = await client.get(f"/records/{record_id}/download", headers=headers)
    assert dl_res.status_code == 200
    assert dl_res.content == b"pdf content dummy"

    # 6. Update record metadata
    up_meta = await client.put(f"/records/{record_id}", json={"title": "Updated Lab Report Name"}, headers=headers)
    assert up_meta.status_code == 200

    # 7. Delete record
    del_res = await client.delete(f"/records/{record_id}", headers=headers)
    assert del_res.status_code == 200


@pytest.mark.anyio
async def test_consent_and_access_requests_flows(client):
    # 1. Register Patient & Doctor
    await client.post("/auth/register", json={
        "full_name": "Patient One",
        "email": "pat1@example.com",
        "password": "Password123!",
        "role": "patient"
    })
    await client.post("/auth/register", json={
        "full_name": "Doctor Smith",
        "email": "docsmith@example.com",
        "password": "Password123!",
        "role": "doctor"
    })

    p_login = await client.post("/auth/login", json={"email": "pat1@example.com", "password": "Password123!"})
    d_login = await client.post("/auth/login", json={"email": "docsmith@example.com", "password": "Password123!"})

    p_token = p_login.json()["access_token"]
    d_token = d_login.json()["access_token"]

    p_headers = {"Authorization": f"Bearer {p_token}"}
    d_headers = {"Authorization": f"Bearer {d_token}"}

    # 2. Patient uploads record
    files = {"file": ("blood.pdf", b"blood sample data", "application/pdf")}
    rec_res = await client.post("/records/upload", data={"title": "Blood Test", "category": "Lab Report"}, files=files, headers=p_headers)
    rec_id = rec_res.json()["id"]

    # 3. Doctor submits access request
    req_res = await client.post("/access-requests", json={
        "patient_email": "pat1@example.com",
        "record_title": "Blood Test",
        "reason": "Cardiology consultation"
    }, headers=d_headers)
    assert req_res.status_code == 201
    req_id = req_res.json()["id"]

    # 4. Patient lists access requests & approves
    p_reqs = await client.get("/access-requests", headers=p_headers)
    assert p_reqs.status_code == 200
    assert len(p_reqs.json()) >= 1

    app_res = await client.put(f"/access-requests/{req_id}/status", json={"status": "Approved"}, headers=p_headers)
    assert app_res.status_code == 200
    assert app_res.json()["status"] == "Approved"

    # 5. List active consents
    consents_res = await client.get("/consents", headers=p_headers)
    assert consents_res.status_code == 200
    assert len(consents_res.json()) >= 1


@pytest.mark.anyio
async def test_prediction_research_and_dashboards(client):
    # 1. Register Researcher & Admin
    await client.post("/auth/register", json={
        "full_name": "Researcher Alice",
        "email": "alice@research.com",
        "password": "Password123!",
        "role": "researcher"
    })
    await client.post("/auth/register", json={
        "full_name": "System Admin",
        "email": "sysadmin@healthshare.com",
        "password": "Password123!",
        "role": "admin"
    })

    r_login = await client.post("/auth/login", json={"email": "alice@research.com", "password": "Password123!"})
    a_login = await client.post("/auth/login", json={"email": "sysadmin@healthshare.com", "password": "Password123!"})

    r_headers = {"Authorization": f"Bearer {r_login.json()['access_token']}"}
    a_headers = {"Authorization": f"Bearer {a_login.json()['access_token']}"}

    # 2. Prediction endpoint
    pred_res = await client.post("/ml/predict", json={"disease": "Oncology", "year": 2028}, headers=r_headers)
    assert pred_res.status_code == 200
    assert pred_res.json()["disease"] == "Oncology"

    # 3. Retrieve history
    hist_res = await client.get("/ml/history", headers=r_headers)
    assert hist_res.status_code == 200
    assert len(hist_res.json()) >= 1

    # 4. Cohort query submission
    cq_res = await client.post("/research/cohort-query", json={
        "title": "Neurology Study",
        "patientCount": 5000,
        "diseaseFocus": "Neurology",
        "justification": "Evaluating Alzheimer progression markers."
    }, headers=r_headers)
    assert cq_res.status_code == 201
    query_id = cq_res.json()["id"]

    # 5. Get anonymized results
    results_res = await client.get(f"/research/queries/{query_id}/results", headers=r_headers)
    assert results_res.status_code == 200
    assert results_res.json()["diseaseFocus"] == "Neurology"

    # 6. Dashboards
    r_dash = await client.get("/dashboard/researcher", headers=r_headers)
    assert r_dash.status_code == 200

    a_dash = await client.get("/dashboard/admin", headers=a_headers)
    assert a_dash.status_code == 200

    # 7. Audit logs
    audit_res = await client.get("/audit-logs", headers=a_headers)
    assert audit_res.status_code == 200
    assert len(audit_res.json()) >= 1
