import React, { useState } from 'react';
import {
  Settings,
  Shield,
  Bell,
  Cpu,
  HardDrive,
  RefreshCw,
  Sliders,
  Save,
  RotateCcw,
  CheckCircle2,
  Lock,
  Globe,
  Database,
  Calendar,
  Layers,
  Moon,
  Sparkles,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Select } from '../components/ui/select';
import { ToggleSwitch } from '../components/common/ToggleSwitch';
import { useToast } from '../components/ui/toast';
import { cn } from '../lib/utils';

export const PlatformSettingsPage: React.FC = () => {
  const { addToast } = useToast();

  // Active Settings Section Tab
  const [activeSection, setActiveSection] = useState<
    'general' | 'security' | 'notifications' | 'ai' | 'storage' | 'backup' | 'preferences'
  >('general');

  // --- 1. General Settings State ---
  const [platformName, setPlatformName] = useState('HealthShare Federated EHR');
  const [supportEmail, setSupportEmail] = useState('support@healthshare.org');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [defaultUserRole, setDefaultUserRole] = useState('PATIENT');

  // --- 2. Security Settings State ---
  const [mfaRequired, setMfaRequired] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState(30); // minutes
  const [passwordComplexity, setPasswordComplexity] = useState(true);
  const [breakGlassEnabled, setBreakGlassEnabled] = useState(true);
  const [rateLimit, setRateLimit] = useState(60); // req/min

  // --- 3. Notification Settings State ---
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [inAppAlerts, setInAppAlerts] = useState(true);
  const [digestFrequency, setDigestFrequency] = useState('Daily');

  // --- 4. AI Configuration State ---
  const [aiModel, setAiModel] = useState('XGBoost v2.4 (Renal CKD)');
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.85);
  const [autoEscalateHighRisk, setAutoEscalateHighRisk] = useState(true);
  const [inferenceMode, setInferenceMode] = useState('Real-Time Async');

  // --- 5. Storage Settings State ---
  const [storageProvider, setStorageProvider] = useState('AWS S3 (AES-256 Encrypted)');
  const [maxFileSize, setMaxFileSize] = useState(50); // MB
  const [safeHarborSanitization, setSafeHarborSanitization] = useState(true);
  const [autoPurgeExports, setAutoPurgeExports] = useState(true);

  // --- 6. Backup & Recovery State ---
  const [autoNightlyBackup, setAutoNightlyBackup] = useState(true);
  const [snapshotRetention, setSnapshotRetention] = useState('60 Days');

  // --- 7. System Preferences State ---
  const [themePreference, setThemePreference] = useState('Dark Mode');
  const [systemLanguage, setSystemLanguage] = useState('English (US)');
  const [auditLoggingLevel, setAuditLoggingLevel] = useState('VERBOSE_HIPAA_STRICT');

  // Action Handlers
  const handleSaveChanges = () => {
    addToast({
      type: 'success',
      title: 'Platform Configuration Saved',
      message: 'System settings updated and applied across all gateway clusters.',
    });
  };

  const handleResetDefaults = () => {
    setPlatformName('HealthShare Federated EHR');
    setSupportEmail('support@healthshare.org');
    setMaintenanceMode(false);
    setMfaRequired(true);
    setSessionTimeout(30);
    setConfidenceThreshold(0.85);
    setMaxFileSize(50);
    addToast({
      type: 'info',
      title: 'Settings Reset',
      message: 'Restored system configuration parameters to factory defaults.',
    });
  };

  const sidebarNavItems = [
    { id: 'general', label: 'General Settings', icon: <Globe className="w-4 h-4" /> },
    { id: 'security', label: 'Security & Compliance', icon: <Shield className="w-4 h-4" /> },
    { id: 'notifications', label: 'Notification Telemetry', icon: <Bell className="w-4 h-4" /> },
    { id: 'ai', label: 'AI Prediction Model', icon: <Cpu className="w-4 h-4" /> },
    { id: 'storage', label: 'Storage & Safe Harbor', icon: <HardDrive className="w-4 h-4" /> },
    { id: 'backup', label: 'Backup & Recovery', icon: <RefreshCw className="w-4 h-4" /> },
    { id: 'preferences', label: 'System Preferences', icon: <Sliders className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-semibold mb-2">
            <Settings className="w-3.5 h-3.5 text-primary-400" /> Platform Configuration & Governance Core
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Platform Settings & Configuration
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage global platform parameters, security policies, AI model inference thresholds, and automated backup schedules.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={handleResetDefaults} leftIcon={<RotateCcw className="w-3.5 h-3.5" />}>
            Reset to Defaults
          </Button>
          <Button variant="primary" size="sm" onClick={handleSaveChanges} leftIcon={<Save className="w-4 h-4" />}>
            Save Changes
          </Button>
        </div>
      </div>

      {/* 2. Main Layout Grid (Sidebar + Form Content) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Settings Navigation Sidebar */}
        <Card className="p-2 border-slate-200/80 dark:border-slate-800 h-fit lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase text-slate-400">Configuration Sections</CardTitle>
          </CardHeader>
          <CardContent className="p-0 space-y-1">
            {sidebarNavItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id as any)}
                className={cn(
                  'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left',
                  activeSection === item.id
                    ? 'bg-primary-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                )}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Settings Configuration Form Container (3/4 width) */}
        <div className="lg:col-span-3 space-y-6">
          {/* SECTION 1: GENERAL SETTINGS */}
          {activeSection === 'general' && (
            <Card className="border-slate-200/80 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Globe className="w-5 h-5 text-primary-600" /> General Platform Settings
                </CardTitle>
                <CardDescription>Core identity, organization support endpoints, and global system maintenance state.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-2xs font-bold text-slate-500 uppercase mb-1">Platform Brand Title</label>
                    <Input value={platformName} onChange={(e) => setPlatformName(e.target.value)} />
                  </div>

                  <div>
                    <label className="block text-2xs font-bold text-slate-500 uppercase mb-1">Support Contact Email</label>
                    <Input type="email" value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} />
                  </div>
                </div>

                <div>
                  <label className="block text-2xs font-bold text-slate-500 uppercase mb-1">Default User Registration Role</label>
                  <Select value={defaultUserRole} onChange={(e) => setDefaultUserRole(e.target.value)}>
                    <option value="PATIENT">Patient (Self-Managed EHR)</option>
                    <option value="DOCTOR">Doctor (Pending Verification)</option>
                    <option value="RESEARCHER">Researcher (Pending IRB)</option>
                  </Select>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  <ToggleSwitch
                    checked={maintenanceMode}
                    onChange={setMaintenanceMode}
                    label="System Maintenance Mode"
                    description="Temporarily restrict non-administrator logins for database migrations."
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* SECTION 2: SECURITY & COMPLIANCE SETTINGS */}
          {activeSection === 'security' && (
            <Card className="border-slate-200/80 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="w-5 h-5 text-emerald-500" /> Security & HIPAA Compliance Controls
                </CardTitle>
                <CardDescription>Multi-factor authentication, session token lifespans, and emergency break-glass policies.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 text-xs">
                <ToggleSwitch
                  checked={mfaRequired}
                  onChange={setMfaRequired}
                  label="Enforce Mandatory Multi-Factor Authentication (MFA)"
                  description="Require TOTP authenticator codes for all Doctor, Researcher, and Administrator accounts."
                />

                <ToggleSwitch
                  checked={passwordComplexity}
                  onChange={setPasswordComplexity}
                  label="Enforce Strict Password Complexity Rules"
                  description="Minimum 12 characters including uppercase, numbers, and special symbols."
                />

                <ToggleSwitch
                  checked={breakGlassEnabled}
                  onChange={setBreakGlassEnabled}
                  label="Emergency Break-Glass Access Policy"
                  description="Allow licensed physicians to trigger emergency record access overrides with mandatory audit log auditing."
                />

                {/* Session Timeout Slider */}
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between font-bold">
                    <label className="text-slate-700 dark:text-slate-300">Session Idle Timeout Limit</label>
                    <span className="font-mono text-primary-600">{sessionTimeout} Minutes</span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="120"
                    step="15"
                    value={sessionTimeout}
                    onChange={(e) => setSessionTimeout(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary-600"
                  />
                </div>

                {/* Rate Limit Slider */}
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between font-bold">
                    <label className="text-slate-700 dark:text-slate-300">API Rate Limiting Bound</label>
                    <span className="font-mono text-primary-600">{rateLimit} req / min</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="200"
                    step="10"
                    value={rateLimit}
                    onChange={(e) => setRateLimit(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary-600"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* SECTION 3: NOTIFICATION SETTINGS */}
          {activeSection === 'notifications' && (
            <Card className="border-slate-200/80 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Bell className="w-5 h-5 text-amber-500" /> Notification & Telemetry Dispatch Settings
                </CardTitle>
                <CardDescription>Configure system alert channels, email dispatches, and summary digests.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 text-xs">
                <ToggleSwitch
                  checked={emailAlerts}
                  onChange={setEmailAlerts}
                  label="Email Notification Dispatch"
                  description="Send system security warnings and consent grant updates via SMTP email."
                />

                <ToggleSwitch
                  checked={smsAlerts}
                  onChange={setSmsAlerts}
                  label="SMS Critical Alert Dispatch"
                  description="Send urgent SMS alerts for break-glass emergency access overrides."
                />

                <ToggleSwitch
                  checked={inAppAlerts}
                  onChange={setInAppAlerts}
                  label="In-App System Bell Alerts"
                  description="Display real-time popover notifications inside the portal navbar."
                />

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <label className="block text-2xs font-bold text-slate-500 uppercase mb-1">Administrative Digest Frequency</label>
                  <Select value={digestFrequency} onChange={(e) => setDigestFrequency(e.target.value)}>
                    <option value="Daily">Daily Morning Summary</option>
                    <option value="Weekly">Weekly Comprehensive Audit Digest</option>
                    <option value="Monthly">Monthly Executive Compliance Report</option>
                  </Select>
                </div>
              </CardContent>
            </Card>
          )}

          {/* SECTION 4: AI CONFIGURATION */}
          {activeSection === 'ai' && (
            <Card className="border-slate-200/80 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-indigo-500" /> AI CKD Prediction Model Configuration
                </CardTitle>
                <CardDescription>Select prediction inference engines, risk confidence thresholds, and auto-escalation triggers.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 text-xs">
                <div>
                  <label className="block text-2xs font-bold text-slate-500 uppercase mb-1">Primary Clinical ML Prediction Engine</label>
                  <Select value={aiModel} onChange={(e) => setAiModel(e.target.value)}>
                    <option value="XGBoost v2.4 (Renal CKD)">XGBoost v2.4 (Renal CKD - 96.4% Precision)</option>
                    <option value="RandomForest v1.8">RandomForest v1.8 (Ensemble Biomarker Classifier)</option>
                    <option value="Neural Net DeepCKD">DeepCKD Neural Network v3.0 (TensorFlow Pipeline)</option>
                  </Select>
                </div>

                {/* Confidence Threshold Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between font-bold">
                    <label className="text-slate-700 dark:text-slate-300">Confidence Threshold Floor</label>
                    <span className="font-mono text-indigo-600">{(confidenceThreshold * 100).toFixed(0)}% Confidence</span>
                  </div>
                  <input
                    type="range"
                    min="0.50"
                    max="0.99"
                    step="0.05"
                    value={confidenceThreshold}
                    onChange={(e) => setConfidenceThreshold(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <p className="text-2xs text-slate-400">Predictions below this confidence threshold will require mandatory doctor manual review.</p>
                </div>

                <ToggleSwitch
                  checked={autoEscalateHighRisk}
                  onChange={setAutoEscalateHighRisk}
                  label="Automated High-Risk Escalation Triggers"
                  description="Automatically flag predictions with >75% CKD Stage 3+ risk for immediate physician notification."
                />

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <label className="block text-2xs font-bold text-slate-500 uppercase mb-1">Inference Execution Mode</label>
                  <Select value={inferenceMode} onChange={(e) => setInferenceMode(e.target.value)}>
                    <option value="Real-Time Async">Real-Time Asynchronous (Instant Return)</option>
                    <option value="Batch Hourly">Batch Hourly Scheduled Queue</option>
                  </Select>
                </div>
              </CardContent>
            </Card>
          )}

          {/* SECTION 5: STORAGE & SAFE HARBOR */}
          {activeSection === 'storage' && (
            <Card className="border-slate-200/80 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <HardDrive className="w-5 h-5 text-sky-500" /> Encrypted Storage & Safe Harbor Rules
                </CardTitle>
                <CardDescription>Configure file size bounds, object storage providers, and HIPAA sanitization engines.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 text-xs">
                <div>
                  <label className="block text-2xs font-bold text-slate-500 uppercase mb-1">Encrypted File Store Provider</label>
                  <Select value={storageProvider} onChange={(e) => setStorageProvider(e.target.value)}>
                    <option value="AWS S3 (AES-256 Encrypted)">AWS S3 (AES-256 Server-Side Encryption)</option>
                    <option value="Azure Blob Crypt Vault">Azure Blob Crypt Vault</option>
                    <option value="Local Distributed Storage">Local Distributed Cryptographic Store</option>
                  </Select>
                </div>

                {/* Max File Size Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between font-bold">
                    <label className="text-slate-700 dark:text-slate-300">Max Upload File Size Limit</label>
                    <span className="font-mono text-sky-600">{maxFileSize} MB</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="500"
                    step="10"
                    value={maxFileSize}
                    onChange={(e) => setMaxFileSize(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-600"
                  />
                </div>

                <ToggleSwitch
                  checked={safeHarborSanitization}
                  onChange={setSafeHarborSanitization}
                  label="Safe Harbor 18-Attribute De-identification Engine"
                  description="Automatically strip patient names, SSNs, zip codes, and dates from research dataset exports."
                />

                <ToggleSwitch
                  checked={autoPurgeExports}
                  onChange={setAutoPurgeExports}
                  label="Auto-Purge Expired Research Exports"
                  description="Automatically delete compiled CSV/Parquet export files 90 days after generation."
                />
              </CardContent>
            </Card>
          )}

          {/* SECTION 6: BACKUP & RECOVERY */}
          {activeSection === 'backup' && (
            <Card className="border-slate-200/80 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 text-emerald-500" /> Backup & Recovery Infrastructure
                </CardTitle>
                <CardDescription>Automated database snapshots, retention schedules, and cloud restore history.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 text-xs">
                <ToggleSwitch
                  checked={autoNightlyBackup}
                  onChange={setAutoNightlyBackup}
                  label="Automated Nightly Database & EMR Snapshots"
                  description="Execute encrypted database and document metadata backups every night at 04:00 UTC."
                />

                <div>
                  <label className="block text-2xs font-bold text-slate-500 uppercase mb-1">Snapshot Retention Period</label>
                  <Select value={snapshotRetention} onChange={(e) => setSnapshotRetention(e.target.value)}>
                    <option value="30 Days">30 Days Rolling Retention</option>
                    <option value="60 Days">60 Days Rolling Retention</option>
                    <option value="90 Days">90 Days Rolling Retention</option>
                  </Select>
                </div>

                {/* Backup History Log List */}
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Recent Cloud Snapshot Log</h4>
                  <div className="space-y-2 font-mono text-2xs">
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white">snapshot-2026-07-28-0400.enc</span>
                        <span className="text-slate-400 block mt-0.5">Size: 4.2 GB • SHA-256 Verified</span>
                      </div>
                      <Badge variant="success" size="sm">COMPLETED</Badge>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white">snapshot-2026-07-27-0400.enc</span>
                        <span className="text-slate-400 block mt-0.5">Size: 4.1 GB • SHA-256 Verified</span>
                      </div>
                      <Badge variant="success" size="sm">COMPLETED</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* SECTION 7: SYSTEM PREFERENCES */}
          {activeSection === 'preferences' && (
            <Card className="border-slate-200/80 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-primary-600" /> System Preferences & Audit Logging
                </CardTitle>
                <CardDescription>Portal interface themes, language localizations, and audit log verbosity levels.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 text-xs">
                <div>
                  <label className="block text-2xs font-bold text-slate-500 uppercase mb-1">Interface Appearance Theme</label>
                  <Select value={themePreference} onChange={(e) => setThemePreference(e.target.value)}>
                    <option value="Dark Mode">Dark Mode (High Contrast & Reduced Eye Strain)</option>
                    <option value="Light Mode">Light Mode (Classic Clean White)</option>
                    <option value="System Dynamic">System Dynamic (Auto-sync with OS)</option>
                  </Select>
                </div>

                <div>
                  <label className="block text-2xs font-bold text-slate-500 uppercase mb-1">Portal System Language</label>
                  <Select value={systemLanguage} onChange={(e) => setSystemLanguage(e.target.value)}>
                    <option value="English (US)">English (United States)</option>
                    <option value="Spanish">Spanish (Español)</option>
                    <option value="French">French (Français)</option>
                  </Select>
                </div>

                <div>
                  <label className="block text-2xs font-bold text-slate-500 uppercase mb-1">Audit Log Verbosity Level</label>
                  <Select value={auditLoggingLevel} onChange={(e) => setAuditLoggingLevel(e.target.value)}>
                    <option value="VERBOSE_HIPAA_STRICT">VERBOSE_HIPAA_STRICT (Log all HTTP payloads & cryptographic hashes)</option>
                    <option value="STANDARD">STANDARD (Log auth, record reads, and errors)</option>
                    <option value="MINIMAL">MINIMAL (Log errors and security warnings only)</option>
                  </Select>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlatformSettingsPage;
