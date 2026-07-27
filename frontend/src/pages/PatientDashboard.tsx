import React, { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Shield,
    ShieldAlert,
    UploadCloud,
    FileText,
    Check,
    X,
    Lock,
    Unlock,
    File,
    Clock,
    Plus,
    Loader2,
    CheckCircle
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import { useToast } from '@/components/ui/toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

// Schema validation for Medical Record Upload
const uploadSchema = z.object({
    title: z.string().min(3, { message: 'Title must be at least 3 characters long' }),
    category: z.enum(['Lab Report', 'Prescription', 'Immunization', 'Imaging'])
});

type UploadFormData = z.infer<typeof uploadSchema>;

interface MedicalRecord {
    id: string;
    title: string;
    category: 'Lab Report' | 'Prescription' | 'Immunization' | 'Imaging';
    dateUploaded: string;
    fileSize: string;
    sharingStatus: 'Private' | 'Shared';
    sharedWith: string[];
}

interface AccessRequest {
    id: string;
    requestedBy: string;
    specialization: string;
    reason: string;
    recordTitle: string;
    status: 'Pending' | 'Approved' | 'Denied';
}

const PatientDashboard: React.FC = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    // 1. Records State
    const [records, setRecords] = useState<MedicalRecord[]>([]);

    // 2. Clinician Requests State
    const [requests, setRequests] = useState<AccessRequest[]>([]);

    // Fetch data from backend API
    const loadDashboardData = async () => {
        try {
            const [recordsRes, requestsRes] = await Promise.all([
                api.get('/records'),
                api.get('/consents/requests')
            ]);
            setRecords(recordsRes.data);
            setRequests(requestsRes.data);
        } catch (err: any) {
            console.error('Failed to load dashboard data:', err);
            toast.error('Could not connect to HealthShare database services.', 'Error Loading Data');
        }
    };

    useEffect(() => {
        loadDashboardData();
    }, []);

    // Uploader Form States
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [selectedFile, setSelectedFile] = useState<{ name: string; size: string } | null>(null);
    const [fileError, setFileError] = useState<string | null>(null);

    // Global Emergency Revocation State
    const [isRevokingAll, setIsRevokingAll] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm<UploadFormData>({
        resolver: zodResolver(uploadSchema),
        defaultValues: {
            title: '',
            category: 'Lab Report'
        }
    });

    // Handle Mock File Selection
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFileError(null);
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
            setSelectedFile({
                name: file.name,
                size: `${sizeInMb} MB`
            });
        }
    };

    // Keyboard listener for accessible dropzone click trigger
    const handleDropzoneKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            fileInputRef.current?.click();
        }
    };

    // Form Submission: Upload Record
    const onSubmit = async (data: UploadFormData) => {
        const fileObj = fileInputRef.current?.files?.[0];
        if (!selectedFile || !fileObj) {
            setFileError('Please select or drop a physical file to upload');
            return;
        }

        setIsUploading(true);
        setUploadProgress(15);

        // Simulate progress bar increments for security/encryption step visualization
        const interval = setInterval(() => {
            setUploadProgress((prev) => {
                if (prev >= 85) {
                    clearInterval(interval);
                    return 85;
                }
                return prev + 15;
            });
        }, 150);

        try {
            const formData = new FormData();
            formData.append('title', data.title);
            formData.append('category', data.category);
            formData.append('file', fileObj);

            const response = await api.post('/records/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            
            clearInterval(interval);
            setUploadProgress(100);
            await new Promise((resolve) => setTimeout(resolve, 300));

            setRecords((prev) => [response.data, ...prev]);
            toast.success(`"${data.title}" was successfully encrypted and uploaded.`, 'Record Uploaded');
            
            // Clean up
            reset();
            setSelectedFile(null);
            setUploadProgress(0);
        } catch (err: any) {
            console.error('File upload failed', err);
            const errMsg = err.response?.data?.detail || 'An error occurred during file upload. Please try again.';
            toast.error(errMsg, 'Upload Failed');
        } finally {
            setIsUploading(false);
            clearInterval(interval);
        }
    };

    // Consent Handling: Approve incoming doctor request
    const handleApproveRequest = async (reqId: string, recordTitle: string, docName: string) => {
        try {
            await api.post(`/consents/requests/${reqId}/approve`);
            toast.success(`Successfully shared "${recordTitle}" with ${docName}.`, 'Consent Approved');
            loadDashboardData();
        } catch (err: any) {
            console.error('Failed to approve request:', err);
            const errMsg = err.response?.data?.detail || 'An error occurred while granting consent.';
            toast.error(errMsg, 'Action Failed');
        }
    };

    // Consent Handling: Deny incoming doctor request
    const handleDenyRequest = async (reqId: string) => {
        try {
            await api.post(`/consents/requests/${reqId}/deny`);
            toast.info('Clinician data sharing request has been declined.', 'Request Denied');
            loadDashboardData();
        } catch (err: any) {
            console.error('Failed to deny request:', err);
            toast.error('An error occurred while declining request.', 'Action Failed');
        }
    };

    // Revoke single doctor permission from a record
    const handleRevokeConsent = async (recId: string, docName: string) => {
        try {
            await api.post('/consents/revoke', {
                record_id: recId,
                doctor_name: docName
            });
            toast.warning(`Revoked sharing permission for ${docName}.`, 'Consent Revoked');
            loadDashboardData();
        } catch (err: any) {
            console.error('Failed to revoke consent:', err);
            const errMsg = err.response?.data?.detail || 'An error occurred while revoking consent.';
            toast.error(errMsg, 'Action Failed');
        }
    };

    // Global Emergency Revoke: Wipe all consent shares immediately
    const handleEmergencyRevoke = async () => {
        setIsRevokingAll(true);
        try {
            await api.post('/consents/emergency-revoke');
            toast.warning('Emergency Lockout Completed! All shared medical records have been made private.', 'Consents Wiped');
            loadDashboardData();
        } catch (err: any) {
            console.error('Emergency revoke failed', err);
            toast.error('An error occurred while executing emergency revocation.', 'Action Failed');
        } finally {
            setIsRevokingAll(false);
        }
    };

    // Statistical variables for dashboard UI
    const totalFilesCount = records.length;
    const activeConsentCount = records.reduce((sum, r) => sum + r.sharedWith.length, 0);
    const pendingRequests = requests.filter((r) => r.status === 'Pending');

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            
            {/* Header Title Banner */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Personal Health Dashboard</h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1">Hello, {user?.name}. Oversee your secure clinical inventory and sharing consents.</p>
                </div>
                
                {/* HIPAA Badge */}
                <div className="inline-flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100/60 dark:border-emerald-900/40 px-3.5 py-1.5 rounded-full select-none">
                    <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-[10px] font-black text-emerald-800 dark:text-emerald-400 tracking-wider uppercase">GDPR & HIPAA Compliant</span>
                </div>
            </div>

            {/* Privacy Health Indicators Summary Card */}
            <div className="bg-gradient-to-tr from-slate-900 via-slate-800 to-indigo-950 rounded-3xl p-6 md:p-8 text-white shadow-xl shadow-slate-200 dark:shadow-none">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <span className="p-2.5 bg-emerald-500/20 rounded-xl text-emerald-400">
                                <Shield className="w-5.5 h-5.5" />
                            </span>
                            <div>
                                <h3 className="text-sm font-black text-white tracking-wide">Privacy Status Profile</h3>
                                <p className="text-[10px] text-slate-300 font-medium">Active real-time cryptographic audit log enabled</p>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 pt-2">
                            <div>
                                <p className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Total Encrypted Records</p>
                                <p className="text-2xl font-black mt-1 text-white">{totalFilesCount}</p>
                            </div>
                            <div>
                                <p className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Active Doctor Consents</p>
                                <p className="text-2xl font-black mt-1 text-emerald-400">{activeConsentCount}</p>
                            </div>
                            <div className="col-span-2 md:col-span-1">
                                <p className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Security Standard</p>
                                <p className="text-[10px] font-black mt-1.5 bg-white/10 border border-white/5 px-2.5 py-1 rounded-lg inline-block text-white">AES-256 / SHA-256</p>
                            </div>
                        </div>
                    </div>

                    <Button
                        onClick={handleEmergencyRevoke}
                        disabled={isRevokingAll || activeConsentCount === 0}
                        variant={activeConsentCount === 0 ? 'secondary' : 'destructive'}
                        size="lg"
                        className="w-full md:w-auto font-bold flex items-center justify-center gap-2"
                    >
                        {isRevokingAll ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Revoking Access...
                            </>
                        ) : (
                            <>
                                <ShieldAlert className="w-4 h-4" />
                                Emergency Revoke All Access
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Dashboard Workspace Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left Column (2/3 width) - Incoming Requests and Medical Records Table */}
                <div className="lg:col-span-2 space-y-8">
                    
                    {/* Incoming Access Requests Feed */}
                    {pendingRequests.length > 0 && (
                        <Card className="border-amber-100 dark:border-amber-950/30 bg-amber-50/10 dark:bg-amber-950/5 shadow-sm animate-in slide-in-from-top-4 duration-300">
                            <CardHeader className="pb-3 flex flex-row items-center gap-3 space-y-0">
                                <div className="p-2 bg-amber-100 dark:bg-amber-950/30 rounded-xl text-amber-600 dark:text-amber-400">
                                    <Clock className="w-4 h-4 animate-pulse" />
                                </div>
                                <div>
                                    <CardTitle className="text-sm font-bold text-slate-900 dark:text-slate-100">
                                        Access Requests Pending Approval ({pendingRequests.length})
                                    </CardTitle>
                                    <CardDescription>Clinicians requesting access to review your health files</CardDescription>
                                </div>
                            </CardHeader>
                            
                            <CardContent className="space-y-4">
                                {pendingRequests.map((req) => (
                                    <div key={req.id} className="p-4 rounded-2xl border border-amber-100/60 dark:border-amber-900/30 bg-white dark:bg-slate-900 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all duration-200">
                                        <div className="space-y-1.5 max-w-lg">
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-black text-slate-900 dark:text-slate-100 text-xs">{req.requestedBy}</h4>
                                                <Badge variant="warning">{req.specialization}</Badge>
                                            </div>
                                            <p className="text-[10px] text-slate-600 dark:text-slate-350 leading-relaxed font-semibold italic">
                                                "{req.reason}"
                                            </p>
                                            <p className="text-[10px] text-slate-400 font-bold">
                                                Requested File: <span className="text-slate-700 dark:text-slate-300">{req.recordTitle}</span>
                                            </p>
                                        </div>
                                        
                                        <div className="flex items-center gap-2 w-full md:w-auto">
                                            <Button
                                                onClick={() => handleDenyRequest(req.id)}
                                                variant="outline"
                                                size="sm"
                                                className="flex-1 md:flex-initial"
                                            >
                                                <X className="w-3.5 h-3.5 text-rose-500 mr-1" />
                                                Decline
                                            </Button>
                                            <Button
                                                onClick={() => handleApproveRequest(req.id, req.recordTitle, req.requestedBy)}
                                                size="sm"
                                                className="flex-1 md:flex-initial"
                                            >
                                                <Check className="w-3.5 h-3.5 mr-1" />
                                                Grant Access
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                    {/* Medical Records Inventory List */}
                    <Card>
                        <CardHeader className="pb-4">
                            <CardTitle className="text-base font-bold text-slate-950 dark:text-slate-50">Secure Medical Records Inventory</CardTitle>
                            <CardDescription>Your complete list of encrypted clinical documents and files</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {records.length === 0 ? (
                                <div className="py-12 text-center">
                                    <div className="w-14 h-14 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-850 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-350 dark:text-slate-500">
                                        <File className="w-6 h-6" />
                                    </div>
                                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-xs">No records uploaded yet</h3>
                                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 max-w-xs mx-auto">Use the record uploader card on the right to encrypt and secure your files.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-slate-50 dark:border-slate-800/80 text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                                                <th className="py-4 px-2">Record Name</th>
                                                <th className="py-4 px-2">Category</th>
                                                <th className="py-4 px-2">Date Encrypted</th>
                                                <th className="py-4 px-2">Size</th>
                                                <th className="py-4 px-2">Sharing Status</th>
                                                <th className="py-4 px-2 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800/60">
                                            {records.map((rec) => (
                                                <tr key={rec.id} className="group hover:bg-slate-50/40 dark:hover:bg-slate-800/20 transition-colors">
                                                    <td className="py-4 px-2">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 group-hover:bg-primary-50 group-hover:text-primary-600 dark:group-hover:bg-primary-950/40 dark:group-hover:text-primary-400 transition-all">
                                                                <FileText className="w-4.5 h-4.5" />
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-slate-900 dark:text-slate-100 text-xs">{rec.title}</p>
                                                                {rec.sharedWith.length > 0 && (
                                                                    <p className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold mt-0.5">
                                                                        Shared with: {rec.sharedWith.join(', ')}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-2">
                                                        <Badge variant={
                                                            rec.category === 'Lab Report' ? 'info' :
                                                            rec.category === 'Imaging' ? 'secondary' :
                                                            rec.category === 'Immunization' ? 'default' :
                                                            'success'
                                                        }>
                                                            {rec.category}
                                                        </Badge>
                                                    </td>
                                                    <td className="py-4 px-2 text-[10px] text-slate-400 dark:text-slate-500 font-bold">
                                                        {rec.dateUploaded}
                                                    </td>
                                                    <td className="py-4 px-2 text-[10px] text-slate-400 dark:text-slate-500 font-bold">
                                                        {rec.fileSize}
                                                    </td>
                                                    <td className="py-4 px-2">
                                                        <Badge variant={rec.sharingStatus === 'Shared' ? 'success' : 'outline'} className="gap-1 font-bold">
                                                            {rec.sharingStatus === 'Shared' ? (
                                                                <>
                                                                    <Unlock className="w-3 h-3" />
                                                                    Shared
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Lock className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                                                                    Private
                                                                </>
                                                            )}
                                                        </Badge>
                                                    </td>
                                                    <td className="py-4 px-2 text-right">
                                                        {rec.sharingStatus === 'Shared' ? (
                                                            <div className="flex items-center justify-end gap-1">
                                                                {rec.sharedWith.map((doc) => (
                                                                    <Button
                                                                        key={doc}
                                                                        onClick={() => handleRevokeConsent(rec.id, doc)}
                                                                        variant="outline"
                                                                        size="sm"
                                                                        className="h-7 px-2 bg-rose-50/50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/40 border-rose-100 dark:border-rose-900/40 hover:border-rose-200 dark:hover:border-rose-800 text-rose-700 dark:text-rose-400 font-bold text-[9px]"
                                                                        title={`Revoke access for ${doc}`}
                                                                    >
                                                                        Revoke {doc.split(' ')[1] || doc}
                                                                    </Button>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold tracking-wide uppercase select-none">Protected</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column (1/3 width) - Medical Record Uploader Form */}
                <div>
                    <Card className="sticky top-6">
                        <CardHeader className="pb-4">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl text-emerald-600 dark:text-emerald-400">
                                    <UploadCloud className="w-4.5 h-4.5" />
                                </div>
                                <CardTitle className="text-base font-bold text-slate-950 dark:text-slate-50">Upload Health Record</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
                                {/* Record Title input */}
                                <div>
                                    <label htmlFor="title" className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                                        Record Title / Document Name
                                    </label>
                                    <Input
                                        id="title"
                                        type="text"
                                        {...register('title')}
                                        disabled={isUploading}
                                        error={!!errors.title}
                                        placeholder="e.g. Chest X-Ray Report, Blood Panel"
                                    />
                                    {errors.title && (
                                        <p className="text-[10px] text-rose-500 font-bold mt-1.5">
                                            {errors.title.message}
                                        </p>
                                    )}
                                </div>

                                {/* Category input */}
                                <div>
                                    <label htmlFor="category" className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                                        Record Category
                                    </label>
                                    <Select
                                        id="category"
                                        {...register('category')}
                                        disabled={isUploading}
                                        error={!!errors.category}
                                    >
                                        <option value="Lab Report" className="dark:bg-slate-900">Lab Report (e.g., Blood Panel)</option>
                                        <option value="Prescription" className="dark:bg-slate-900">Prescription Slip</option>
                                        <option value="Immunization" className="dark:bg-slate-900">Immunization Record</option>
                                        <option value="Imaging" className="dark:bg-slate-900">Medical Imaging (e.g., MRI, X-Ray)</option>
                                    </Select>
                                    {errors.category && (
                                        <p className="text-[10px] text-rose-500 font-bold mt-1.5">
                                            {errors.category.message}
                                        </p>
                                    )}
                                </div>

                                {/* Accessible Drag and Drop Dropzone */}
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                                        Choose Medical File
                                    </label>
                                    <div 
                                        tabIndex={isUploading ? undefined : 0}
                                        role="button"
                                        aria-label="Upload file dropzone. Press Space or Enter to browse files."
                                        onKeyDown={handleDropzoneKeyDown}
                                        onClick={() => !isUploading && fileInputRef.current?.click()}
                                        className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 ${
                                            selectedFile 
                                                ? 'border-emerald-500 bg-emerald-50/10 dark:bg-emerald-950/10' 
                                                : fileError 
                                                    ? 'border-rose-300 bg-rose-50/10 dark:border-rose-950/20 dark:bg-rose-950/10 hover:border-rose-400' 
                                                    : 'border-slate-200 dark:border-slate-800 hover:border-primary-400 hover:bg-slate-50/50 dark:hover:bg-slate-900/50'
                                        }`}
                                    >
                                        <input
                                            id="file-upload"
                                            type="file"
                                            ref={fileInputRef}
                                            accept=".pdf,.png,.jpg,.jpeg,.dicom"
                                            onChange={handleFileChange}
                                            disabled={isUploading}
                                            className="hidden"
                                        />
                                        {selectedFile ? (
                                            <div className="space-y-2">
                                                <div className="inline-flex items-center justify-center w-11 h-11 bg-emerald-100 dark:bg-emerald-950 rounded-full text-emerald-600 dark:text-emerald-400 shadow-sm shadow-emerald-100 dark:shadow-none">
                                                    <CheckCircle className="w-5.5 h-5.5 animate-bounce" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black text-slate-900 dark:text-slate-100 truncate max-w-xs">{selectedFile.name}</p>
                                                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold mt-0.5">{selectedFile.size}</p>
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="link"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedFile(null);
                                                    }}
                                                    className="h-auto p-0 text-[10px] font-bold text-rose-500 hover:text-rose-600"
                                                >
                                                    Clear Selected File
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="space-y-2 select-none">
                                                <UploadCloud className="w-9 h-9 text-slate-400 dark:text-slate-500 mx-auto" />
                                                <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                                                    <span className="text-primary-600 dark:text-primary-400 font-bold hover:underline">Click to browse</span> or drag medical file
                                                </div>
                                                <p className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold tracking-wide">PDF, PNG, JPG, or DICOM up to 20MB</p>
                                            </div>
                                        )}
                                    </div>
                                    {fileError && (
                                        <p className="text-[10px] text-rose-500 font-bold mt-1.5">
                                            {fileError}
                                        </p>
                                    )}
                                </div>

                                {/* Simulated Upload progress bar */}
                                {isUploading && (
                                    <div className="space-y-2 animate-in fade-in duration-300">
                                        <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 dark:text-slate-400">
                                            <span>Encrypting & Uploading...</span>
                                            <span>{uploadProgress}%</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-emerald-500 transition-all duration-200 rounded-full"
                                                style={{ width: `${uploadProgress}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                )}

                                {/* Upload Button */}
                                <Button
                                    type="submit"
                                    disabled={isUploading}
                                    className="w-full h-11 text-xs"
                                >
                                    {isUploading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin mr-1" />
                                            Encrypting Record...
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="w-4 h-4 mr-1" />
                                            Upload Record
                                        </>
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>

            </div>

        </div>
    );
};

export default PatientDashboard;
