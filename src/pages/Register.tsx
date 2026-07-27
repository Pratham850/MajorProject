import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Lock, Mail, FileText, ChevronRight, Loader2, User, UserCheck, Shield } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import { useToast } from '@/components/ui/toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Define Registration Schema using Zod
const registerSchema = z.object({
    name: z.string()
        .min(2, { message: 'Full name must be at least 2 characters long' }),
    email: z.string()
        .min(1, { message: 'Email address is required' })
        .email({ message: 'Please enter a valid email address (e.g., name@hospital.com)' }),
    password: z.string()
        .min(8, { message: 'Password must be at least 8 characters long' })
        .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
        .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
        .regex(/[0-9]/, { message: 'Password must contain at least one digit' })
        .regex(/[^A-Za-z0-9]/, { message: 'Password must contain at least one special character' }),
    confirmPassword: z.string()
        .min(1, { message: 'Please confirm your password' }),
    role: z.enum(['doctor', 'patient', 'researcher'])
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword']
});

type RegisterFormData = z.infer<typeof registerSchema>;

const Register: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors }
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
            role: 'patient' // Default role
        }
    });

    const selectedRole = watch('role');

    const onSubmit = async (data: RegisterFormData) => {
        setIsLoading(true);
        try {
            // Register user
            await api.post('/auth/register', {
                name: data.name,
                email: data.email,
                password: data.password,
                role: data.role
            });

            // Automatically login after registration
            const loginResponse = await api.post('/auth/login', {
                email: data.email,
                password: data.password
            });

            const { access_token, refresh_token, user: userData } = loginResponse.data;

            // Perform context-based login
            login(access_token, refresh_token, {
                id: userData.id,
                name: userData.name,
                email: userData.email,
                role: userData.role
            });

            toast.success(`Welcome to HealthShare, ${data.name}! Your account has been registered successfully.`, 'Registration Complete');
            navigate('/');
        } catch (error: any) {
            console.error('Registration error:', error);
            const errorMsg = error.response?.data?.detail || 'An error occurred during registration. Please review your input details.';
            toast.error(errorMsg, 'Registration Failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 flex items-center justify-center p-4 py-12 md:py-16">
            <div className="w-full max-w-xl space-y-6">
                {/* Logo and Header */}
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-600 rounded-2xl mb-4 shadow-lg shadow-primary-200 dark:shadow-none animate-in zoom-in duration-500">
                        <FileText className="text-white w-7 h-7" />
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Create HealthShare Account</h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1">Join the secure healthcare data exchange platform</p>
                </div>

                {/* Form Card */}
                <Card className="shadow-xl shadow-slate-100/60 dark:shadow-none p-6 md:p-8 bg-white dark:bg-slate-900 border border-slate-100/80 dark:border-slate-800 animate-in fade-in duration-700">
                    <CardHeader className="pb-6 pt-0 px-0 text-center">
                        <CardTitle className="text-xl font-black text-slate-900 dark:text-slate-100">Request Access</CardTitle>
                        <CardDescription>Enter details to submit a HIPAA safe registry application</CardDescription>
                    </CardHeader>

                    <CardContent className="p-0">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
                            
                            {/* Name Input */}
                            <div>
                                <label htmlFor="name" className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                                    Full Name
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-550 w-4 h-4" />
                                    <Input
                                        id="name"
                                        type="text"
                                        className="pl-10 text-slate-900 dark:text-slate-100"
                                        {...register('name')}
                                        aria-invalid={errors.name ? 'true' : 'false'}
                                        aria-describedby={errors.name ? 'name-error' : undefined}
                                        disabled={isLoading}
                                        error={!!errors.name}
                                        placeholder="Dr. John Doe / Sarah Johnson"
                                    />
                                </div>
                                {errors.name && (
                                    <p id="name-error" className="text-[10px] text-rose-500 font-bold mt-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                                        {errors.name.message}
                                    </p>
                                )}
                            </div>

                            {/* Email Input */}
                            <div>
                                <label htmlFor="email" className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-550 w-4 h-4" />
                                    <Input
                                        id="email"
                                        type="email"
                                        className="pl-10 text-slate-900 dark:text-slate-100"
                                        {...register('email')}
                                        aria-invalid={errors.email ? 'true' : 'false'}
                                        aria-describedby={errors.email ? 'email-error' : undefined}
                                        disabled={isLoading}
                                        error={!!errors.email}
                                        placeholder="name@hospital.com"
                                    />
                                </div>
                                {errors.email && (
                                    <p id="email-error" className="text-[10px] text-rose-500 font-bold mt-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                                        {errors.email.message}
                                    </p>
                                )}
                            </div>

                            {/* Role Segment Selector */}
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                                    Select Account Role
                                </label>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    
                                    {/* Doctor Option */}
                                    <button
                                        type="button"
                                        onClick={() => setValue('role', 'doctor')}
                                        disabled={isLoading}
                                        className={`p-4 rounded-2xl border text-left flex flex-col items-start gap-2 transition-all ${
                                            selectedRole === 'doctor'
                                                ? 'border-primary-500 bg-primary-50/50 ring-4 ring-primary-50 dark:bg-primary-950/20 dark:ring-primary-950/30'
                                                : 'border-slate-100 dark:border-slate-850 bg-slate-50/20 dark:bg-slate-900/40 hover:border-slate-200 dark:hover:border-slate-800 hover:bg-slate-50/60 dark:hover:bg-slate-900/60'
                                        }`}
                                    >
                                        <div className={`p-2 rounded-xl ${selectedRole === 'doctor' ? 'bg-primary-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                                            <UserCheck className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-black text-slate-900 dark:text-slate-100">Doctor</h4>
                                            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug font-semibold">Manage patients & share records</p>
                                        </div>
                                    </button>

                                    {/* Patient Option */}
                                    <button
                                        type="button"
                                        onClick={() => setValue('role', 'patient')}
                                        disabled={isLoading}
                                        className={`p-4 rounded-2xl border text-left flex flex-col items-start gap-2 transition-all ${
                                            selectedRole === 'patient'
                                                ? 'border-primary-500 bg-primary-50/50 ring-4 ring-primary-50 dark:bg-primary-950/20 dark:ring-primary-950/30'
                                                : 'border-slate-100 dark:border-slate-850 bg-slate-50/20 dark:bg-slate-900/40 hover:border-slate-200 dark:hover:border-slate-800 hover:bg-slate-50/60 dark:hover:bg-slate-900/60'
                                        }`}
                                    >
                                        <div className={`p-2 rounded-xl ${selectedRole === 'patient' ? 'bg-primary-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                                            <User className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-black text-slate-900 dark:text-slate-100">Patient</h4>
                                            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug font-semibold">Access & consent data sharing</p>
                                        </div>
                                    </button>

                                    {/* Researcher Option */}
                                    <button
                                        type="button"
                                        onClick={() => setValue('role', 'researcher')}
                                        disabled={isLoading}
                                        className={`p-4 rounded-2xl border text-left flex flex-col items-start gap-2 transition-all ${
                                            selectedRole === 'researcher'
                                                ? 'border-primary-500 bg-primary-50/50 ring-4 ring-primary-50 dark:bg-primary-950/20 dark:ring-primary-950/30'
                                                : 'border-slate-100 dark:border-slate-850 bg-slate-50/20 dark:bg-slate-900/40 hover:border-slate-200 dark:hover:border-slate-800 hover:bg-slate-50/60 dark:hover:bg-slate-900/60'
                                        }`}
                                    >
                                        <div className={`p-2 rounded-xl ${selectedRole === 'researcher' ? 'bg-primary-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                                            <Shield className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-black text-slate-900 dark:text-slate-100">Researcher</h4>
                                            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug font-semibold">Request anonymized cohorts</p>
                                        </div>
                                    </button>
                                </div>
                                {errors.role && (
                                    <p className="text-[10px] text-rose-500 font-bold mt-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                                        {errors.role.message}
                                    </p>
                                )}
                            </div>

                            {/* Password Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Password */}
                                <div>
                                    <label htmlFor="password" className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-550 w-4 h-4" />
                                        <Input
                                            id="password"
                                            type="password"
                                            className="pl-10 text-slate-900 dark:text-slate-100"
                                            {...register('password')}
                                            aria-invalid={errors.password ? 'true' : 'false'}
                                            aria-describedby={errors.password ? 'password-error' : undefined}
                                            disabled={isLoading}
                                            error={!!errors.password}
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    {errors.password && (
                                        <p id="password-error" className="text-[10px] text-rose-500 font-bold mt-1.5 animate-in fade-in slide-in-from-top-1 duration-200 leading-snug">
                                            {errors.password.message}
                                        </p>
                                    )}
                                </div>

                                {/* Confirm Password */}
                                <div>
                                    <label htmlFor="confirmPassword" className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                                        Confirm Password
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-550 w-4 h-4" />
                                        <Input
                                            id="confirmPassword"
                                            type="password"
                                            className="pl-10 text-slate-900 dark:text-slate-100"
                                            {...register('confirmPassword')}
                                            aria-invalid={errors.confirmPassword ? 'true' : 'false'}
                                            aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
                                            disabled={isLoading}
                                            error={!!errors.confirmPassword}
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    {errors.confirmPassword && (
                                        <p id="confirmPassword-error" className="text-[10px] text-rose-500 font-bold mt-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                                            {errors.confirmPassword.message}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* HIPAA Compliance Note */}
                            <div className="bg-slate-50 dark:bg-slate-950/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-850 flex items-start gap-3">
                                <Shield className="w-4.5 h-4.5 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold leading-normal">
                                    By signing up, you agree to HealthShare's terms of service. All account creations require end-to-end audit logging to remain strictly compliant with <strong>HIPAA & GDPR regulations</strong>.
                                </p>
                            </div>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-11 text-xs group"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin mr-1" />
                                        Creating Account...
                                    </>
                                ) : (
                                    <>
                                        Register Account
                                        <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>

                    <p className="text-center text-slate-500 dark:text-slate-400 text-xs font-semibold mt-8">
                        Already have an account?{' '}
                        <Link to="/login" className="text-primary-600 dark:text-primary-400 font-bold hover:underline">
                            Sign In
                        </Link>
                    </p>
                </Card>

                <p className="text-center text-slate-400 dark:text-slate-500 text-[10px] font-bold">
                    &copy; 2026 HealthShare Inc. All rights reserved.
                </p>
            </div>
        </div>
    );
};

export default Register;
