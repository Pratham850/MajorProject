import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

const Unauthorized: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-2xl dark:shadow-none p-8 text-center animate-in fade-in duration-500">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-rose-50 dark:bg-rose-950/20 rounded-2xl mb-6 text-rose-600 dark:text-rose-450">
                    <ShieldAlert className="w-10 h-10" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Access Denied</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-2 leading-relaxed text-xs">
                    Your account role does not have the required permissions to access this page. If you believe this is an error, please contact your administrator.
                </p>
                <button
                    onClick={() => navigate('/')}
                    className="mt-8 w-full py-3.5 bg-slate-900 dark:bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-800 dark:hover:bg-slate-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-xs"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Dashboard
                </button>
            </div>
        </div>
    );
};

export default Unauthorized;
