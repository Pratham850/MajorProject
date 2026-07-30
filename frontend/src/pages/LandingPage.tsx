import React from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  ShieldCheck,
  FileText,
  Brain,
  Users,
  ArrowRight,
  Lock,
  UserPlus,
  CheckCircle2,
  KeyRound,
  Shield,
  Sparkles,
  Server,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent } from '../components/ui/card';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans flex flex-col antialiased selection:bg-primary-500 selection:text-white transition-colors duration-300">
      {/* 1. Public Header Navigation */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Logo & Brand Title */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-primary-500/20 group-hover:scale-105 transition-transform">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Health<span className="text-primary-600 dark:text-primary-400">Share</span>
              </span>
              <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest -mt-1">
                Medical Platform
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-600 dark:text-slate-400">
            <a href="#features" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
              Features
            </a>
            <a href="#why-healthshare" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
              Why HealthShare?
            </a>
            <a href="#security" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
              Security & HIPAA
            </a>
          </nav>

          {/* Public Call-to-Action Buttons */}
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm" className="font-bold text-xs gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                <span>Login</span>
              </Button>
            </Link>

            <Link to="/register">
              <Button size="sm" className="font-bold text-xs bg-gradient-to-r from-primary-600 to-indigo-600 text-white shadow-md hover:shadow-lg gap-1.5">
                <UserPlus className="w-3.5 h-3.5" />
                <span>Create Account</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        {/* Background Decorative Elements */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-primary-500/10 to-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-10 right-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-50 dark:bg-primary-950/60 border border-primary-200/80 dark:border-primary-800/60 text-xs font-bold text-primary-700 dark:text-primary-300 animate-fade-in">
              <Sparkles className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
              <span>Next-Generation Healthcare Information Exchange</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.15]">
              Secure Health Data Sharing &{' '}
              <span className="bg-gradient-to-r from-primary-600 via-indigo-600 to-emerald-600 bg-clip-text text-transparent">
                AI-Powered Predictive Care
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal max-w-2xl mx-auto">
              Empowering patients, clinicians, and researchers with HIPAA-compliant medical record exchange, granular consent management, and machine learning clinical intelligence.
            </p>

            {/* Hero CTA Buttons */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto font-bold text-sm px-8 py-3.5 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white shadow-xl shadow-primary-600/20 gap-2">
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>

              <Link to="/login" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:w-auto font-bold text-sm px-8 py-3.5 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 gap-2">
                  <Lock className="w-4 h-4 text-slate-500" />
                  <span>Login to Portal</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Hero Feature Preview Graphic */}
          <div className="mt-16 relative max-w-4xl mx-auto">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 p-4 sm:p-6 shadow-2xl backdrop-blur-md">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/60 flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 rounded-lg">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">HIPAA Secured</p>
                    <p className="text-[10px] text-slate-500">256-bit Encryption</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/60 flex items-center gap-3">
                  <div className="p-2.5 bg-primary-100 dark:bg-primary-950/60 text-primary-600 rounded-lg">
                    <Brain className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">AI Prediction</p>
                    <p className="text-[10px] text-slate-500">99.4% CKD Accuracy</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/60 flex items-center gap-3">
                  <div className="p-2.5 bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 rounded-lg">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Role-Based Access</p>
                    <p className="text-[10px] text-slate-500">Patients & Clinicians</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Core Feature Cards Section */}
      <section id="features" className="py-16 bg-white dark:bg-slate-900/50 border-y border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold text-primary-600 dark:text-primary-400 uppercase tracking-widest mb-2">
              Platform Features
            </h2>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Comprehensive Health Data Infrastructure
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <Card className="border-slate-200/80 dark:border-slate-800 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 flex items-center justify-center shadow-xs">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Secure Medical Records
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Seamless EHR integration, standardized FHIR formats, and encrypted medical record exchange across health networks.
                </p>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="border-slate-200/80 dark:border-slate-800 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Patient Consent Management
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Empower patients with full sovereignty over their health data through granular access permissions and time-bound consents.
                </p>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="border-slate-200/80 dark:border-slate-800 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-xs">
                  <Brain className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  AI-Powered CKD Prediction
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Machine learning predictive models that assist clinicians in early detection and risk assessment of Chronic Kidney Disease.
                </p>
              </CardContent>
            </Card>

            {/* Feature 4 */}
            <Card className="border-slate-200/80 dark:border-slate-800 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-xs">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Role-Based Access Control
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Tailored RBAC workflows designed specifically for Patients, Doctors, Researchers, and System Administrators.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 4. "Why HealthShare?" Section */}
      <section id="why-healthshare" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800/60 text-xs font-bold text-indigo-700 dark:text-indigo-300">
                <Shield className="w-3.5 h-3.5 text-indigo-600" />
                <span>The HealthShare Advantage</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                Why Choose HealthShare for Your Data Infrastructure?
              </h2>

              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Traditional healthcare systems isolate patient records in proprietary silos. HealthShare bridges these gaps with a secure, federated exchange model that preserves patient privacy while accelerating clinical discoveries.
              </p>

              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3">
                  <div className="p-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 mt-0.5 shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Patient Data Sovereignty</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Patients retain complete ownership over who accesses their records and can revoke consent at any time.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 mt-0.5 shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Immutable HIPAA Audit Logs</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Every access request, record view, and consent update is cryptographically logged for auditability.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 mt-0.5 shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Clinical Decision Support</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Integrated AI models give doctors real-time predictive risk metrics during consultations.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Link to="/register">
                  <Button className="font-bold text-xs bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 px-6 py-2.5">
                    Get Started Today
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Card Illustration */}
            <div className="relative">
              <div className="rounded-3xl bg-gradient-to-tr from-primary-600 to-indigo-600 p-8 text-white shadow-2xl space-y-6">
                <div className="flex items-center justify-between border-b border-white/20 pb-4">
                  <div className="flex items-center gap-3">
                    <Server className="w-6 h-6 text-emerald-300" />
                    <span className="font-bold text-sm">Federated Health Node</span>
                  </div>
                  <Badge variant="success" size="sm">Active Network</Badge>
                </div>

                <div className="space-y-3">
                  <div className="p-3 bg-white/10 rounded-xl backdrop-blur-md flex items-center justify-between text-xs">
                    <span>Patient Consent Verification</span>
                    <span className="font-mono font-bold text-emerald-300">Verified</span>
                  </div>

                  <div className="p-3 bg-white/10 rounded-xl backdrop-blur-md flex items-center justify-between text-xs">
                    <span>CKD Model Prediction Confidence</span>
                    <span className="font-mono font-bold text-indigo-200">99.4%</span>
                  </div>

                  <div className="p-3 bg-white/10 rounded-xl backdrop-blur-md flex items-center justify-between text-xs">
                    <span>HIPAA Audit Trail Compliance</span>
                    <span className="font-mono font-bold text-emerald-300">100% Passed</span>
                  </div>
                </div>

                <p className="text-xs text-primary-100 italic pt-2">
                  "HealthShare provides modern infrastructure for connected healthcare ecosystem."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Simple Footer */}
      <footer className="mt-auto bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Logo & Copyright */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary-600 text-white flex items-center justify-center font-bold">
              <Activity className="w-4 h-4" />
            </div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              © {new Date().getFullYear()} HealthShare Platform. All rights reserved.
            </span>
          </div>

          {/* Footer Nav Links */}
          <div className="flex items-center gap-6 text-xs font-semibold text-slate-600 dark:text-slate-400">
            <a href="#about" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
              About
            </a>
            <a href="#contact" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
              Contact
            </a>
            <a href="#privacy" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
              Privacy Policy
            </a>
            <a href="#terms" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
