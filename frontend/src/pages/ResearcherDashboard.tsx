import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import {
    Database,
    FileText,
    TrendingUp,
    Download,
    CheckCircle2,
    Clock,
    XCircle,
    Plus,
    Search,
    ShieldCheck,
    Loader2
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import { useToast } from '@/components/ui/toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

// Schema validation for Dataset Request
const requestSchema = z.object({
    title: z.string().min(5, { message: 'Study title must be at least 5 characters long' }),
    patientCount: z.number()
        .min(100, { message: 'Minimum cohort sample size is 100 patients' })
        .max(100000, { message: 'Maximum cohort sample size is 100,000 patients' }),
    diseaseFocus: z.enum(['Oncology', 'Cardiology', 'Infectious Diseases', 'Neurology', 'Pulmonology']),
    justification: z.string().min(15, { message: 'Justification must outline research scope in at least 15 characters' })
});

type RequestFormData = z.infer<typeof requestSchema>;

interface DatasetRequest {
    id: string;
    title: string;
    diseaseFocus: 'Oncology' | 'Cardiology' | 'Infectious Diseases' | 'Neurology' | 'Pulmonology';
    patientCount: number;
    justification: string;
    dateRequested: string;
    status: 'Pending' | 'Approved' | 'Denied';
    sandboxSize?: string;
}

// Visual Chart Data
const cohortTrendsData = [
    { year: '2026', Oncology: 120, Cardiology: 200, InfectiousDiseases: 90 },
    { year: '2027', Oncology: 145, Cardiology: 215, InfectiousDiseases: 110 },
    { year: '2028', Oncology: 190, Cardiology: 240, InfectiousDiseases: 85 },
    { year: '2029', Oncology: 220, Cardiology: 280, InfectiousDiseases: 130 },
    { year: '2030', Oncology: 270, Cardiology: 310, InfectiousDiseases: 160 }
];

const modelAccuracyData = [
    { name: 'Oncology', Accuracy: 94.2, Cohorts: 18 },
    { name: 'Cardiology', Accuracy: 91.8, Cohorts: 12 },
    { name: 'Infectious', Accuracy: 96.5, Cohorts: 25 },
    { name: 'Neurology', Accuracy: 89.4, Cohorts: 8 },
    { name: 'Pulmonology', Accuracy: 93.1, Cohorts: 15 }
];

const ResearcherDashboard: React.FC = () => {
    const { user } = useAuth();
    const { toast } = useToast();

    // 1. Requests State
    const [requests, setRequests] = useState<DatasetRequest[]>([]);
    
    // 2. ML Predictions State
    const [predictions, setPredictions] = useState<any[]>(cohortTrendsData);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [downloadingId, setDownloadingId] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm<RequestFormData>({
        resolver: zodResolver(requestSchema),
        defaultValues: {
            title: '',
            patientCount: 500,
            diseaseFocus: 'Oncology',
            justification: ''
        }
    });

    const loadResearcherData = async () => {
        try {
            const [requestsRes, predictionsRes] = await Promise.all([
                api.get('/ml/datasets/requests'),
                api.get('/ml/predictions')
            ]);
            setRequests(requestsRes.data);
            setPredictions(predictionsRes.data);
        } catch (err: any) {
            console.error('Failed to load researcher metrics & trends:', err);
        }
    };

    useEffect(() => {
        loadResearcherData();
    }, []);

    // Handle Dataset Request Submission
    const onSubmit = async (data: RequestFormData) => {
        setIsSubmitting(true);
        try {
            await api.post('/ml/datasets/request', {
                title: data.title,
                patientCount: data.patientCount,
                diseaseFocus: data.diseaseFocus,
                justification: data.justification
            });

            toast.success('Your scientific cohort query has been successfully submitted for HIPAA review.', 'Cohort Request Submitted');
            reset();
            loadResearcherData();
        } catch (err: any) {
            console.error('Dataset query failed', err);
            const errMsg = err.response?.data?.detail || 'An error occurred while submitting your dataset request.';
            toast.error(errMsg, 'Submission Failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle Sandbox JSON Download
    const handleDownloadDataset = async (reqId: string) => {
        setDownloadingId(reqId);
        toast.info('Safe-harbor de-identified sandbox cohort is compiling...', 'Compiling Sandbox');
        try {
            const response = await api.get(`/ml/datasets/download/${reqId}`);
            
            // Trigger actual browser download of the compiled JSON file
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(response.data, null, 2));
            const downloadAnchor = document.createElement('a');
            downloadAnchor.setAttribute("href", dataStr);
            downloadAnchor.setAttribute("download", `sandbox_cohort_${reqId}.json`);
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            downloadAnchor.remove();

            toast.success('De-identified Sandbox Dataset compiled & downloaded (HIPAA Safe Harbor Sanitized).', 'Download Complete');
        } catch (err: any) {
            console.error('Download failed', err);
            const errMsg = err.response?.data?.detail || 'An error occurred while compiling your sandbox dataset.';
            toast.error(errMsg, 'Compilation Failed');
        } finally {
            setDownloadingId(null);
        }
    };

    // Derived counts
    const approvedRequests = requests.filter((r) => r.status === 'Approved');
    const totalCohortAudited = approvedRequests.reduce((sum, r) => sum + r.patientCount, 0);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Research & ML Analytics Portal</h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1">Hello, {user?.name}. Request de-identified clinical cohorts and track disease trends.</p>
                </div>
                
                {/* HIPAA Privacy Badge */}
                <div className="inline-flex items-center gap-2 bg-primary-50 dark:bg-primary-950/20 border border-primary-100/60 dark:border-primary-900/40 px-3.5 py-1.5 rounded-full select-none">
                    <ShieldCheck className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                    <span className="text-[10px] font-black text-primary-800 dark:text-primary-400 tracking-wider uppercase">HIPAA Safe Harbor Sanitized</span>
                </div>
            </div>

            {/* Performance metrics row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                
                <Card className="flex items-center gap-4 hover:-translate-y-1 hover:shadow-md transition-all duration-300 dark:hover:shadow-slate-950/40">
                    <div className="p-3.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-405 rounded-xl shadow-sm dark:shadow-none">
                        <Database className="w-5.5 h-5.5" />
                    </div>
                    <div>
                        <h4 className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-wider">Unlocked Datasets</h4>
                        <p className="text-xl font-black text-slate-900 dark:text-slate-100 mt-0.5">{approvedRequests.length}</p>
                    </div>
                </Card>

                <Card className="flex items-center gap-4 hover:-translate-y-1 hover:shadow-md transition-all duration-300 dark:hover:shadow-slate-950/40">
                    <div className="p-3.5 bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-405 rounded-xl shadow-sm dark:shadow-none">
                        <Search className="w-5.5 h-5.5" />
                    </div>
                    <div>
                        <h4 className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-wider">Active Queries</h4>
                        <p className="text-xl font-black text-slate-900 dark:text-slate-100 mt-0.5">
                            {requests.filter((r) => r.status === 'Pending').length}
                        </p>
                    </div>
                </Card>

                <Card className="flex items-center gap-4 hover:-translate-y-1 hover:shadow-md transition-all duration-300 dark:hover:shadow-slate-950/40">
                    <div className="p-3.5 bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-405 rounded-xl shadow-sm dark:shadow-none">
                        <TrendingUp className="w-5.5 h-5.5" />
                    </div>
                    <div>
                        <h4 className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-wider">Patient Cohord</h4>
                        <p className="text-xl font-black text-slate-900 dark:text-slate-100 mt-0.5">{totalCohortAudited.toLocaleString()}</p>
                    </div>
                </Card>

                <Card className="flex items-center gap-4 hover:-translate-y-1 hover:shadow-md transition-all duration-300 dark:hover:shadow-slate-950/40">
                    <div className="p-3.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-405 rounded-xl shadow-sm dark:shadow-none">
                        <ShieldCheck className="w-5.5 h-5.5" />
                    </div>
                    <div>
                        <h4 className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-wider">Model Accuracy</h4>
                        <p className="text-xl font-black text-slate-900 dark:text-slate-100 mt-0.5">96.5%</p>
                    </div>
                </Card>

            </div>

            {/* Visual charts display using Recharts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* AreaChart: Disease projections */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-bold text-slate-950 dark:text-slate-50">Simulated Disease Trend Projections</CardTitle>
                        <CardDescription>Predictive machine learning modeling for pediatric/adult cohorts (2026 - 2030)</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-72 w-full text-[10px] font-bold text-slate-400 dark:text-slate-500">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={predictions} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorOnc" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25}/>
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/>
                                        </linearGradient>
                                        <linearGradient id="colorCard" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25}/>
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" opacity={0.08} />
                                    <XAxis dataKey="year" stroke="currentColor" />
                                    <YAxis stroke="currentColor" />
                                    <Tooltip contentStyle={{
                                        background: 'rgba(15, 23, 42, 0.95)',
                                        backdropFilter: 'blur(8px)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        borderRadius: '16px',
                                        color: '#fff',
                                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                                    }} />
                                    <Legend iconType="circle" />
                                    <Area type="monotone" dataKey="Oncology" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorOnc)" />
                                    <Area type="monotone" dataKey="Cardiology" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorCard)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* BarChart: Model accuracy */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-bold text-slate-950 dark:text-slate-50">Model Accuracy & Durability Review</CardTitle>
                        <CardDescription>Evaluation of neural network precision across distinct cohort types</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-72 w-full text-[10px] font-bold text-slate-400 dark:text-slate-500">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={modelAccuracyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" opacity={0.08} />
                                    <XAxis dataKey="name" stroke="currentColor" />
                                    <YAxis domain={[80, 100]} stroke="currentColor" />
                                    <Tooltip contentStyle={{
                                        background: 'rgba(15, 23, 42, 0.95)',
                                        backdropFilter: 'blur(8px)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        borderRadius: '16px',
                                        color: '#fff',
                                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                                    }} />
                                    <Legend iconType="circle" />
                                    <Bar dataKey="Accuracy" fill="#14b8a6" radius={[6, 6, 0, 0]} barSize={32} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

            </div>

            {/* Request Form & History Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left Column (2/3 width) - Dataset query request history */}
                <Card className="lg:col-span-2">
                    <CardHeader className="pb-4">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/30 rounded-xl text-indigo-600 dark:text-indigo-400">
                                <FileText className="w-4.5 h-4.5" />
                            </div>
                            <CardTitle className="text-base font-bold text-slate-950 dark:text-slate-50">Cohort Queries & Request History</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-50 dark:border-slate-800/80 text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                                        <th className="py-4 px-2">Study Title</th>
                                        <th className="py-4 px-2">Disease Focus</th>
                                        <th className="py-4 px-2">Cohort Size</th>
                                        <th className="py-4 px-2">Status</th>
                                        <th className="py-4 px-2 text-right">Data Sandbox</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 dark:divide-slate-800/60">
                                    {requests.map((req) => (
                                        <tr key={req.id} className="group hover:bg-slate-50/40 dark:hover:bg-slate-800/20 transition-colors">
                                            <td className="py-4 px-2 max-w-xs">
                                                <div>
                                                    <p className="font-bold text-slate-950 dark:text-slate-100 text-xs truncate">{req.title}</p>
                                                    <p className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold mt-0.5 truncate italic">"{req.justification}"</p>
                                                </div>
                                            </td>
                                            <td className="py-4 px-2 text-xs font-semibold text-slate-700 dark:text-slate-350">
                                                <Badge variant="outline" className="font-bold">{req.diseaseFocus}</Badge>
                                            </td>
                                            <td className="py-4 px-2 text-[10px] text-slate-450 dark:text-slate-500 font-bold">
                                                {req.patientCount.toLocaleString()} patients
                                            </td>
                                            <td className="py-4 px-2">
                                                {req.status === 'Approved' ? (
                                                    <Badge variant="success" className="gap-1 font-bold">
                                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                                        Approved
                                                    </Badge>
                                                ) : req.status === 'Denied' ? (
                                                    <Badge variant="destructive" className="gap-1 font-bold">
                                                        <XCircle className="w-3.5 h-3.5" />
                                                        Denied
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="warning" className="gap-1 font-bold">
                                                        <Clock className="w-3.5 h-3.5" />
                                                        Pending
                                                    </Badge>
                                                )}
                                            </td>
                                            <td className="py-4 px-2 text-right">
                                                {req.status === 'Approved' ? (
                                                    <Button
                                                        onClick={() => handleDownloadDataset(req.id)}
                                                        disabled={downloadingId !== null}
                                                        size="sm"
                                                        className="h-8 font-bold flex items-center justify-center gap-1.5 ml-auto bg-emerald-600 hover:bg-emerald-500 shadow-sm"
                                                    >
                                                        {downloadingId === req.id ? (
                                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                        ) : (
                                                            <Download className="w-3.5 h-3.5" />
                                                        )}
                                                        Download ({req.sandboxSize})
                                                    </Button>
                                                ) : req.status === 'Denied' ? (
                                                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold select-none italic uppercase">No access</span>
                                                ) : (
                                                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold select-none italic uppercase">Reviewing</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
 
                {/* Right Column (1/3 width) - Dataset Request Form */}
                <Card>
                    <CardHeader className="pb-4">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-primary-50 dark:bg-primary-950/30 rounded-xl text-primary-600 dark:text-primary-400">
                                <Plus className="w-4.5 h-4.5" />
                            </div>
                            <CardTitle className="text-base font-bold text-slate-950 dark:text-slate-50">Request New Dataset</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
                            
                            {/* Title input */}
                            <div>
                                <label htmlFor="title" className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                                    Research Study Title
                                </label>
                                <Input
                                    id="title"
                                    type="text"
                                    {...register('title')}
                                    disabled={isSubmitting}
                                    error={!!errors.title}
                                    placeholder="e.g. Lymphoma predictive factors..."
                                />
                                {errors.title && (
                                    <p className="text-[10px] text-rose-500 font-bold mt-1.5">
                                        {errors.title.message}
                                    </p>
                                )}
                            </div>

                            {/* Patient sample size count input */}
                            <div>
                                <label htmlFor="patientCount" className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                                    Requested Cohort Size (Patients)
                                </label>
                                <Input
                                    id="patientCount"
                                    type="number"
                                    {...register('patientCount', { valueAsNumber: true })}
                                    disabled={isSubmitting}
                                    error={!!errors.patientCount}
                                    placeholder="e.g. 500"
                                />
                                {errors.patientCount && (
                                    <p className="text-[10px] text-rose-500 font-bold mt-1.5">
                                        {errors.patientCount.message}
                                    </p>
                                )}
                            </div>

                            {/* Disease Focus selector */}
                            <div>
                                <label htmlFor="diseaseFocus" className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                                    Disease Specialty Focus
                                </label>
                                <Select
                                    id="diseaseFocus"
                                    {...register('diseaseFocus')}
                                    disabled={isSubmitting}
                                    error={!!errors.diseaseFocus}
                                >
                                    <option value="Oncology" className="dark:bg-slate-900">Oncology (Cancer Research)</option>
                                    <option value="Cardiology" className="dark:bg-slate-900">Cardiology (Cardiovascular)</option>
                                    <option value="Infectious Diseases" className="dark:bg-slate-900">Infectious Diseases</option>
                                    <option value="Neurology" className="dark:bg-slate-900">Neurology</option>
                                    <option value="Pulmonology" className="dark:bg-slate-900">Pulmonology (Lungs & Respiratory)</option>
                                </Select>
                                {errors.diseaseFocus && (
                                    <p className="text-[10px] text-rose-500 font-bold mt-1.5">
                                        {errors.diseaseFocus.message}
                                    </p>
                                )}
                            </div>

                            {/* Justification input */}
                            <div>
                                <label htmlFor="justification" className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                                    Scientific & HIPAA Justification
                                </label>
                                <textarea
                                    id="justification"
                                    rows={3}
                                    {...register('justification')}
                                    disabled={isSubmitting}
                                    className={`w-full px-3 py-2 bg-slate-50/50 dark:bg-slate-900/40 border rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:ring-4 transition-all text-xs font-semibold resize-none focus-visible:outline-none dark:text-slate-100 placeholder:text-slate-400 ${
                                        errors.justification
                                            ? 'border-rose-300 dark:border-rose-900/50 focus:border-rose-500 focus:ring-rose-50 dark:focus:ring-rose-950/30'
                                            : 'border-transparent dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 focus:border-primary-500 focus:ring-primary-50 dark:focus:ring-primary-950/30'
                                    }`}
                                    placeholder="State clearly how you will de-identify and use this cohort dataset..."
                                />
                                {errors.justification && (
                                    <p className="text-[10px] text-rose-500 font-bold mt-1.5">
                                        {errors.justification.message}
                                    </p>
                                )}
                            </div>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full h-11 text-xs"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin mr-1" />
                                        Submitting Query Request...
                                    </>
                                ) : (
                                    <>
                                        <Plus className="w-4 h-4 mr-1" />
                                        Request Dataset
                                    </>
                                )}
                            </Button>

                        </form>
                    </CardContent>
                </Card> 
            </div>

        </div>
    );
};

export default ResearcherDashboard;
