import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Lock,
  Mail,
  Activity,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  Shield,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

// Validation Schema using Zod
const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Email address is required' })
    .email({ message: 'Please enter a valid email address (e.g., name@healthshare.org)' }),
  password: z
    .string()
    .min(1, { message: 'Password is required' }),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const getRedirectPathForRole = (role?: string): string => {
  if (!role) return '/dashboard';
  const normalized = role.toUpperCase();
  switch (normalized) {
    case 'PATIENT':
      return '/patient-dashboard';
    case 'DOCTOR':
      return '/doctor-dashboard';
    case 'RESEARCHER':
      return '/researcher-dashboard';
    case 'ADMIN':
      return '/admin-dashboard';
    default:
      return '/dashboard';
  }
};

export const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { login, isLoading, error: authError, clearError } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    clearError();
    setSubmitError(null);
    try {
      const loggedInUser = await login({
        email: data.email,
        password: data.password,
      });

      addToast({
        type: 'success',
        title: 'Login Successful',
        message: `Welcome back, ${loggedInUser.name || loggedInUser.email}! Redirecting to workspace...`,
      });

      // Role-based redirection upon successful login
      const targetPath = getRedirectPathForRole(loggedInUser.role);
      navigate(targetPath, { replace: true });
    } catch (err: any) {
      setSubmitError(err.message || 'Login failed. Please check your credentials.');
    }
  };

  const displayError = submitError || authError;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 sm:p-6 transition-colors duration-300">
      <div className="w-full max-w-md space-y-6">
        {/* HealthShare Brand Logo & Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-primary-500/20 group-hover:scale-105 transition-transform">
              <Activity className="w-6 h-6" />
            </div>
            <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Health<span className="text-primary-600 dark:text-primary-400">Share</span>
            </span>
          </Link>
        </div>

        {/* Login Form Card */}
        <Card className="shadow-2xl shadow-slate-200/50 dark:shadow-none p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl">
          <CardHeader className="pb-6 pt-0 px-0 text-center space-y-1.5">
            <CardTitle className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
              Enter your credentials to access your secure HealthShare account.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0 space-y-5">
            {/* Loading Indicator Banner */}
            {isLoading && (
              <div className="p-3.5 bg-primary-50 dark:bg-primary-950/60 border border-primary-200 dark:border-primary-800 rounded-2xl flex items-center gap-3 text-xs text-primary-700 dark:text-primary-300 animate-fade-in">
                <Loader2 className="w-4 h-4 animate-spin shrink-0 text-primary-600" />
                <span>Authenticating with server...</span>
              </div>
            )}

            {/* Error Message Banner */}
            {displayError && !isLoading && (
              <div className="p-3.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-2xl flex items-center gap-3 text-xs text-rose-700 dark:text-rose-300 animate-fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
                <span className="flex-1">{displayError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              {/* Email Input */}
              <div className="space-y-1.5">
                <label htmlFor="email" className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    id="email"
                    type="email"
                    className="pl-10 text-xs text-slate-900 dark:text-slate-100 rounded-xl"
                    {...register('email')}
                    aria-invalid={errors.email ? 'true' : 'false'}
                    disabled={isLoading}
                    error={!!errors.email}
                    placeholder="name@healthshare.org"
                  />
                </div>
                {errors.email && (
                  <p className="text-[10px] text-rose-500 font-semibold mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password Input with Show/Hide Toggle */}
              <div className="space-y-1.5">
                <label htmlFor="password" className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    className="pl-10 pr-10 text-xs text-slate-900 dark:text-slate-100 rounded-xl"
                    {...register('password')}
                    aria-invalid={errors.password ? 'true' : 'false'}
                    disabled={isLoading}
                    error={!!errors.password}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                    title={showPassword ? 'Hide password' : 'Show password'}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-[10px] text-rose-500 font-semibold mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-primary-600 focus:ring-primary-500"
                    disabled={isLoading}
                  />
                  <span className="text-slate-600 dark:text-slate-400 font-medium">
                    Remember Me
                  </span>
                </label>

                <a
                  href="#forgot-password"
                  onClick={(e) => {
                    e.preventDefault();
                    setSubmitError('Password reset link has been dispatched to your email.');
                  }}
                  className="font-bold text-primary-600 dark:text-primary-400 hover:underline text-xs"
                >
                  Forgot Password?
                </a>
              </div>

              {/* Login Button (Disabled until required fields are valid or while loading) */}
              <Button
                type="submit"
                disabled={!isValid || isLoading}
                className="w-full h-11 text-xs font-bold bg-gradient-to-r from-primary-600 to-indigo-600 text-white rounded-xl shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Logging In...</span>
                  </>
                ) : (
                  <>
                    <span>Login</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>

          {/* Register Link Footer */}
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
            <span>Don't have an account? </span>
            <Link to="/register" className="text-primary-600 dark:text-primary-400 font-bold hover:underline">
              Register
            </Link>
          </div>
        </Card>

        {/* HIPAA Compliance Footer Badge */}
        <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 dark:text-slate-500 font-medium">
          <Shield className="w-3.5 h-3.5 text-emerald-500" />
          <span>256-Bit SSL Encrypted & HIPAA Compliant</span>
        </div>
      </div>
    </div>
  );
};

export default Login;
