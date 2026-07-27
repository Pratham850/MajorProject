import React from 'react';
import { useAuth } from '@/context/AuthContext';
import DoctorDashboard from '@/pages/DoctorDashboard';
import PatientDashboard from '@/pages/PatientDashboard';
import ResearcherDashboard from '@/pages/ResearcherDashboard';

const Dashboard: React.FC = () => {
    const { user } = useAuth();
    const role = user?.role || 'patient';

    switch (role) {
        case 'doctor':
            return <DoctorDashboard />;
        case 'patient':
            return <PatientDashboard />;
        case 'researcher':
            return <ResearcherDashboard />;
        default:
            return (
                <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm animate-in fade-in duration-500">
                    <h1 className="text-xl font-bold text-rose-600">Unknown Role Profile</h1>
                    <p className="text-gray-500 mt-1">Please log out and sign up with a valid account type.</p>
                </div>
            );
    }
};

export default Dashboard;
