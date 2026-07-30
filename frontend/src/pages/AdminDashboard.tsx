import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/toast';
import { StatCard } from '../components/common/StatCard';
import { HealthChart } from '../components/common/HealthChart';
import { ActivityTimeline, ActivityItem } from '../components/common/ActivityTimeline';
import { DataTable } from '../components/common/DataTable';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogFooter } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Select } from '../components/ui/select';
import { cn } from '../lib/utils';
import {
  Users,
  ShieldAlert,
  Server,
  Database,
  Activity,
  HardDrive,
  Cpu,
  UserCheck,
  UserPlus,
  RefreshCw,
  Lock,
  CheckCircle2,
  AlertTriangle,
  FileCode,
  ShieldCheck,
  KeyRound,
  Settings,
  Bell,
  Sliders,
  FileText,
  Radio,
} from 'lucide-react';

export interface PendingUserApproval {
  id: string;
  name: string;
  email: string;
  requestedRole: 'DOCTOR' | 'RESEARCHER';
  organization: string;
  licenseNumber: string;
  dateSubmitted: string;
}

export interface SystemErrorLog {
  id: string;
  statusCode: 500 | 409 | 422;
  endpoint: string;
  errorMessage: string;
  timestamp: string;
  isResolved: boolean;
}

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const adminName = user?.name || 'System Administrator';

  // --- Modal States ---
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isBackupConfirmOpen, setIsBackupConfirmOpen] = useState(false);
  const [backupLoading, setBackupLoading] = useState(false);

  // --- New User Form State ---
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<'PATIENT' | 'DOCTOR' | 'RESEARCHER' | 'ADMIN'>('DOCTOR');

  // --- Pending User Approvals State ---
  const [pendingApprovals, setPendingApprovals] = useState<PendingUserApproval[]>([
    {
      id: 'app-1',
      name: 'Dr. Robert Langdon',
      email: 'robert.langdon@harvard.edu',
      requestedRole: 'DOCTOR',
      organization: 'Harvard Medical Cardiology',
      licenseNumber: 'MD-90412-MA',
      dateSubmitted: 'Today, 09:15 AM',
    },
    {
      id: 'app-2',
      name: 'Dr. Evelyn Reed',
      email: 'e.reed@biogen-research.org',
      requestedRole: 'RESEARCHER',
      organization: 'BioGen Institute',
      licenseNumber: 'RES-88102-IRB',
      dateSubmitted: 'Yesterday, 04:30 PM',
    },
  ]);

  // --- Notifications & Security Alerts State ---
  const [securityAlerts, setSecurityAlerts] = useState([
    {
      id: 'sec-1',
      title: 'Break-Glass Emergency Access Triggered',
      description: 'Dr. Sarah Jenkins executed emergency access override for patient MRN-9021.',
      timestamp: '45 mins ago',
      severity: 'HIGH' as const,
      isAcknowledged: false,
    },
    {
      id: 'sec-2',
      title: 'Failed Login Spike Detected',
      description: '5 failed authentication attempts from IP 192.168.1.104.',
      timestamp: '2 hours ago',
      severity: 'MEDIUM' as const,
      isAcknowledged: false,
    },
  ]);

  // --- System Errors Log State ---
  const [errorLogs, setErrorLogs] = useState<SystemErrorLog[]>([
    {
      id: 'err-1',
      statusCode: 409,
      endpoint: 'POST /api/v1/auth/register',
      errorMessage: 'IntegrityError: Duplicate entry "sarah.jenkins@healthshare.org" for key "users.email"',
      timestamp: '10 mins ago',
      isResolved: false,
    },
    {
      id: 'err-2',
      statusCode: 422,
      endpoint: 'POST /api/v1/records/upload',
      errorMessage: 'RequestValidationError: Password complexity bound exceeded max 128 characters',
      timestamp: '1 hour ago',
      isResolved: true,
    },
  ]);

  // --- Recent User Registrations Table Data ---
  const [registrations] = useState([
    { id: 1, name: 'Eleanor Vance', email: 'eleanor.vance@gmail.com', role: 'PATIENT', registeredAt: '2026-07-28', status: 'ACTIVE' },
    { id: 2, name: 'Dr. Marcus Brody', email: 'marcus.brody@stjude.org', role: 'DOCTOR', registeredAt: '2026-07-27', status: 'ACTIVE' },
    { id: 3, name: 'BioGen Labs', email: 'query@biogen.org', role: 'RESEARCHER', registeredAt: '2026-07-26', status: 'ACTIVE' },
    { id: 4, name: 'Arthur Pendelton', email: 'arthur.p@healthshare.org', role: 'ADMIN', registeredAt: '2026-07-25', status: 'ACTIVE' },
  ]);

  const regColumns = [
    { key: 'name', header: 'User Full Name', sortable: true },
    { key: 'email', header: 'Email Address' },
    { key: 'role', header: 'Assigned Role', accessor: (r: any) => <Badge variant="secondary">{r.role}</Badge> },
    { key: 'status', header: 'Clearance Status', accessor: (r: any) => <Badge variant="success" dot>{r.status}</Badge> },
    { key: 'registeredAt', header: 'Registered On', sortable: true },
  ];

  // --- Immutable HIPAA Audit Trail Data ---
  const [auditLogs] = useState([
    {
      id: 'aud-101',
      actor: 'Dr. Sarah Jenkins',
      role: 'DOCTOR',
      action: 'EHR_RECORD_READ',
      ip: '192.168.1.45',
      timestamp: '2026-07-28 10:30:15',
      hash: 'a3f9e2b1...',
    },
    {
      id: 'aud-102',
      actor: 'Eleanor Vance',
      role: 'PATIENT',
      action: 'CONSENT_GRANTED',
      ip: '10.0.0.12',
      timestamp: '2026-07-28 09:12:44',
      hash: 'b7c4d1f2...',
    },
    {
      id: 'aud-103',
      actor: 'System Auto-Backup',
      role: 'SYSTEM',
      action: 'DB_SNAPSHOT_CREATED',
      ip: '127.0.0.1',
      timestamp: '2026-07-28 04:00:00',
      hash: 'c8e1a4d9...',
    },
  ]);

  const auditColumns = [
    { key: 'timestamp', header: 'Timestamp', sortable: true },
    { key: 'actor', header: 'Actor Name' },
    { key: 'role', header: 'Role', accessor: (r: any) => <Badge variant="outline">{r.role}</Badge> },
    { key: 'action', header: 'Audit Event Action', accessor: (r: any) => <span className="font-mono text-2xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-primary-700 dark:text-primary-300 font-bold">{r.action}</span> },
    { key: 'ip', header: 'IP Address' },
  ];

  // --- Audit Activity Timeline Data ---
  const [activities] = useState<ActivityItem[]>([
    {
      id: 'act-1',
      title: 'Database Cache Flushed',
      description: 'Flushed Redis session cache & MySQL pool connections.',
      timestamp: '30 mins ago',
      actorName: adminName,
      actorRole: 'ADMIN',
      type: 'audit',
    },
    {
      id: 'act-2',
      title: 'Doctor Account Verified',
      description: 'Approved clearance credentials for Dr. Robert Langdon.',
      timestamp: '1 hour ago',
      actorName: adminName,
      actorRole: 'ADMIN',
      type: 'auth',
    },
    {
      id: 'act-3',
      title: 'Automated Encryption Key Rotation',
      description: 'AES-256 master key rotation cycle executed cleanly.',
      timestamp: '6 hours ago',
      actorName: 'Security Automation Engine',
      actorRole: 'SYSTEM',
      type: 'ml',
    },
  ]);

  // --- Visual System Traffic Chart Data ---
  const trafficChartData = [
    { name: '00:00', value: 120, secondaryValue: 14 },
    { name: '04:00', value: 80, secondaryValue: 8 },
    { name: '08:00', value: 650, secondaryValue: 42 },
    { name: '12:00', value: 980, secondaryValue: 78 },
    { name: '16:00', value: 840, secondaryValue: 64 },
    { name: '20:00', value: 410, secondaryValue: 28 },
  ];

  // --- Handlers ---
  const handleApproveUser = (id: string, name: string) => {
    setPendingApprovals((prev) => prev.filter((a) => a.id !== id));
    addToast({ type: 'success', title: 'Account Approved', message: `Verified and granted clearance to ${name}.` });
  };

  const handleRejectUser = (id: string, name: string) => {
    setPendingApprovals((prev) => prev.filter((a) => a.id !== id));
    addToast({ type: 'warning', title: 'Account Declined', message: `Rejected registration request for ${name}.` });
  };

  const handleAcknowledgeAlert = (id: string) => {
    setSecurityAlerts((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isAcknowledged: true } : s))
    );
    addToast({ type: 'info', title: 'Alert Acknowledged', message: 'Security alert marked as reviewed.' });
  };

  const handleResolveError = (id: string) => {
    setErrorLogs((prev) =>
      prev.map((e) => (e.id === id ? { ...e, isResolved: true } : e))
    );
    addToast({ type: 'success', title: 'Error Resolved', message: 'Marked exception log as resolved.' });
  };

  const handleFlushCache = () => {
    addToast({ type: 'success', title: 'Cache Flushed', message: 'MySQL connection pool & Redis query cache cleared.' });
  };

  const handleExecuteBackup = () => {
    setBackupLoading(true);
    setTimeout(() => {
      setBackupLoading(false);
      setIsBackupConfirmOpen(false);
      addToast({ type: 'success', title: 'Backup Created', message: 'Encrypted database snapshot saved to cloud storage.' });
    }, 1500);
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail) {
      addToast({ type: 'error', title: 'Missing Information', message: 'Please enter name and email.' });
      return;
    }

    addToast({ type: 'success', title: 'User Account Created', message: `Created ${newUserRole} account for ${newUserName}.` });
    setIsAddUserModalOpen(false);
    setNewUserName('');
    setNewUserEmail('');
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* =================================================================== */}
      {/* 1. ADMIN WELCOME HERO CARD */}
      {/* =================================================================== */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-3 border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" /> System Operational (99.98% Uptime)
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {adminName} 🛡️
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1.5 max-w-xl leading-relaxed">
              System Control Center • Monitoring <strong className="text-white">1,420 registered users</strong>, 4 core microservices, and HIPAA cryptographic audit vaults.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsAddUserModalOpen(true)}
              leftIcon={<UserPlus className="w-4 h-4" />}
            >
              Add User
            </Button>
            <Button
              variant="soft"
              size="sm"
              onClick={() => setIsBackupConfirmOpen(true)}
              leftIcon={<HardDrive className="w-4 h-4" />}
            >
              Trigger System Backup
            </Button>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 2. QUICK ACTIONS SECTION (NAVIGATES TO PLACEHOLDER ROUTES) */}
      {/* =================================================================== */}
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4">Administration Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {/* Action 1: User Management */}
          <button
            onClick={() => navigate('/admin/users')}
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all text-left group"
          >
            <div className="p-3 rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-950/60 dark:text-primary-400 w-fit mb-3 group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">User Management</h4>
            <p className="text-2xs text-slate-500 dark:text-slate-400 mt-0.5">1,420 active users</p>
          </button>

          {/* Action 2: Role Permissions */}
          <button
            onClick={() => navigate('/admin/roles')}
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all text-left group"
          >
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 w-fit mb-3 group-hover:scale-110 transition-transform">
              <Sliders className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">Role Permissions</h4>
            <p className="text-2xs text-slate-500 dark:text-slate-400 mt-0.5">RBAC security matrix</p>
          </button>

          {/* Action 3: System Audit Logs */}
          <button
            onClick={() => navigate('/audit-logs')}
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all text-left group"
          >
            <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 w-fit mb-3 group-hover:scale-110 transition-transform">
              <Lock className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">System Audit Logs</h4>
            <p className="text-2xs text-slate-500 dark:text-slate-400 mt-0.5">HIPAA event ledger</p>
          </button>

          {/* Action 4: System Services */}
          <button
            onClick={() => navigate('/admin/system')}
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all text-left group"
          >
            <div className="p-3 rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400 w-fit mb-3 group-hover:scale-110 transition-transform">
              <Server className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">System Services</h4>
            <p className="text-2xs text-slate-500 dark:text-slate-400 mt-0.5">Microservice status</p>
          </button>

          {/* Action 5: System Settings */}
          <button
            onClick={() => navigate('/settings')}
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all text-left group"
          >
            <div className="p-3 rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 w-fit mb-3 group-hover:scale-110 transition-transform">
              <Settings className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">System Settings</h4>
            <p className="text-2xs text-slate-500 dark:text-slate-400 mt-0.5">API & portal config</p>
          </button>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 3. PLATFORM STATISTICS CARDS */}
      {/* =================================================================== */}
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4">Platform Overview Metrics</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Platform Users"
            value="1,420"
            change="+48 this week"
            trend="up"
            subtext="1,150 Patients, 210 Doctors"
            icon={<Users className="w-5 h-5" />}
          />
          <StatCard
            title="Active Consent Grants"
            value="890"
            change="+14 granted today"
            trend="up"
            subtext="Cryptographic data access"
            icon={<ShieldCheck className="w-5 h-5" />}
            iconBg="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
          />
          <StatCard
            title="Pending IRB Approvals"
            value="6"
            change="Requires admin review"
            trend="neutral"
            subtext="2 License verifications"
            icon={<UserCheck className="w-5 h-5" />}
            iconBg="bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
          />
          <StatCard
            title="Storage Quota Used"
            value="4.2 TB / 10 TB"
            change="42% capacity"
            trend="neutral"
            subtext="AES-256 EMR Vault"
            icon={<HardDrive className="w-5 h-5" />}
            iconBg="bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300"
          />
        </div>
      </div>

      {/* =================================================================== */}
      {/* 4. SYSTEM HEALTH SECTION (API, DATABASE, AI SERVICE, STORAGE) */}
      {/* =================================================================== */}
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4">Core Infrastructure System Health</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Health Card 1: API */}
          <Card className="p-4 border-slate-200/80 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                <Server className="w-5 h-5" />
              </div>
              <Badge variant="success" size="sm" dot>Operational</Badge>
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">API Gateway</h4>
              <p className="text-2xs text-slate-500 mt-0.5">FastAPI Server Cluster</p>
            </div>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-2xs text-slate-400 font-mono">
              <span>Latency: <strong>2.4 ms</strong></span>
              <span>Uptime: <strong>99.99%</strong></span>
            </div>
          </Card>

          {/* Health Card 2: Database */}
          <Card className="p-4 border-slate-200/80 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400">
                <Database className="w-5 h-5" />
              </div>
              <Badge variant="success" size="sm" dot>Operational</Badge>
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Database Cluster</h4>
              <p className="text-2xs text-slate-500 mt-0.5">Async SQLAlchemy Pool</p>
            </div>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-2xs text-slate-400 font-mono">
              <span>Conns: <strong>14 / 100</strong></span>
              <span>Uptime: <strong>99.95%</strong></span>
            </div>
          </Card>

          {/* Health Card 3: AI Service */}
          <Card className="p-4 border-slate-200/80 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                <Cpu className="w-5 h-5" />
              </div>
              <Badge variant="success" size="sm" dot>Operational</Badge>
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">AI Prediction Service</h4>
              <p className="text-2xs text-slate-500 mt-0.5">XGBoost ML v2.4 Engine</p>
            </div>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-2xs text-slate-400 font-mono">
              <span>Inference: <strong>120 ms</strong></span>
              <span>Uptime: <strong>99.80%</strong></span>
            </div>
          </Card>

          {/* Health Card 4: Storage */}
          <Card className="p-4 border-slate-200/80 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
                <HardDrive className="w-5 h-5" />
              </div>
              <Badge variant="success" size="sm" dot>Operational</Badge>
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">AES-256 Storage Cluster</h4>
              <p className="text-2xs text-slate-500 mt-0.5">Encrypted Object Store</p>
            </div>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-2xs text-slate-400 font-mono">
              <span>Capacity: <strong>4.2 / 10 TB</strong></span>
              <span>Uptime: <strong>100%</strong></span>
            </div>
          </Card>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 5. NOTIFICATIONS & SECURITY ALERTS PANEL */}
      {/* =================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Notifications & Security Alerts (2/3 width) */}
        <Card className="lg:col-span-2 border-slate-200/80 dark:border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Bell className="w-5 h-5 text-rose-500" /> Notifications & Security Alerts
              </CardTitle>
              <CardDescription className="text-xs">Break-glass emergency overrides and failed authentication warnings.</CardDescription>
            </div>
            <Button variant="ghost" size="xs" onClick={handleFlushCache} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
              Flush Cache
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {securityAlerts.map((sec) => (
              <div
                key={sec.id}
                className={cn(
                  'p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all',
                  sec.isAcknowledged
                    ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-60'
                    : 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40'
                )}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{sec.title}</h4>
                    <Badge variant={sec.severity === 'HIGH' ? 'danger' : 'warning'} size="sm">
                      {sec.severity} SEVERITY
                    </Badge>
                  </div>
                  <p className="text-2xs text-slate-600 dark:text-slate-300">{sec.description}</p>
                  <span className="text-[10px] text-slate-400 font-mono block">{sec.timestamp}</span>
                </div>

                {!sec.isAcknowledged ? (
                  <Button
                    variant="soft"
                    size="xs"
                    onClick={() => handleAcknowledgeAlert(sec.id)}
                    leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                  >
                    Acknowledge
                  </Button>
                ) : (
                  <Badge variant="secondary" size="sm">
                    REVIEWED
                  </Badge>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Pending Approvals Panel (1/3 width) */}
        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-amber-500" /> Pending Approvals
            </CardTitle>
            <CardDescription className="text-xs">Clinical doctor & researcher license verification queue.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingApprovals.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                No pending registration approvals.
              </div>
            ) : (
              pendingApprovals.map((app) => (
                <div key={app.id} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 dark:text-slate-100">{app.name}</h4>
                    <Badge variant="outline" size="sm">{app.requestedRole}</Badge>
                  </div>
                  <p className="text-2xs text-slate-500">{app.organization} ({app.licenseNumber})</p>
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <Button variant="ghost" size="xs" onClick={() => handleRejectUser(app.id, app.name)}>Reject</Button>
                    <Button variant="success" size="xs" onClick={() => handleApproveUser(app.id, app.name)}>Approve</Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* =================================================================== */}
      {/* 6. SYSTEM TRAFFIC CHARTS */}
      {/* =================================================================== */}
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary-600" /> API Traffic & Endpoint Load Metrics
        </h3>
        <HealthChart
          title="HTTP API Requests / min & Error Frequency (Last 24 Hours)"
          subtitle="FastAPI server throughput monitoring."
          data={trafficChartData}
          type="area"
          dataKey="value"
          secondaryDataKey="secondaryValue"
        />
      </div>

      {/* =================================================================== */}
      {/* 7. RECENT REGISTRATIONS & RECENT SYSTEM ERRORS */}
      {/* =================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Registrations Table (2/3 width) */}
        <Card className="lg:col-span-2 border-slate-200/80 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-base font-bold">Recent User Registrations</CardTitle>
            <CardDescription className="text-xs">Live log of newly registered accounts across HealthShare.</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable data={registrations} columns={regColumns} itemsPerPage={4} />
          </CardContent>
        </Card>

        {/* Recent System Error Monitor (1/3 width) */}
        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <FileCode className="w-5 h-5 text-rose-500" /> Recent System Errors
            </CardTitle>
            <CardDescription className="text-xs">Exceptions logged from backend routes.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {errorLogs.map((err) => (
              <div key={err.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <Badge variant={err.statusCode === 500 ? 'danger' : 'warning'} size="sm">
                    HTTP {err.statusCode}
                  </Badge>
                  <span className="text-[10px] text-slate-400">{err.timestamp}</span>
                </div>
                <p className="font-mono text-2xs font-bold text-slate-900 dark:text-slate-100 mt-1">{err.endpoint}</p>
                <p className="text-2xs text-rose-600 dark:text-rose-400 font-mono truncate">{err.errorMessage}</p>
                {!err.isResolved && (
                  <Button variant="ghost" size="xs" onClick={() => handleResolveError(err.id)} className="mt-1 text-slate-500">
                    Mark Resolved
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* =================================================================== */}
      {/* 8. IMMUTABLE HIPAA AUDIT LOGS TABLE */}
      {/* =================================================================== */}
      <Card id="audit-logs-section" className="border-slate-200/80 dark:border-slate-800">
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Lock className="w-5 h-5 text-emerald-500" /> Immutable HIPAA Audit Log Vault
          </CardTitle>
          <CardDescription className="text-xs">Cryptographically hashed event ledger recording every access, grant, and backup.</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable data={auditLogs} columns={auditColumns} itemsPerPage={5} />
        </CardContent>
      </Card>

      {/* =================================================================== */}
      {/* 9. RECENT ACTIVITIES / AUDIT TIMELINE */}
      {/* =================================================================== */}
      <Card className="border-slate-200/80 dark:border-slate-800">
        <CardHeader>
          <CardTitle className="text-base font-bold">System Administration Recent Activities</CardTitle>
          <CardDescription className="text-xs">Global event log of admin actions, backup jobs, and key rotations.</CardDescription>
        </CardHeader>
        <CardContent>
          <ActivityTimeline items={activities} />
        </CardContent>
      </Card>

      {/* =================================================================== */}
      {/* MODALS */}
      {/* =================================================================== */}
      <Dialog isOpen={isAddUserModalOpen} onClose={() => setIsAddUserModalOpen(false)} title="Create New User Account" maxWidth="md">
        <form onSubmit={handleAddUser} className="space-y-4">
          <div>
            <label className="block text-2xs font-bold text-slate-500 uppercase mb-1">User Full Name</label>
            <Input placeholder="e.g. Dr. Robert Langdon" value={newUserName} onChange={(e) => setNewUserName(e.target.value)} />
          </div>

          <div>
            <label className="block text-2xs font-bold text-slate-500 uppercase mb-1">Email Address</label>
            <Input type="email" placeholder="user@domain.com" value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} />
          </div>

          <div>
            <label className="block text-2xs font-bold text-slate-500 uppercase mb-1">Assign Role</label>
            <Select value={newUserRole} onChange={(e: any) => setNewUserRole(e.target.value)}>
              <option value="PATIENT">Patient</option>
              <option value="DOCTOR">Doctor</option>
              <option value="RESEARCHER">Researcher</option>
              <option value="ADMIN">System Administrator</option>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" size="sm" onClick={() => setIsAddUserModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" size="sm" leftIcon={<UserPlus className="w-4 h-4" />}>
              Create Account
            </Button>
          </DialogFooter>
        </form>
      </Dialog>

      <ConfirmDialog
        isOpen={isBackupConfirmOpen}
        onClose={() => setIsBackupConfirmOpen(false)}
        onConfirm={handleExecuteBackup}
        title="Execute Immutable System Backup?"
        description="This will create a full encrypted snapshot of the database and EMR document metadata store."
        confirmText="Trigger Backup Job"
        variant="info"
        isLoading={backupLoading}
      />
    </div>
  );
};

export default AdminDashboard;
