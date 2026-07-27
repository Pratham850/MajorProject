import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { ToastProvider } from '@/components/ui/toast';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import Dashboard from '@/pages/Dashboard';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Unauthorized from '@/pages/Unauthorized';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: ('doctor' | 'patient' | 'researcher' | 'admin')[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
    const { isAuthenticated, loading, user } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center font-bold text-slate-500 dark:text-slate-400">
                Loading HealthShare...
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return <>{children}</>;
};

// Redirect logged-in users away from /login and /register
const PublicOnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    
    if (loading) return null;
    if (isAuthenticated) return <Navigate to="/" replace />;
    
    return <>{children}</>;
};

function App() {
    return (
        <ThemeProvider>
            <ToastProvider>
                <AuthProvider>
                    <Router>
                    <Routes>
                        {/* Public Auth Routes */}
                        <Route
                            path="/login"
                            element={
                                <PublicOnlyRoute>
                                    <Login />
                                </PublicOnlyRoute>
                            }
                        />
                        <Route
                            path="/register"
                            element={
                                <PublicOnlyRoute>
                                    <Register />
                                </PublicOnlyRoute>
                            }
                        />
                    <Route path="/unauthorized" element={<Unauthorized />} />

                    {/* Protected Dashboard Routes */}
                    <Route
                        path="/*"
                        element={
                            <ProtectedRoute>
                                <DashboardLayout>
                                    <Routes>
                                        <Route path="/" element={<Dashboard />} />

                                        {/* Doctor Only Routes */}
                                        <Route
                                            path="/patients"
                                            element={
                                                <ProtectedRoute allowedRoles={['doctor']}>
                                                    <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm animate-in fade-in duration-500">
                                                        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Patients Directory</h1>
                                                        <p className="text-slate-500 dark:text-slate-400 mt-1 font-semibold text-xs">Directory of registered clinic patients.</p>
                                                    </div>
                                                </ProtectedRoute>
                                            }
                                        />

                                        {/* Shared Doctor & Patient Routes */}
                                        <Route
                                            path="/records"
                                            element={
                                                <ProtectedRoute allowedRoles={['doctor', 'patient']}>
                                                    <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm animate-in fade-in duration-500">
                                                        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Medical Records</h1>
                                                        <p className="text-slate-500 dark:text-slate-400 mt-1 font-semibold text-xs">Review clinical medical record exchanges.</p>
                                                    </div>
                                                </ProtectedRoute>
                                            }
                                        />

                                        {/* Patient Only Routes */}
                                        <Route
                                            path="/consents"
                                            element={
                                                <ProtectedRoute allowedRoles={['patient']}>
                                                    <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm animate-in fade-in duration-500">
                                                        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Sharing Consents</h1>
                                                        <p className="text-slate-500 dark:text-slate-400 mt-1 font-semibold text-xs">Manage doctor and researcher data access permissions.</p>
                                                    </div>
                                                </ProtectedRoute>
                                            }
                                        />

                                        {/* Researcher Only Routes */}
                                        <Route
                                            path="/datasets"
                                            element={
                                                <ProtectedRoute allowedRoles={['researcher']}>
                                                    <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm animate-in fade-in duration-500">
                                                        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Dataset Queries</h1>
                                                        <p className="text-slate-500 dark:text-slate-400 mt-1 font-semibold text-xs">Request cohort data for medical research studies.</p>
                                                    </div>
                                                </ProtectedRoute>
                                            }
                                        />
                                        <Route
                                            path="/analytics"
                                            element={
                                                <ProtectedRoute allowedRoles={['researcher']}>
                                                    <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm animate-in fade-in duration-500">
                                                        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Predictive Analytics</h1>
                                                        <p className="text-slate-500 dark:text-slate-400 mt-1 font-semibold text-xs">View ML trends and disease predictions.</p>
                                                    </div>
                                                </ProtectedRoute>
                                            }
                                        />

                                        {/* Shared Settings Route */}
                                        <Route
                                            path="/settings"
                                            element={
                                                <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm animate-in fade-in duration-500">
                                                    <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Account Settings</h1>
                                                    <p className="text-slate-500 dark:text-slate-400 mt-1 font-semibold text-xs">Configure profile and security preferences.</p>
                                                </div>
                                            }
                                        />

                                        {/* Fallback Catch-all Route */}
                                        <Route path="*" element={<Navigate to="/" replace />} />
                                      </Routes>
                                    </DashboardLayout>
                                </ProtectedRoute>
                            }
                        />
                    </Routes>
                </Router>
            </AuthProvider>
            </ToastProvider>
        </ThemeProvider>
    );
}

export default App;
