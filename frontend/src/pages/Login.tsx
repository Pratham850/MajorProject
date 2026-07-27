import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Lock, Mail, FileText, ChevronRight, Loader2, Shield } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import { useToast } from '@/components/ui/toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Define Validation Schema using Zod
const loginSchema = z.object({
    email: z.string()
        .min(1, { message: 'Email address is required' })
        .email({ message: 'Please enter a valid email address (e.g., name@hospital.com)' }),
    password: z.string()
        .min(8, { message: 'Password must be at least 8 characters long' })
});

type LoginFormData = z.infer<typeof loginSchema>;

const Login: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: ''
        }
    });

    const onSubmit = async (data: LoginFormData) => {
        setIsLoading(true);
        try {
            const response = await api.post('/auth/login', {
                email: data.email,
                password: data.password
            });
            
            const { access_token, refresh_token, user: userData } = response.data;

            // Perform context-based login
            login(access_token, refresh_token, {
                id: userData.id,
                name: userData.name,
                email: userData.email,
                role: userData.role
            });
            
            toast.success(`Welcome back, ${userData.name}!`, 'Login Successful');
            navigate('/');
        } catch (error: any) {
            console.error('Login error:', error);
            const errorMsg = error.response?.data?.detail || 'An error occurred during authentication. Please check your credentials.';
            toast.error(errorMsg, 'Login Failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 flex items-center justify-center p-4">
            <div className="w-full max-w-md space-y-6">
                {/* Logo and header */}
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-600 rounded-2xl mb-4 shadow-lg shadow-primary-200 dark:shadow-none animate-in zoom-in duration-500">
                        <FileText className="text-white w-7 h-7" />
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">HealthShare</h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1">Secure healthcare data exchange</p>
                </div>

                {/* Login Form Card */}
                <Card className="shadow-xl shadow-slate-100/60 dark:shadow-none p-6 md:p-8 bg-white dark:bg-slate-900 border border-slate-100/80 dark:border-slate-800 animate-in fade-in duration-700">
                    <CardHeader className="pb-6 pt-0 px-0 text-center">
                        <CardTitle className="text-xl font-black text-slate-900 dark:text-slate-100">Welcome Back</CardTitle>
                        <CardDescription>Enter your credentials to access the platform</CardDescription>
                    </CardHeader>
                    
                    <CardContent className="p-0">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
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
                                    <p
                                        id="email-error"
                                        className="text-[10px] text-rose-500 font-bold mt-1.5 animate-in fade-in slide-in-from-top-1 duration-200"
                                    >
                                        {errors.email.message}
                                    </p>
                                )}
                            </div>

                            {/* Password Input */}
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
                                    <p
                                        id="password-error"
                                        className="text-[10px] text-rose-500 font-bold mt-1.5 animate-in fade-in slide-in-from-top-1 duration-200"
                                    >
                                        {errors.password.message}
                                    </p>
                                )}
                            </div>

                            {/* Remember me & Forgot Password */}
                            <div className="flex items-center justify-between text-xs">
                                <label className="flex items-center gap-2 cursor-pointer group select-none">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 rounded border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 text-primary-600 focus:ring-primary-500 focus:ring-offset-0"
                                        disabled={isLoading}
                                    />
                                    <span className="text-slate-500 dark:text-slate-400 font-semibold group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors">
                                        Remember me
                                    </span>
                                </label>
                                <a
                                    href="#"
                                    className="font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 underline-offset-4 hover:underline"
                                >
                                    Forgot password?
                                </a>
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
                                        Signing In...
                                    </>
                                ) : (
                                    <>
                                        Sign In
                                        <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>

                    <p className="text-center text-slate-500 dark:text-slate-400 text-xs font-semibold mt-8">
                        New to platform?{' '}
                        <Link to="/register" className="text-primary-600 dark:text-primary-400 font-bold hover:underline">
                            Request Access / Register
                        </Link>
                    </p>
                </Card>

                <div className="flex justify-center items-start gap-2 bg-slate-100/50 dark:bg-slate-900/50 rounded-2xl p-4 border border-slate-200/40 dark:border-slate-800/80 max-w-sm mx-auto">
                    <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold leading-normal">
                        HIPAA Compliant & Secured Data Transfer. All activity is end-to-end audited.
                    </p>
                </div>

                <p className="text-center text-slate-400 dark:text-slate-500 text-[10px] font-bold">
                    &copy; 2026 HealthShare Inc. All rights reserved.
                </p>
            </div>
        </div>
    );
};

export default Login;
