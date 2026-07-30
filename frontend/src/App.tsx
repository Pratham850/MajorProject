import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NavigationProvider } from './context/NavigationContext';
import { ToastProvider } from './components/ui/toast';
import { Layout } from './components/Layout';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import { PatientDashboard } from './pages/PatientDashboard';
import { MedicalRecordsPage } from './pages/MedicalRecordsPage';
import { AiPredictionPage } from './pages/AiPredictionPage';
import { ConsentManagementPage } from './pages/ConsentManagementPage';
import { DoctorDashboard } from './pages/DoctorDashboard';
import { DoctorAppointmentsPage } from './pages/DoctorAppointmentsPage';
import { DoctorConsultationPage } from './pages/DoctorConsultationPage';
import { AuthorizedPatientsPage } from './pages/AuthorizedPatientsPage';
import { DoctorMedicalRecordsPage } from './pages/DoctorMedicalRecordsPage';
import { DoctorAiReviewPage } from './pages/DoctorAiReviewPage';
import { ResearcherDashboard } from './pages/ResearcherDashboard';
import { DatasetBrowserPage } from './pages/DatasetBrowserPage';
import { ResearchRequestsPage } from './pages/ResearchRequestsPage';
import { ResearchAnalyticsPage } from './pages/ResearchAnalyticsPage';
import { ReportCenterPage } from './pages/ReportCenterPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { UserManagementPage } from './pages/UserManagementPage';
import { AdminConsentPage } from './pages/AdminConsentPage';
import { AdminResearchGovernancePage } from './pages/AdminResearchGovernancePage';
import { AdminSystemMonitoringPage } from './pages/AdminSystemMonitoringPage';
import { PlatformSettingsPage } from './pages/PlatformSettingsPage';
import { DesignSystemShowcase } from './pages/DesignSystemShowcase';
import { ComponentGallery } from './pages/ComponentGallery';

function App() {
  return (
    <AuthProvider>
      <NavigationProvider>
        <ToastProvider>
          <Router>
            <Routes>
              {/* Public Unauthenticated Landing Page Route */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/landing" element={<LandingPage />} />

              {/* Public Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Authenticated Application Shell Routes */}
              <Route path="/app" element={<Layout />} />
              <Route path="/dashboard" element={<Layout />} />
              <Route
                path="/records"
                element={
                  <Layout>
                    <MedicalRecordsPage />
                  </Layout>
                }
              />
              <Route
                path="/ai-prediction"
                element={
                  <Layout>
                    <AiPredictionPage />
                  </Layout>
                }
              />
              <Route
                path="/prediction-history"
                element={
                  <Layout>
                    <AiPredictionPage />
                  </Layout>
                }
              />
              <Route
                path="/consent"
                element={
                  <Layout>
                    <ConsentManagementPage />
                  </Layout>
                }
              />
              <Route path="/notifications" element={<Layout />} />
              <Route
                path="/settings"
                element={
                  <Layout>
                    <PlatformSettingsPage />
                  </Layout>
                }
              />
              <Route
                path="/profile"
                element={
                  <Layout>
                    <PlatformSettingsPage />
                  </Layout>
                }
              />

              {/* Patient Workspace Routes */}
              <Route
                path="/patient-dashboard"
                element={
                  <Layout>
                    <PatientDashboard />
                  </Layout>
                }
              />
              <Route
                path="/medical-history"
                element={
                  <Layout>
                    <MedicalRecordsPage />
                  </Layout>
                }
              />
              <Route
                path="/health-analytics"
                element={
                  <Layout>
                    <PatientDashboard />
                  </Layout>
                }
              />
              <Route
                path="/data-sharing-history"
                element={
                  <Layout>
                    <PatientDashboard />
                  </Layout>
                }
              />
              <Route
                path="/consents"
                element={
                  <Layout>
                    <ConsentManagementPage />
                  </Layout>
                }
              />

              {/* Doctor Practice Workspace Routes */}
              <Route
                path="/doctor-dashboard"
                element={
                  <Layout>
                    <DoctorDashboard />
                  </Layout>
                }
              />
              <Route
                path="/doctor/appointments"
                element={
                  <Layout>
                    <DoctorAppointmentsPage />
                  </Layout>
                }
              />
              <Route
                path="/doctor/consultation"
                element={
                  <Layout>
                    <DoctorConsultationPage />
                  </Layout>
                }
              />
              <Route
                path="/patients"
                element={
                  <Layout>
                    <AuthorizedPatientsPage />
                  </Layout>
                }
              />
              <Route
                path="/doctor/records"
                element={
                  <Layout>
                    <DoctorMedicalRecordsPage />
                  </Layout>
                }
              />
              <Route
                path="/doctor/ai-review"
                element={
                  <Layout>
                    <DoctorAiReviewPage />
                  </Layout>
                }
              />

              {/* Researcher Discovery Workspace Routes */}
              <Route
                path="/researcher-dashboard"
                element={
                  <Layout>
                    <ResearcherDashboard />
                  </Layout>
                }
              />
              <Route
                path="/datasets"
                element={
                  <Layout>
                    <DatasetBrowserPage />
                  </Layout>
                }
              />
              <Route
                path="/approved-datasets"
                element={
                  <Layout>
                    <DatasetBrowserPage />
                  </Layout>
                }
              />
              <Route
                path="/analytics"
                element={
                  <Layout>
                    <ResearchAnalyticsPage />
                  </Layout>
                }
              />
              <Route
                path="/studies"
                element={
                  <Layout>
                    <ResearchRequestsPage />
                  </Layout>
                }
              />
              <Route
                path="/reports"
                element={
                  <Layout>
                    <ReportCenterPage />
                  </Layout>
                }
              />

              {/* Enterprise System Admin Workspace Routes */}
              <Route
                path="/admin-dashboard"
                element={
                  <Layout>
                    <AdminDashboard />
                  </Layout>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <Layout>
                    <UserManagementPage />
                  </Layout>
                }
              />
              <Route
                path="/admin/roles"
                element={
                  <Layout>
                    <AdminDashboard />
                  </Layout>
                }
              />
              <Route
                path="/admin/consents"
                element={
                  <Layout>
                    <AdminConsentPage />
                  </Layout>
                }
              />
              <Route
                path="/audit-logs"
                element={
                  <Layout>
                    <AdminSystemMonitoringPage />
                  </Layout>
                }
              />
              <Route
                path="/admin/research"
                element={
                  <Layout>
                    <AdminResearchGovernancePage />
                  </Layout>
                }
              />
              <Route
                path="/admin/governance"
                element={
                  <Layout>
                    <AdminResearchGovernancePage />
                  </Layout>
                }
              />
              <Route
                path="/admin/system"
                element={
                  <Layout>
                    <AdminSystemMonitoringPage />
                  </Layout>
                }
              />
              <Route
                path="/admin/logs"
                element={
                  <Layout>
                    <AdminSystemMonitoringPage />
                  </Layout>
                }
              />
              <Route
                path="/admin/settings"
                element={
                  <Layout>
                    <PlatformSettingsPage />
                  </Layout>
                }
              />

              {/* Component & System Documentation Routes */}
              <Route
                path="/components"
                element={
                  <Layout>
                    <ComponentGallery />
                  </Layout>
                }
              />
              <Route path="/design-system" element={<DesignSystemShowcase />} />

              {/* Catch-all Wildcard Route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </ToastProvider>
      </NavigationProvider>
    </AuthProvider>
  );
}

export default App;
