import React, { useState } from 'react';
import {
  Activity,
  AlertCircle,
  Bell,
  CheckCircle2,
  Database,
  FileText,
  Heart,
  Layers,
  Lock,
  Moon,
  Plus,
  Search,
  Shield,
  Sun,
  UserCheck,
  Users,
  Zap,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input, Textarea, Checkbox, Switch } from '../components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, GlassCard, MetricCard } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell, TablePagination } from '../components/ui/table';
import { Dialog, DialogFooter } from '../components/ui/dialog';
import { useToast } from '../components/ui/toast';
import { Skeleton, SkeletonText, SkeletonTableRows } from '../components/ui/skeleton';
import { EmptyState } from '../components/ui/empty-state';
import { ErrorState, ErrorBanner } from '../components/ui/error-state';

export const DesignSystemShowcase: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'tokens' | 'components' | 'tables' | 'overlays' | 'states'>('tokens');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [switchChecked, setSwitchChecked] = useState(true);
  const [checkboxChecked, setCheckboxChecked] = useState(true);
  const [tablePage, setTablePage] = useState(1);
  const { addToast } = useToast();

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* --- Top Navigation Header --- */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-700 text-white flex items-center justify-center shadow-teal-glow">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white font-sans">
                HealthShare <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary-50 text-primary-700 dark:bg-primary-950/60 dark:text-primary-300 ml-1">Design System v1.0</span>
              </h1>
              <p className="text-2xs text-slate-500 dark:text-slate-400">Enterprise Healthcare SaaS Component Library</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleDarkMode}
              leftIcon={darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            >
              {darkMode ? 'Light Mode' : 'Dark Mode'}
            </Button>
          </div>
        </div>
      </header>

      {/* --- Main Container --- */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Intro Hero Banner */}
        <div className="mb-8 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-primary-900 via-secondary-900 to-slate-900 text-white shadow-elevated relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-primary-200 text-xs font-semibold mb-3">
              <Shield className="w-3.5 h-3.5" /> HIPAA-Compliant Healthcare SaaS UI
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              HealthShare Unified Design System
            </h2>
            <p className="text-sm text-slate-300 mt-2 leading-relaxed">
              A minimal, accessible, and high-performance React design system built for clinical intelligence, patient data exchanges, and role-based healthcare workflows.
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 mb-8 overflow-x-auto pb-2">
          {[
            { id: 'tokens', label: '1. Tokens & Typography', icon: <Zap className="w-4 h-4" /> },
            { id: 'components', label: '2. Buttons & Form Inputs', icon: <Layers className="w-4 h-4" /> },
            { id: 'tables', label: '3. Cards & Data Tables', icon: <Database className="w-4 h-4" /> },
            { id: 'overlays', label: '4. Dialogs & Notifications', icon: <Bell className="w-4 h-4" /> },
            { id: 'states', label: '5. Skeletons & Fallbacks', icon: <AlertCircle className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-primary-700 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* =================================================================== */}
        {/* TAB 1: DESIGN TOKENS, COLORS & TYPOGRAPHY */}
        {/* =================================================================== */}
        {activeTab === 'tokens' && (
          <div className="space-y-8 animate-fade-in">
            {/* Color Palette */}
            <Card>
              <CardHeader>
                <CardTitle>1. HealthShare Color System Matrix</CardTitle>
                <CardDescription>Clinical Teal, Eucalyptus Secondary, Vitality Coral Accent, and WCAG AA/AAA compliant neutrals for Light and Dark modes.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Brand Core & Accent Tokens</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="bg-[#0f4c5c] text-white p-3 rounded-xl shadow-subtle flex flex-col justify-between h-20">
                      <span className="text-xs font-semibold">Primary (Light)</span>
                      <span className="text-2xs font-mono opacity-90">#0F4C5C</span>
                    </div>
                    <div className="bg-[#3a7d7c] text-white p-3 rounded-xl shadow-subtle flex flex-col justify-between h-20">
                      <span className="text-xs font-semibold">Secondary (Light)</span>
                      <span className="text-2xs font-mono opacity-90">#3A7D7C</span>
                    </div>
                    <div className="bg-[#e06d53] text-white p-3 rounded-xl shadow-subtle flex flex-col justify-between h-20">
                      <span className="text-xs font-semibold">Accent Vitality Coral</span>
                      <span className="text-2xs font-mono opacity-90">#E06D53</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Functional & Feedback Indicators</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-[#0d9488] text-white p-3 rounded-xl flex flex-col justify-between h-20">
                      <span className="text-xs font-semibold">Success Emerald</span>
                      <span className="text-2xs font-mono opacity-90">#0D9488</span>
                    </div>
                    <div className="bg-[#d97706] text-white p-3 rounded-xl flex flex-col justify-between h-20">
                      <span className="text-xs font-semibold">Warning Amber</span>
                      <span className="text-2xs font-mono opacity-90">#D97706</span>
                    </div>
                    <div className="bg-[#e11d48] text-white p-3 rounded-xl flex flex-col justify-between h-20">
                      <span className="text-xs font-semibold">Danger Rose</span>
                      <span className="text-2xs font-mono opacity-90">#E11D48</span>
                    </div>
                    <div className="bg-[#0284c7] text-white p-3 rounded-xl flex flex-col justify-between h-20">
                      <span className="text-xs font-semibold">Info Sky</span>
                      <span className="text-2xs font-mono opacity-90">#0284C7</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Dark Mode Tokens</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-[#2dd4bf] text-slate-950 p-3 rounded-xl flex flex-col justify-between h-20">
                      <span className="text-xs font-semibold">Primary (Dark)</span>
                      <span className="text-2xs font-mono opacity-90">#2DD4BF</span>
                    </div>
                    <div className="bg-[#0b131f] text-slate-100 p-3 rounded-xl flex flex-col justify-between h-20 border border-slate-700">
                      <span className="text-xs font-semibold">Background (Dark)</span>
                      <span className="text-2xs font-mono opacity-90">#0B131F</span>
                    </div>
                    <div className="bg-[#131f2e] text-slate-100 p-3 rounded-xl flex flex-col justify-between h-20 border border-slate-700">
                      <span className="text-xs font-semibold">Surface (Dark)</span>
                      <span className="text-2xs font-mono opacity-90">#131F2E</span>
                    </div>
                    <div className="bg-[#1b2a3c] text-slate-100 p-3 rounded-xl flex flex-col justify-between h-20 border border-slate-700">
                      <span className="text-xs font-semibold">Card (Dark)</span>
                      <span className="text-2xs font-mono opacity-90">#1B2A3C</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Typography Scale */}
            <Card>
              <CardHeader>
                <CardTitle>2. Typography Scale (Outfit, Inter & JetBrains Mono)</CardTitle>
                <CardDescription>Exact font sizes, line heights, letter spacing, and weights configured for clinical legibility.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-b pb-3">
                  <span className="text-xs font-mono text-slate-400">Display (3.25rem / Outfit 700 / -0.03em)</span>
                  <p className="text-display font-display text-slate-900 dark:text-white">HealthShare Intelligence</p>
                </div>
                <div className="border-b pb-3">
                  <span className="text-xs font-mono text-slate-400">H1 (2.25rem / Outfit 700 / -0.025em)</span>
                  <h1 className="text-h1 font-display text-slate-900 dark:text-white">Healthcare Data Exchange Platform</h1>
                </div>
                <div className="border-b pb-3">
                  <span className="text-xs font-mono text-slate-400">H2 (1.75rem / Outfit 600 / -0.02em)</span>
                  <h2 className="text-h2 font-display text-slate-900 dark:text-white">Patient Record Access & Cohort Querying</h2>
                </div>
                <div className="border-b pb-3">
                  <span className="text-xs font-mono text-slate-400">H3 (1.375rem / SemiBold 600 / -0.015em)</span>
                  <h3 className="text-h3 font-sans text-slate-900 dark:text-white">Consent Management & Audit Logs</h3>
                </div>
                <div className="border-b pb-3">
                  <span className="text-xs font-mono text-slate-400">Body Large (1.125rem / Inter 400)</span>
                  <p className="text-body-lg text-slate-700 dark:text-slate-300">
                    High-clarity text scaling for discharge instructions, patient notes, and diagnostic reviews.
                  </p>
                </div>
                <div className="border-b pb-3">
                  <span className="text-xs font-mono text-slate-400">Body (1.0rem / Inter 400 baseline)</span>
                  <p className="text-body text-slate-700 dark:text-slate-300">
                    Standard baseline body font used for EHR notes and general application interfaces.
                  </p>
                </div>
                <div className="border-b pb-3">
                  <span className="text-xs font-mono text-slate-400">Monospace Clinical ID (JetBrains Mono 400)</span>
                  <p className="font-mono text-small text-primary dark:text-primary">
                    RX-ID: 98402-A812 | ICD-10: E11.9 (Type 2 Diabetes Mellitus)
                  </p>
                </div>
                <div>
                  <span className="text-xs font-mono text-slate-400">Label (0.75rem / SemiBold Uppercase)</span>
                  <p className="text-label text-slate-500 dark:text-slate-400">
                    SYSTEM SECURITY CLEARANCE LEVEL 4
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Shadows, Radius & Spacing */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>4. Border Radius Scale</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xs text-xs font-mono">rounded-xs (4px) - Micro Tags</div>
                  <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-sm text-xs font-mono">rounded-sm (6px) - Inputs / Buttons</div>
                  <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-md text-xs font-mono">rounded-md (8px) - Cards</div>
                  <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-mono">rounded-lg (12px) - Elevated Panels</div>
                  <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-mono">rounded-xl (16px) - Modals</div>
                  <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-mono">rounded-full - Pills / Avatars</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>5. Shadows & Elevation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-md shadow-subtle text-xs">shadow-subtle (Level 1)</div>
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-md shadow-card text-xs">shadow-card (Level 2 Widget)</div>
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-md shadow-elevated text-xs">shadow-elevated (Level 3 Popovers)</div>
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-md shadow-dialog text-xs">shadow-dialog (Level 4 Modals)</div>
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-md shadow-teal-glow text-xs">shadow-teal-glow (Brand Focus Glow)</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>7. Iconography & Badges</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="primary" dot>PATIENT</Badge>
                    <Badge variant="success" dot>ACTIVE</Badge>
                    <Badge variant="warning" dot>PENDING</Badge>
                    <Badge variant="danger" dot>REVOKED</Badge>
                    <Badge variant="info" dot>RESEARCH</Badge>
                    <Badge variant="secondary">ADMIN</Badge>
                  </div>
                  <div className="flex items-center gap-3 pt-2 text-slate-600 dark:text-slate-400">
                    <Heart className="w-5 h-5 text-rose-500" />
                    <UserCheck className="w-5 h-5 text-emerald-500" />
                    <Lock className="w-5 h-5 text-primary" />
                    <Users className="w-5 h-5 text-sky-500" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 2: BUTTONS & FORM INPUTS */}
        {/* =================================================================== */}
        {activeTab === 'components' && (
          <div className="space-y-8 animate-fade-in">
            {/* Button Variants */}
            <Card>
              <CardHeader>
                <CardTitle>8. Button System (Variants & Sizes)</CardTitle>
                <CardDescription>Primary, Secondary, Outline, Ghost, Danger, and Success buttons with exact interactive states.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Variants</h4>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>Primary Teal</Button>
                    <Button variant="secondary">Secondary Slate</Button>
                    <Button variant="accent">Accent Coral</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="soft">Soft Tint</Button>
                    <Button variant="success">Success</Button>
                    <Button variant="danger">Danger</Button>
                    <Button variant="link">Link Button</Button>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Sizes & States</h4>
                  <div className="flex flex-wrap items-center gap-3">
                    <Button variant="primary" size="sm">Small (32px)</Button>
                    <Button variant="primary" size="md">Medium (40px)</Button>
                    <Button variant="primary" size="lg">Large (48px)</Button>
                    <Button variant="primary" size="icon"><Search className="w-4 h-4" /></Button>
                    <Button variant="primary" isLoading>Processing...</Button>
                    <Button variant="primary" disabled>Disabled</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Input Fields & Form Controls */}
            <Card>
              <CardHeader>
                <CardTitle>9. Input Fields & Form Controls</CardTitle>
                <CardDescription>Text inputs, textareas, checkboxes, radio buttons, switches, and validation feedback states.</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Full Legal Name"
                  placeholder="e.g. Dr. Sarah Jenkins"
                  required
                  helperText="Must match official medical license registry."
                />

                <Input
                  label="Verified NPI Record"
                  defaultValue="1849204921"
                  success="NPI Record Verified successfully in registry."
                />

                <Input
                  label="Password"
                  type="password"
                  defaultValue="InvalidPass"
                  error="Password must contain at least 8 characters, one uppercase letter, and one special character."
                />

                <Textarea
                  label="Clinical Notes / Medical Purpose"
                  placeholder="State reason for requesting access to patient health records..."
                  helperText="Required for HIPAA compliance logging."
                />

                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Checkboxes, Radios & Toggles</h4>
                  <Checkbox
                    label="Grant Researcher Consent"
                    description="Allow anonymized health data inclusion in epidemiological studies."
                    checked={checkboxChecked}
                    onChange={(e) => setCheckboxChecked((e.target as HTMLInputElement).checked)}
                  />

                  <Switch
                    label="Enable Emergency Break-Glass Access"
                    checked={switchChecked}
                    onChange={setSwitchChecked}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 3: CARDS & DATA TABLES */}
        {/* =================================================================== */}
        {activeTab === 'tables' && (
          <div className="space-y-8 animate-fade-in">
            {/* KPI Metric Cards & Glass Cards */}
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4">10. Card System Variants</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                  title="Total Patients"
                  value="14,892"
                  change="+12.4%"
                  trend="up"
                  subtitle="vs last month"
                  icon={<Users className="w-5 h-5" />}
                />

                <MetricCard
                  title="Active Consents"
                  value="3,410"
                  change="+8.1%"
                  trend="up"
                  subtitle="granted this week"
                  icon={<CheckCircle2 className="w-5 h-5" />}
                  iconBg="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
                />

                <MetricCard
                  title="Access Requests"
                  value="128"
                  change="-4.2%"
                  trend="down"
                  subtitle="pending review"
                  icon={<FileText className="w-5 h-5" />}
                  iconBg="bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300"
                />

                <GlassCard className="flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-primary-700 dark:text-primary-300">Glassmorphic Card</span>
                    <h4 className="text-lg font-bold text-slate-900 dark:text-white mt-1">Clinical AI Model</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Disease trend prediction model v2.4 active.</p>
                  </div>
                  <Button variant="soft" size="xs" className="mt-4 w-fit">View Accuracy Metrics</Button>
                </GlassCard>
              </div>
            </div>

            {/* Standardized Data Table */}
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4">11. Accessible Data Table</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient / Entity</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Consent Status</TableHead>
                    <TableHead>Access Level</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    { id: 1, name: 'Eleanor Vance', email: 'eleanor.v@hospital.org', role: 'PATIENT', status: 'ACTIVE', level: 'Full EMR', badge: 'success' },
                    { id: 2, name: 'Dr. Marcus Brody', email: 'marcus.brody@clinic.com', role: 'DOCTOR', status: 'GRANTED', level: 'Lab Results Only', badge: 'info' },
                    { id: 3, name: 'BioGen Research Labs', email: 'access@biogen.research', role: 'RESEARCHER', status: 'PENDING', level: 'Anonymized Cohort', badge: 'warning' },
                    { id: 4, name: 'Arthur Pendelton', email: 'arthur.p@healthshare.org', role: 'ADMIN', status: 'ACTIVE', level: 'System Audit', badge: 'primary' },
                  ].map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>
                        <div className="font-semibold text-slate-900 dark:text-slate-100">{row.name}</div>
                        <div className="text-2xs text-slate-500 dark:text-slate-400">{row.email}</div>
                      </TableCell>
                      <TableCell><Badge variant="secondary">{row.role}</Badge></TableCell>
                      <TableCell><Badge variant={row.badge as any} dot>{row.status}</Badge></TableCell>
                      <TableCell><span className="text-xs font-mono">{row.level}</span></TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="xs">Manage</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <TablePagination
                currentPage={tablePage}
                totalPages={3}
                onPageChange={setTablePage}
                totalItems={28}
                itemsPerPage={10}
              />
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 4: DIALOGS & NOTIFICATIONS */}
        {/* =================================================================== */}
        {activeTab === 'overlays' && (
          <div className="space-y-8 animate-fade-in">
            {/* Modal Dialog Trigger */}
            <Card>
              <CardHeader>
                <CardTitle>12. Dialogs & Modal Windows</CardTitle>
                <CardDescription>Accessible modals with backdrop blur, keyboard listeners, and focus traps.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="primary" onClick={() => setIsDialogOpen(true)}>
                  Trigger Confirmation Dialog
                </Button>

                <Dialog
                  isOpen={isDialogOpen}
                  onClose={() => setIsDialogOpen(false)}
                  title="Confirm Consent Revocation"
                  description="Revoking access will immediately prevent Dr. Marcus Brody from viewing patient health records."
                >
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    Are you sure you want to proceed? This action will be logged in the immutable HIPAA audit log.
                  </p>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                    <Button variant="danger" onClick={() => setIsDialogOpen(false)}>Yes, Revoke Consent</Button>
                  </DialogFooter>
                </Dialog>
              </CardContent>
            </Card>

            {/* Notification Toast Triggers */}
            <Card>
              <CardHeader>
                <CardTitle>13. Toast Notification System</CardTitle>
                <CardDescription>Floating notification popups supporting 4 alert types with auto-dismiss.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-3">
                <Button
                  variant="success"
                  onClick={() => addToast({ type: 'success', title: 'Registration Successful', message: 'Welcome to HealthShare. Account verified.' })}
                >
                  Success Toast
                </Button>

                <Button
                  variant="danger"
                  onClick={() => addToast({ type: 'error', title: 'Registration Failed', message: 'An account with this email address already exists.' })}
                >
                  Error Toast
                </Button>

                <Button
                  variant="secondary"
                  onClick={() => addToast({ type: 'warning', title: 'Emergency Break-Glass Used', message: 'Audit event logged automatically.' })}
                >
                  Warning Toast
                </Button>

                <Button
                  variant="accent"
                  onClick={() => addToast({ type: 'info', title: 'System Maintenance Scheduled', message: 'Server update at 02:00 UTC.' })}
                >
                  Info Toast
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 5: LOADING SKELETONS, EMPTY STATES & ERRORS */}
        {/* =================================================================== */}
        {activeTab === 'states' && (
          <div className="space-y-8 animate-fade-in">
            {/* Loading Skeletons */}
            <Card>
              <CardHeader>
                <CardTitle>14. Loading Skeletons</CardTitle>
                <CardDescription>Shimmer placeholders for asynchronous data fetching states.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Text Paragraph Skeleton</h4>
                  <SkeletonText lines={3} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Table Rows Skeleton</h4>
                  <SkeletonTableRows rows={3} />
                </div>
              </CardContent>
            </Card>

            {/* Empty State */}
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">15. Empty States</h3>
              <EmptyState
                title="No Medical Records Found"
                description="This patient currently has no uploaded clinical documents or lab result records in the system."
                actionLabel="Upload First Record"
                onAction={() => alert('Action clicked')}
                secondaryActionLabel="Import External Records"
                onSecondaryAction={() => alert('Secondary action clicked')}
              />
            </div>

            {/* Error States & Banners */}
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">16. Error States & Banners</h3>
              <ErrorBanner
                title="Database Connection Failure"
                message="Something went wrong while attempting to retrieve health records. Please try again later."
                className="mb-4"
              />
              <ErrorState
                title="Failed to Load HealthShare Dashboard"
                message="Something went wrong. Please check your network connection or contact system administration."
                onRetry={() => alert('Retry trigger')}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
