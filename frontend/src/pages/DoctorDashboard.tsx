import React, { useState, useEffect } from 'react';
import {
    Users,
    Activity,
    TrendingUp,
    Calendar,
    ChevronRight,
    ArrowUpRight,
    ArrowDownRight,
    FileText
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';

interface StatCardProps {
    title: string;
    value: string;
    trend: string;
    trendType: 'up' | 'down';
    icon: React.ElementType;
    color: string;
}

const StatCard = ({ title, value, trend, trendType, icon: Icon, color }: StatCardProps) => (
    <Card className="hover:-translate-y-1.5 hover:shadow-lg transition-all duration-300 focus-within:ring-2 focus-within:ring-primary-500 focus-within:ring-offset-2 select-none dark:hover:shadow-slate-950/40">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</CardTitle>
            <div className={`p-2.5 rounded-xl text-white ${color} shadow-sm dark:shadow-none`}>
                <Icon className="w-5 h-5" />
            </div>
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">{value}</div>
            <div className="flex items-center gap-1.5 mt-2.5">
                <Badge variant={trendType === 'up' ? 'success' : 'destructive'} className="gap-0.5">
                    {trendType === 'up' ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                    {trend.split(' ')[0]}
                </Badge>
                <span className="text-[10px] text-slate-400 font-bold tracking-wide uppercase">
                    {trend.split(' ').slice(1).join(' ')}
                </span>
            </div>
        </CardContent>
    </Card>
);

const DoctorDashboard: React.FC = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalPatients: "0",
        activeConsults: "0",
        recordsShared: "0",
        appointments: "18"
    });
    const [records, setRecords] = useState<any[]>([]);
    const [activities, setActivities] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadDoctorData = async () => {
        try {
            setIsLoading(true);
            const [statsRes, recordsRes, notifyRes] = await Promise.all([
                api.get('/dashboard/stats'),
                api.get('/records'),
                api.get('/notifications')
            ]);
            
            setStats({
                totalPatients: String(statsRes.data.totalPatients),
                activeConsults: String(statsRes.data.activeConsults),
                recordsShared: String(statsRes.data.recordsShared),
                appointments: String(statsRes.data.appointments)
            });
            setRecords(recordsRes.data);
            setActivities(notifyRes.data);
        } catch (err) {
            console.error('Error fetching doctor practice dashboard metrics:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadDoctorData();
    }, []);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Practice Overview</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1">Hello, Dr. {user?.name.replace("Dr. ", "")}. Welcome back. Here's a brief status of your practice today.</p>
            </div>

            {/* Stat Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Patients"
                    value={stats.totalPatients}
                    trend="+12% from last month"
                    trendType="up"
                    icon={Users}
                    color="bg-gradient-to-tr from-blue-600 to-sky-500"
                />
                <StatCard
                    title="Active Consults"
                    value={stats.activeConsults}
                    trend="+4 since yesterday"
                    trendType="up"
                    icon={Activity}
                    color="bg-gradient-to-tr from-primary-600 to-indigo-500"
                />
                <StatCard
                    title="Records Shared"
                    value={stats.recordsShared}
                    trend="-2% vs average"
                    trendType="down"
                    icon={TrendingUp}
                    color="bg-gradient-to-tr from-teal-600 to-emerald-500"
                />
                <StatCard
                    title="Appointments"
                    value={stats.appointments}
                    trend="8 slots remaining"
                    trendType="up"
                    icon={Calendar}
                    color="bg-gradient-to-tr from-violet-600 to-fuchsia-500"
                />
            </div>

            {/* Reports & Activity Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Reports Section */}
                <Card className="lg:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-base font-bold text-slate-950 dark:text-slate-50">Recent Health Reports</CardTitle>
                            <CardDescription>Documents securely shared by clinic patients</CardDescription>
                        </div>
                        <Button variant="ghost" size="sm" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-350 font-bold flex items-center gap-1">
                            View All <ChevronRight size={14} />
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {records.length === 0 ? (
                            <div className="py-8 text-center text-slate-400 dark:text-slate-500 text-xs font-semibold">
                                No records have been cryptographically shared with your practice directory.
                            </div>
                        ) : (
                            records.map((rec) => (
                                <div
                                    key={rec.id}
                                    className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80 hover:border-primary-100 dark:hover:border-primary-900/60 hover:bg-primary-50/20 dark:hover:bg-primary-950/20 transition-all duration-300 group cursor-pointer"
                                    tabIndex={0}
                                    role="button"
                                    aria-label={`Open report for Patient ${rec.patientName}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-11 h-11 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 group-hover:text-primary-600 group-hover:bg-primary-50 dark:group-hover:bg-primary-950/30 rounded-xl flex items-center justify-center transition-all">
                                            <FileText size={18} />
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-black text-slate-900 dark:text-slate-100 group-hover:text-primary-700 dark:group-hover:text-primary-400 transition-colors">
                                                {rec.title} - Patient: {rec.patientName}
                                            </h4>
                                            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold mt-1">Uploaded {rec.dateUploaded} • {rec.category} • {rec.fileSize}</p>
                                        </div>
                                    </div>
                                    <Button variant="outline" size="sm" className="group-hover:bg-primary-600 group-hover:text-white group-hover:border-primary-600 transition-colors">
                                        Review
                                    </Button>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>

                {/* Activity Feed Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base font-bold text-slate-950 dark:text-slate-50">Live Activities</CardTitle>
                        <CardDescription>Real-time updates on patients and consent sharing</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {activities.length === 0 ? (
                            <div className="py-8 text-center text-slate-400 dark:text-slate-500 text-xs font-semibold">
                                No recent clinical audit activities.
                            </div>
                        ) : (
                            activities.slice(0, 4).map((act, i) => (
                                <div key={i} className="flex gap-4 relative">
                                    <div className="flex flex-col items-center">
                                        <div className="w-2.5 h-2.5 rounded-full bg-primary-600 shadow-sm shadow-primary-200 z-10" />
                                        {i < activities.slice(0,4).length - 1 && <div className="flex-1 w-0.5 bg-slate-100 dark:bg-slate-800 my-1" />}
                                    </div>
                                    <div className="pb-2">
                                        <p className="text-xs font-black text-slate-900 dark:text-slate-100">
                                            {act.name} <span className="text-slate-400 font-medium">{act.action}: {act.details}</span>
                                        </p>
                                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold mt-1 tracking-wide uppercase">{act.time}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default DoctorDashboard;
