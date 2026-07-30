import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Lock,
  Mail,
  User,
  Activity,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Shield,
  ArrowRight,
} from 'lucide-react';
import { authService } from '../services/auth.service';
import { useToast } from '../components/ui/toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

// Registration Schema with Zod validation
const registerSchema = z
  .object({
    name: z.string().min(2, { message: 'Full name must be at least 2 characters' }),
    email: z
      .string()
      .min(1, { message: 'Email address is required' })
      .email({ message: 'Please enter a valid email address (e.g., name@healthshare.org)' }),
    password: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters long' }),
    confirmPassword: z.string().min(1, { message: 'Please confirm your password' }),
    role: z.enum(['patient', 'doctor', 'researcher']),
    terms: z.boolean().refine((val) => val === true, {
      message: 'You must accept the Terms & Conditions',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export const Register: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { addToast } = useToast();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'patient',
      terms: false,
    },
  });

  const passwordValue = watch('password') || '';

  // Password strength calculation helper (UI only)
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', color: 'bg-slate-200 dark:bg-slate-700', text: '' };
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 25, label: 'Weak', color: 'bg-rose-500', text: 'text-rose-500' };
    if (score <= 3) return { score: 65, label: 'Medium', color: 'bg-amber-500', text: 'text-amber-500' };
    return { score: 100, label: 'Strong', color: 'bg-emerald-500', text: 'text-emerald-500' };
  };

  const strength = getPasswordStrength(passwordValue);

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setSubmitError(null);
    setSuccessMessage(null);

    try {
      await authService.register({
        name: data.name,
        email: data.email,
        password: data.password,
        confirm_password: data.confirmPassword,
        role: data.role,
      });

      addToast({
        type: 'success',
        title: 'Account Registered',
        message: 'Registration successful! Redirecting to login page...',
      });

      setSuccessMessage('Registration successful! Redirecting to login page...');
      setTimeout(() => {
        navigate('/login', {
          state: { message: 'Account registered successfully. Please sign in.' },
        });
      }, 1500);
    } catch (err: any) {
      setSubmitError(err.message || 'Registration failed. Please review your input details.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 sm:p-6 py-10 transition-colors duration-300">
      <div className="w-full max-w-lg space-y-6">
        {/* HealthShare Brand Logo & Title */}
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

        {/* Register Form Card */}
        <Card className="shadow-2xl shadow-slate-200/50 dark:shadow-none p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl">
          <CardHeader className="pb-6 pt-0 px-0 text-center space-y-1.5">
            <CardTitle className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Create Your Account
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
              Join HealthShare to securely access, manage, and exchange health data.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0 space-y-5">
            {/* Loading Indicator Banner */}
            {isLoading && (
              <div className="p-3.5 bg-primary-50 dark:bg-primary-950/60 border border-primary-200 dark:border-primary-800 rounded-2xl flex items-center gap-3 text-xs text-primary-700 dark:text-primary-300 animate-fade-in">
                <Loader2 className="w-4 h-4 animate-spin shrink-0 text-primary-600" />
                <span>Submitting registration details...</span>
              </div>
            )}

            {/* Success Message Banner */}
            {successMessage && !isLoading && (
              <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center gap-3 text-xs text-emerald-700 dark:text-emerald-300 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Error Message Banner */}
            {submitError && !isLoading && (
              <div className="p-3.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-2xl flex items-center gap-3 text-xs text-rose-700 dark:text-rose-300 animate-fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
                <span className="flex-1">{submitError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              {/* Full Name Field */}
              <div className="space-y-1.5">
                <label htmlFor="name" className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    id="name"
                    type="text"
                    className="pl-10 text-xs text-slate-900 dark:text-slate-100 rounded-xl"
                    {...register('name')}
                    aria-invalid={errors.name ? 'true' : 'false'}
                    disabled={isLoading}
                    error={!!errors.name}
                    placeholder="Sarah Jenkins"
                  />
                </div>
                {errors.name && (
                  <p className="text-[10px] text-rose-500 font-semibold mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Email Address Field */}
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

              {/* Role Dropdown Selector (Patient, Doctor, Researcher ONLY - No Admin) */}
              <div className="space-y-1.5">
                <label htmlFor="role" className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Account Role
                </label>
                <div className="relative">
                  <select
                    id="role"
                    {...register('role')}
                    disabled={isLoading}
                    className="w-full bg-slate-100 dark:bg-slate-800/70 text-slate-900 dark:text-slate-100 text-xs rounded-xl px-3.5 py-2.5 border border-transparent focus:border-primary-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all font-medium"
                  >
                    <option value="patient">Patient (Manage record consents & history)</option>
                    <option value="doctor">Doctor (Clinical practice workspace)</option>
                    <option value="researcher">Researcher (Cohort query & analytics)</option>
                  </select>
                </div>
                {errors.role && (
                  <p className="text-[10px] text-rose-500 font-semibold mt-1">
                    {errors.role.message}
                  </p>
                )}
              </div>

              {/* Password & Confirm Password Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Password Field */}
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

                {/* Confirm Password Field */}
                <div className="space-y-1.5">
                  <label htmlFor="confirmPassword" className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      className="pl-10 pr-10 text-xs text-slate-900 dark:text-slate-100 rounded-xl"
                      {...register('confirmPassword')}
                      aria-invalid={errors.confirmPassword ? 'true' : 'false'}
                      disabled={isLoading}
                      error={!!errors.confirmPassword}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                      title={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-[10px] text-rose-500 font-semibold mt-1">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Password Strength Indicator */}
              {passwordValue && (
                <div className="space-y-1 pt-1 animate-fade-in">
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                    <span>Password Strength:</span>
                    <span className={strength.text}>{strength.label}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${strength.color}`}
                      style={{ width: `${strength.score}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Terms & Conditions Checkbox */}
              <div className="space-y-1 pt-2">
                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    {...register('terms')}
                    disabled={isLoading}
                    className="w-4 h-4 mt-0.5 rounded border-slate-300 dark:border-slate-700 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-xs text-slate-600 dark:text-slate-400 leading-normal">
                    I agree to the{' '}
                    <a href="#terms" className="text-primary-600 dark:text-primary-400 font-bold hover:underline">
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="#privacy" className="text-primary-600 dark:text-primary-400 font-bold hover:underline">
                      Privacy Policy
                    </a>.
                  </span>
                </label>
                {errors.terms && (
                  <p className="text-[10px] text-rose-500 font-semibold mt-1">
                    {errors.terms.message}
                  </p>
                )}
              </div>

              {/* Create Account Button (Disabled until form is valid) */}
              <Button
                type="submit"
                disabled={!isValid || isLoading}
                className="w-full h-11 text-xs font-bold bg-gradient-to-r from-primary-600 to-indigo-600 text-white rounded-xl shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all gap-2 mt-4"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>

          {/* Login Link Footer */}
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
            <span>Already have an account? </span>
            <Link to="/login" className="text-primary-600 dark:text-primary-400 font-bold hover:underline">
              Login
            </Link>
          </div>
        </Card>

        {/* HIPAA Compliance Note */}
        <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 dark:text-slate-500 font-medium text-center">
          <Shield className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          <span>HIPAA & GDPR Audited Registration Infrastructure</span>
        </div>
      </div>
    </div>
  );
};

export default Register;
