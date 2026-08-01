# 🏥 HealthShare — Healthcare Data Exchange & AI Medical Platform

HealthShare is a production-grade healthcare data exchange, appointment management, role-based access control (RBAC), and AI-powered medical report analysis platform built with **React, TypeScript, FastAPI, SQLAlchemy, MySQL, and Google Gemini 2.5 Flash**.

---

## 🌟 Key Features

* 🔐 **Authentication & Security**: JWT authentication with refresh token rotation and 4 role levels (**Patient**, **Doctor**, **Researcher**, **Admin**).
* 📑 **My Medical Records Module**: Secure document vault for PDF/Image medical reports with complete CRUD, encrypted file download, and metadata management.
* 🤖 **Automated Gemini 2.5 Flash Analysis**: Multimodal extraction of patient details, hospital metadata, lab biomarker test results, clinical impressions, and doctor recommendations upon upload.
* 📊 **Medical Report Details Page (`/records/:recordId`)**: Dedicated report viewer featuring zoom/fullscreen controls, structured biomarker tables with color status badges (`Normal`, `High`, `Low`), and future-ready ML prediction extension slots.
* 🗓️ **Doctor Practice & Appointments**: Complete appointment scheduling, patient consent access management, and AI risk review dashboard.

---

## 🚀 System Requirements

Before running the project, ensure you have the following installed on your machine:

* **Node.js**: `v18.0.0` or higher ([Download Node.js](https://nodejs.org/))
* **Python**: `3.9` or higher ([Download Python](https://www.python.org/))
* **MySQL Server**: `8.0` or higher (e.g., MySQL Workbench or XAMPP)
* **Git**: Installed and configured

---

## 🛠️ Step-by-Step Setup Guide

Follow these steps to get the project running locally on your computer.

### Step 1: Clone the Project
```bash
git clone <repository-url>
cd MajorProject
```

---

### Step 2: Environment Variables Setup (`.env`)

Create a `.env` file in the root directory (`MajorProject/.env`):

```env
# ----------------------------------------------------------------------
# Database Configuration
# ----------------------------------------------------------------------
# For MySQL Database:
DATABASE_URL=mysql+aiomysql://root:password@localhost:3306/healthshare

# SQLite Fallback (Optional for quick local testing without MySQL):
# DATABASE_URL=sqlite+aiosqlite:///./healthshare.db

# ----------------------------------------------------------------------
# Security & JWT Authentication
# ----------------------------------------------------------------------
SECRET_KEY=healthshare_super_secret_jwt_token_key_change_in_production_32chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# ----------------------------------------------------------------------
# Google Gemini AI Integration
# ----------------------------------------------------------------------
GEMINI_API_KEY=your_gemini_api_key_here
```

> 💡 **Note**: Replace `root:password` with your MySQL username and password. Insert your Google Gemini API Key under `GEMINI_API_KEY`.

---

### Step 3: Backend Setup (FastAPI)

1. Open your terminal and navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   * **Windows**:
     ```powershell
     python -m venv venv
     .\venv\Scripts\activate
     ```
   * **macOS / Linux**:
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```

3. Install required Python packages:
   ```bash
   pip install -r requirements.txt
   ```

4. Create the MySQL Database (if using MySQL):
   Open MySQL CLI / Workbench and run:
   ```sql
   CREATE DATABASE IF NOT EXISTS healthshare;
   ```

5. Run Alembic Database Migrations:
   ```bash
   python -m alembic upgrade head
   ```

6. Start the FastAPI Backend Server:
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

   * Backend API Server: `http://localhost:8000`
   * Interactive Swagger Documentation: `http://localhost:8000/docs`

---

### Step 4: Frontend Setup (React + Vite + TypeScript)

Open a **new terminal window** and follow these steps:

1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Frontend Development Server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to:
   `http://localhost:5173`

---

## 🧪 Running Verification Tests

### Backend Pytest Suite
To run all backend unit tests and verified API routes:
```bash
cd backend
pytest
```

### Frontend TypeScript Check
To verify frontend TypeScript types:
```bash
cd frontend
npx tsc --noEmit
```

---

## 📂 Project Architecture

```
MajorProject/
├── backend/                  # FastAPI Application
│   ├── alembic/              # Database Migration Revisions
│   ├── app/
│   │   ├── middleware/       # JWT & CORS Authentication Middleware
│   │   ├── models/           # SQLAlchemy Data Models
│   │   ├── repositories/     # Data Access Layer
│   │   ├── routes/           # REST API Route Controllers
│   │   ├── schemas/          # Pydantic Data Validation Schemas
│   │   ├── services/         # Business Logic & Gemini AI Parser
│   │   ├── config.py         # App Environment Settings
│   │   ├── database.py       # Database Session Factory
│   │   └── main.py           # FastAPI Application Entrypoint
│   └── requirements.txt      # Python Dependencies
├── frontend/                 # React TypeScript Application
│   ├── src/
│   │   ├── components/       # UI Cards, Modals, FileUpload, Layout
│   │   ├── config/           # Navigation & Roles Configuration
│   │   ├── context/          # Auth & Navigation Context
│   │   ├── pages/            # Dashboard & Medical Report Details Pages
│   │   ├── services/         # Axios API Services (Medical Records, Auth)
│   │   └── App.tsx           # React Router Routes Definition
│   ├── package.json          # Node Dependencies
│   └── vite.config.ts        # Vite Build Configuration
├── .env                      # Global Environment Variables
└── README.md                 # Project Setup & Documentation
```

---

## 🔐 Role Access Summary

| Role | Default Capabilities |
| :--- | :--- |
| **Patient** | Upload medical reports, view AI extractions, manage consents, run CKD predictions |
| **Doctor** | Access shared patient records, review AI insights, manage appointments |
| **Researcher** | Explore anonymized datasets and submit research cohort requests |
| **Admin** | System governance, audit log monitoring, user role management |

---

## 🤝 Troubleshooting & Common Fixes

1. **MySQL Connection Error**:
   * Verify MySQL is running on port `3306`.
   * Check username and password in `.env` (`DATABASE_URL`).
2. **Gemini API Warnings / Reprocessing**:
   * Ensure `GEMINI_API_KEY` is present in `.env`.
   * If Gemini fails during upload, the report is saved safely as `Processing Failed` and can be reprocessed via the **Reprocess AI** button.
3. **CORS / Port Mismatch**:
   * Backend defaults to port `8000` and frontend defaults to port `5173`.
