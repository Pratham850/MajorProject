import React, { useState, useMemo } from 'react';
import {
  Activity,
  Server,
  Database,
  Cpu,
  HardDrive,
  Users,
  ShieldAlert,
  Search,
  Filter,
  Eye,
  Download,
  FileText,
  Lock,
  Clock,
  X,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Terminal,
  RefreshCw,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogFooter } from '../components/ui/dialog';
import { StatCard } from '../components/common/StatCard';
import { HealthChart } from '../components/common/HealthChart';
import { ServiceStatusPanel, ServiceStatusItem } from '../components/common/ServiceStatusPanel';
import { ExportToolbar } from '../components/common/ExportToolbar';
import { Pagination } from '../components/common/Pagination';
import { useToast } from '../components/ui/toast';
import { cn } from '../lib/utils';

export interface AuditLogItem {
  id: string;
  timestamp: string;
  user: string;
  userId: string;
  role: 'ADMIN' | 'DOCTOR' | 'PATIENT' | 'RESEARCHER' | 'SYSTEM';
  module: 'AUTH' | 'EMR_RECORDS' | 'CONSENTS' | 'ML_PREDICTION' | 'SYSTEM';
  action: string;
  status: 'SUCCESS' | 'WARNING' | 'FAILURE';
  ipAddress: string;
  userAgent?: string;
  checksum?: string;
  details?: string;
}

const AUDIT_LOG_DATA: AuditLogItem[] = [
  {
    id: 'LOG-7001',
    timestamp: '2026-07-28 10:30:15',
    user: 'Dr. Sarah Jenkins',
    userId: 'USR-108',
    role: 'DOCTOR',
    module: 'EMR_RECORDS',
    action: 'EMR_RECORD_READ',
    status: 'SUCCESS',
    ipAddress: '192.168.1.45',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126.0.0.0',
    checksum: 'a3f9e2b198fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    details: 'Accessed de-identified lab report for patient MRN-9021 under Emergency Break-Glass clearance.',
  },
  {
    id: 'LOG-7002',
    timestamp: '2026-07-28 09:12:44',
    user: 'Eleanor Vance',
    userId: 'USR-101',
    role: 'PATIENT',
    module: 'CONSENTS',
    action: 'CONSENT_GRANTED',
    status: 'SUCCESS',
    ipAddress: '10.0.0.12',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15',
    checksum: 'b7c4d1f298fd2d250bfbf5d9997fc93538bf52f5750c045db506002c8963c966',
    details: 'Patient granted 1-year telemetry sharing authorization to St. Jude Cardiology Practice.',
  },
  {
    id: 'LOG-7003',
    timestamp: '2026-07-28 08:30:00',
    user: 'System Auto-Backup',
    userId: 'SYS-AUTO',
    role: 'SYSTEM',
    module: 'SYSTEM',
    action: 'DB_SNAPSHOT_CREATED',
    status: 'SUCCESS',
    ipAddress: '127.0.0.1',
    userAgent: 'HealthShare Core Automation Cron',
    checksum: 'c8e1a4d9ccb19ba61c4c0873d391e987982fbbd3',
    details: 'Full encrypted MySQL snapshot saved to immutable cloud backup vault.',
  },
  {
    id: 'LOG-7004',
    timestamp: '2026-07-28 07:15:22',
    user: 'Dr. Robert Langdon',
    userId: 'USR-105',
    role: 'DOCTOR',
    module: 'ML_PREDICTION',
    action: 'CKD_PREDICTION_RUN',
    status: 'SUCCESS',
    ipAddress: '192.168.1.104',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Edge/125.0.0.0',
    checksum: 'd9e2f3a498fe3e361cfcf6ea008gd04649ce63f6',
    details: 'Executed XGBoost v2.4 inference model for patient MRN-4012; returned 96.4% confidence.',
  },
  {
    id: 'LOG-7005',
    timestamp: '2026-07-27 23:40:10',
    user: 'Unknown Actor',
    userId: 'UNAUTH-999',
    role: 'PATIENT',
    module: 'AUTH',
    action: 'FAILED_LOGIN_SPIKE',
    status: 'WARNING',
    ipAddress: '198.51.100.42',
    userAgent: 'Python-urllib/3.10',
    checksum: 'e0f1a2b398ff4f472dgd7fb1199he15750df74g7',
    details: '5 failed authentication attempts detected from IP 198.51.100.42 within 60 seconds.',
  },
  {
    id: 'LOG-7006',
    timestamp: '2026-07-27 18:20:05',
    user: 'Dr. Jonathan Crane',
    userId: 'USR-110',
    role: 'RESEARCHER',
    module: 'EMR_RECORDS',
    action: 'UNAUTHORIZED_QUERY',
    status: 'FAILURE',
    ipAddress: '192.168.1.15',
    userAgent: 'PostmanRuntime/7.39.0',
    checksum: 'f1a2b3c409gg5g583ehe8gc2200if26861eg85h8',
    details: 'Query rejected due to missing IRB ethics approval reference for pediatric dataset.',
  },
];

const MICROSERVICES_DATA: ServiceStatusItem[] = [
  { name: 'API Gateway (FastAPI)', key: 'api', uptime: '99.99%', latency: '2.4 ms', status: 'Operational' },
  { name: 'Database Cluster (SQLAlchemy)', key: 'db', uptime: '99.95%', latency: '1.8 ms', status: 'Operational' },
  { name: 'ML Prediction Service (XGBoost)', key: 'ml', uptime: '99.80%', latency: '120 ms', status: 'Operational' },
  { name: 'Notification Telemetry Service', key: 'notify', uptime: '100%', latency: '0.8 ms', status: 'Operational' },
  { name: 'AES-256 Encrypted Storage Vault', key: 'storage', uptime: '100%', latency: '4.5 ms', status: 'Operational' },
];

export const AdminSystemMonitoringPage: React.FC = () => {
  const { addToast } = useToast();

  const [logs] = useState<AuditLogItem[]>(AUDIT_LOG_DATA);
  const [services] = useState<ServiceStatusItem[]>(MICROSERVICES_DATA);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModuleTab, setSelectedModuleTab] = useState<string>('ALL');
  const [selectedStatusTab, setSelectedStatusTab] = useState<string>('ALL');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // Selected Log Details Panel Modal State
  const [selectedLogModal, setSelectedLogModal] = useState<AuditLogItem | null>(null);

  // Security Alert Acknowledgment State
  const [acknowledgedAlerts, setAcknowledgedAlerts] = useState<Record<string, boolean>>({});

  // Filter Categories
  const moduleTabs = ['ALL', 'AUTH', 'EMR_RECORDS', 'CONSENTS', 'ML_PREDICTION', 'SYSTEM'];
  const statusTabs = ['ALL', 'SUCCESS', 'WARNING', 'FAILURE'];

  // Synthetic Performance Chart Data
  const cpuMemoryChartData = [
    { name: '00:00', value: 18, secondaryValue: 24 },
    { name: '04:00', value: 14, secondaryValue: 22 },
    { name: '08:00', value: 42, secondaryValue: 38 },
    { name: '12:00', value: 68, secondaryValue: 54 },
    { name: '16:00', value: 55, secondaryValue: 48 },
    { name: '20:00', value: 28, secondaryValue: 32 },
  ];

  const apiRequestChartData = [
    { name: '00:00', value: 120, secondaryValue: 1.8 },
    { name: '04:00', value: 80, secondaryValue: 1.5 },
    { name: '08:00', value: 650, secondaryValue: 2.8 },
    { name: '12:00', value: 980, secondaryValue: 3.2 },
    { name: '16:00', value: 840, secondaryValue: 2.6 },
    { name: '20:00', value: 410, secondaryValue: 2.1 },
  ];

  // Filtered Logs calculation
  const filteredLogs = useMemo(() => {
    return logs.filter((item) => {
      const matchesSearch =
        item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.module.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.ipAddress.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesModule =
        selectedModuleTab === 'ALL' || item.module.toUpperCase() === selectedModuleTab.toUpperCase();

      const matchesStatus =
        selectedStatusTab === 'ALL' || item.status.toUpperCase() === selectedStatusTab.toUpperCase();

      return matchesSearch && matchesModule && matchesStatus;
    });
  }, [logs, searchQuery, selectedModuleTab, selectedStatusTab]);

  // Paginated Logs slice
  const paginatedLogs = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredLogs.slice(startIndex, startIndex + pageSize);
  }, [filteredLogs, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredLogs.length / pageSize);

  const handleAcknowledgeAlert = (id: string, title: string) => {
    setAcknowledgedAlerts((prev) => ({ ...prev, [id]: true }));
    addToast({
      type: 'info',
      title: 'Alert Acknowledged',
      message: `Security event "${title}" marked as reviewed by administrator.`,
    });
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-semibold mb-2">
            <Activity className="w-3.5 h-3.5 text-emerald-400" /> Infrastructure Operations & Cryptographic Audit Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            System Monitoring & Audit Logs
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time infrastructure health metrics, SLA uptime, security event alerts, and immutable HIPAA audit logs.
          </p>
        </div>

        {/* Export Toolbar Component */}
        <ExportToolbar reportTitle="HealthShare System Infrastructure & Audit Report 2026" />
      </div>

      {/* 2. Infrastructure Health Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          title="CPU Utilization"
          value="24%"
          change="8 Cores active"
          trend="neutral"
          subtext="Avg load average"
          icon={<Cpu className="w-5 h-5" />}
        />
        <StatCard
          title="Memory RAM Allocation"
          value="4.2 / 16 GB"
          change="26.2% utilized"
          trend="neutral"
          subtext="RAM Pool Healthy"
          icon={<Server className="w-5 h-5" />}
          iconBg="bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300"
        />
        <StatCard
          title="Encrypted EMR Storage"
          value="4.2 / 10 TB"
          change="42% capacity"
          trend="neutral"
          subtext="AES-256 Vault"
          icon={<HardDrive className="w-5 h-5" />}
          iconBg="bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300"
        />
        <StatCard
          title="Active Users Online"
          value="142"
          change="Concurrent sessions"
          trend="up"
          subtext="Live telemetry"
          icon={<Users className="w-5 h-5" />}
          iconBg="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
        />
        <StatCard
          title="Avg API Latency"
          value="2.4 ms"
          change="99.99% Uptime"
          trend="up"
          subtext="FastAPI Gateway"
          icon={<Activity className="w-5 h-5" />}
          iconBg="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
        />
        <StatCard
          title="Requests / Minute"
          value="980 req/min"
          change="Peak: 1,420 req"
          trend="up"
          subtext="HTTP Throughput"
          icon={<Database className="w-5 h-5" />}
          iconBg="bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
        />
      </div>

      {/* 3. PERFORMANCE METRICS CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <HealthChart
          title="CPU & Memory RAM Load Dynamics (Last 24 Hours)"
          subtitle="Real-time server resource utilization monitoring."
          data={cpuMemoryChartData}
          type="area"
          dataKey="value"
          secondaryDataKey="secondaryValue"
        />

        <HealthChart
          title="API Request Volume & Latency Trajectory"
          subtitle="HTTP request throughput (req/min) vs avg response latency (ms)."
          data={apiRequestChartData}
          type="line"
          dataKey="value"
          secondaryDataKey="secondaryValue"
        />
      </div>

      {/* 4. SECURITY EVENTS & SERVICE STATUS PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Security Alerts (2/3 width) */}
        <Card className="lg:col-span-2 border-slate-200/80 dark:border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-500" /> Live Security Event Alerts
              </CardTitle>
              <CardDescription className="text-xs">Break-glass emergency overrides, failed login spikes, and unauthorized queries.</CardDescription>
            </div>
            <Badge variant="danger" size="sm">
              3 Active Alerts
            </Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Alert 1 */}
            <div
              className={cn(
                'p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all',
                acknowledgedAlerts['sec-1']
                  ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-60'
                  : 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40'
              )}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">Break-Glass Emergency Access Override</h4>
                  <Badge variant="danger" size="sm">HIGH SEVERITY</Badge>
                </div>
                <p className="text-2xs text-slate-600 dark:text-slate-300">Dr. Sarah Jenkins executed emergency access override for patient MRN-9021.</p>
                <span className="text-[10px] text-slate-400 font-mono block">45 mins ago • IP 192.168.1.45</span>
              </div>
              {!acknowledgedAlerts['sec-1'] ? (
                <Button variant="soft" size="xs" onClick={() => handleAcknowledgeAlert('sec-1', 'Break-Glass Override')} leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}>
                  Acknowledge
                </Button>
              ) : (
                <Badge variant="secondary" size="sm">REVIEWED</Badge>
              )}
            </div>

            {/* Alert 2 */}
            <div
              className={cn(
                'p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all',
                acknowledgedAlerts['sec-2']
                  ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-60'
                  : 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40'
              )}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">Failed Login Spike Detected</h4>
                  <Badge variant="warning" size="sm">MEDIUM SEVERITY</Badge>
                </div>
                <p className="text-2xs text-slate-600 dark:text-slate-300">5 failed authentication attempts from IP 198.51.100.42.</p>
                <span className="text-[10px] text-slate-400 font-mono block">2 hours ago • IP 198.51.100.42</span>
              </div>
              {!acknowledgedAlerts['sec-2'] ? (
                <Button variant="soft" size="xs" onClick={() => handleAcknowledgeAlert('sec-2', 'Failed Login Spike')} leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}>
                  Acknowledge
                </Button>
              ) : (
                <Badge variant="secondary" size="sm">REVIEWED</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Microservices Status Panel (1/3 width) */}
        <ServiceStatusPanel services={services} />
      </div>

      {/* 5. SEARCH & FILTER BAR FOR AUDIT LOGS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search Log ID, user, action, module, or IP..."
            className="w-full bg-slate-100 dark:bg-slate-800/70 text-slate-900 dark:text-slate-100 text-xs rounded-xl pl-9 pr-8 py-2.5 border border-transparent focus:border-primary-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Module Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 shrink-0">
          <Filter className="w-4 h-4 text-slate-400 shrink-0 mr-1" />
          {moduleTabs.map((mod) => (
            <button
              key={mod}
              onClick={() => {
                setSelectedModuleTab(mod);
                setCurrentPage(1);
              }}
              className={cn(
                'px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all select-none',
                selectedModuleTab === mod
                  ? 'bg-primary-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800/70 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              )}
            >
              {mod === 'ALL' ? 'All Modules' : mod}
            </button>
          ))}
        </div>
      </div>

      {/* 6. AUDIT LOG TABLE */}
      {filteredLogs.length === 0 ? (
        /* Empty State UI */
        <Card className="p-12 text-center border-slate-200/80 dark:border-slate-800">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No Audit Logs Found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
            No system audit log events match your current search query or module filter.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchQuery('');
              setSelectedModuleTab('ALL');
              setSelectedStatusTab('ALL');
            }}
            className="mt-4"
          >
            Reset Filters
          </Button>
        </Card>
      ) : (
        <Card className="border-slate-200/80 dark:border-slate-800 overflow-hidden">
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-bold border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-3.5">Log ID</th>
                  <th className="px-6 py-3.5">Timestamp</th>
                  <th className="px-6 py-3.5">Actor / User</th>
                  <th className="px-6 py-3.5">Role</th>
                  <th className="px-6 py-3.5">Target Module</th>
                  <th className="px-6 py-3.5">Action Event</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">IP Address</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {paginatedLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-slate-500">{log.id}</td>
                    <td className="px-6 py-4 font-mono text-slate-400">{log.timestamp}</td>
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                      {log.user}
                      <span className="text-2xs text-slate-400 block font-mono">ID: {log.userId}</span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" size="sm">{log.role}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="secondary" size="sm">{log.module}</Badge>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-primary-600 dark:text-primary-400 text-2xs">
                      {log.action}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={log.status === 'SUCCESS' ? 'success' : log.status === 'WARNING' ? 'warning' : 'danger'} size="sm">
                        {log.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-500">{log.ipAddress}</td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="xs" onClick={() => setSelectedLogModal(log)} leftIcon={<Eye className="w-3.5 h-3.5" />}>
                        Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* 7. Pagination Controls */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => setCurrentPage(page)}
        totalItems={filteredLogs.length}
        pageSize={pageSize}
      />

      {/* 8. AUDIT LOG DETAILS PANEL MODAL */}
      {selectedLogModal && (
        <Dialog
          isOpen={!!selectedLogModal}
          onClose={() => setSelectedLogModal(null)}
          title={`Audit Log Telemetry Event: ${selectedLogModal.id}`}
          maxWidth="lg"
        >
          <div className="space-y-6 py-2 text-xs">
            {/* Header info grid */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Log Status</span>
                <Badge variant={selectedLogModal.status === 'SUCCESS' ? 'success' : 'danger'} size="sm" className="mt-1">
                  {selectedLogModal.status}
                </Badge>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Timestamp</span>
                <span className="font-semibold text-slate-900 dark:text-white mt-0.5 block font-mono">{selectedLogModal.timestamp}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Target Module</span>
                <span className="font-semibold text-primary-600 dark:text-primary-400 mt-0.5 block font-mono">{selectedLogModal.module}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">IP Address</span>
                <span className="font-semibold text-slate-900 dark:text-white mt-0.5 block font-mono">{selectedLogModal.ipAddress}</span>
              </div>
            </div>

            {/* Actor & Action Details */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Actor & Action Event</h4>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white">{selectedLogModal.user}</span>
                  <span className="text-2xs text-slate-400 font-mono block">ID: {selectedLogModal.userId} • Role: {selectedLogModal.role}</span>
                </div>
                <Badge variant="primary" size="sm">{selectedLogModal.action}</Badge>
              </div>
            </div>

            {/* User Agent & Checksum */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">SHA-256 Checksum & Client Environment</h4>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2 font-mono text-2xs">
                <div>
                  <span className="text-slate-400 block font-bold">SHA-256 Integrity Hash:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 break-all">{selectedLogModal.checksum}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-bold">User Agent Header:</span>
                  <span className="text-slate-600 dark:text-slate-300">{selectedLogModal.userAgent}</span>
                </div>
              </div>
            </div>

            {/* Log Details Abstract */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Payload Summary & Exception Stack</h4>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                {selectedLogModal.details}
              </p>
            </div>

            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setSelectedLogModal(null)}>
                Close
              </Button>
            </DialogFooter>
          </div>
        </Dialog>
      )}
    </div>
  );
};

export default AdminSystemMonitoringPage;
