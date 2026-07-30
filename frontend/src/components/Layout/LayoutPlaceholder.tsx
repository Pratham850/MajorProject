import React from 'react';
import {
  FileText,
  Brain,
  ShieldCheck,
  Bell,
  Activity,
  Layers,
  Smartphone,
  Sliders,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ExternalLink,
} from 'lucide-react';
import { Badge } from '../ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';

export const LayoutPlaceholder: React.FC = () => {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-700 via-primary-600 to-indigo-700 p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute right-0 top-0 -mr-12 -mt-12 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold backdrop-blur-md mb-4">
            <Activity className="w-3.5 h-3.5 text-emerald-300" />
            <span>HealthShare Reusable Application Shell</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome to the HealthShare Frontend Shell
          </h1>
          <p className="mt-2 text-sm text-primary-100 leading-relaxed">
            This reusable application layout serves as the core foundation for all platform features, providing an intuitive collapsible sidebar, top navigation, global search, notifications, and responsive controls.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="hover:shadow-md transition-shadow border-slate-200/80 dark:border-slate-800">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3.5 bg-primary-50 dark:bg-primary-950/60 rounded-xl text-primary-600 dark:text-primary-400">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Medical Records</p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">1,248</h3>
              <p className="text-2xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold mt-1">
                <ArrowUpRight className="w-3 h-3" /> +12% this month
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow border-slate-200/80 dark:border-slate-800">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3.5 bg-indigo-50 dark:bg-indigo-950/60 rounded-xl text-indigo-600 dark:text-indigo-400">
              <Brain className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">AI Prediction Models</p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">99.4%</h3>
              <p className="text-2xs text-indigo-600 dark:text-indigo-400 flex items-center gap-1 font-semibold mt-1">
                <CheckCircle2 className="w-3 h-3" /> Verified accuracy
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow border-slate-200/80 dark:border-slate-800">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/60 rounded-xl text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Active Consents</p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">84</h3>
              <p className="text-2xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold mt-1">
                <CheckCircle2 className="w-3 h-3" /> HIPAA compliant
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow border-slate-200/80 dark:border-slate-800">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3.5 bg-amber-50 dark:bg-amber-950/60 rounded-xl text-amber-600 dark:text-amber-400">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Notifications</p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">3 Unread</h3>
              <p className="text-2xs text-amber-600 dark:text-amber-400 flex items-center gap-1 font-semibold mt-1">
                <Clock className="w-3 h-3" /> Last update 10m ago
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Shell Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-100 dark:bg-primary-900/50 text-primary-600 rounded-lg">
                <Layers className="w-5 h-5" />
              </div>
              <CardTitle className="text-base font-bold">Collapsible Sidebar</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed space-y-2">
            <p>
              Features a sleek left sidebar that toggles between expanded (264px) and icon-only collapsed (72px) states for maximum screen real estate.
            </p>
            <div className="flex flex-wrap gap-1.5 pt-2">
              <Badge variant="primary" size="sm">Dashboard</Badge>
              <Badge variant="secondary" size="sm">Medical Records</Badge>
              <Badge variant="info" size="sm">AI Prediction</Badge>
              <Badge variant="success" size="sm">Consent</Badge>
              <Badge variant="warning" size="sm">Notifications</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 rounded-lg">
                <Sliders className="w-5 h-5" />
              </div>
              <CardTitle className="text-base font-bold">Top Navigation Bar</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed space-y-2">
            <p>
              Houses the HealthShare logo, global keyboard-navigable search bar (⌘K), real-time notification popover panel, user profile dropdown, and theme switcher.
            </p>
            <div className="flex flex-wrap gap-1.5 pt-2">
              <Badge variant="secondary" size="sm">Logo/Title</Badge>
              <Badge variant="secondary" size="sm">Search Bar</Badge>
              <Badge variant="secondary" size="sm">Notifications</Badge>
              <Badge variant="secondary" size="sm">User Profile</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 rounded-lg">
                <Smartphone className="w-5 h-5" />
              </div>
              <CardTitle className="text-base font-bold">Fully Responsive</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed space-y-2">
            <p>
              Optimized for all viewports from mobile smartphones to ultra-wide displays with smooth slide-over drawer menus on mobile touchscreens.
            </p>
            <div className="flex flex-wrap gap-1.5 pt-2">
              <Badge variant="success" size="sm">Mobile Drawer</Badge>
              <Badge variant="success" size="sm">Desktop Collapsible</Badge>
              <Badge variant="success" size="sm">Clean CSS Grid</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Demo Main Content Table */}
      <Card className="border-slate-200/80 dark:border-slate-800 overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
              Placeholder Content Area: Recent Platform Events
            </CardTitle>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Demonstrating children content rendered within the application shell layout.
            </p>
          </div>
          <Badge variant="primary" size="sm" className="hidden sm:inline-flex">
            Live Stream
          </Badge>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-bold border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="px-6 py-3">Module</th>
                <th className="px-6 py-3">Action Description</th>
                <th className="px-6 py-3">User/System</th>
                <th className="px-6 py-3">Timestamp</th>
                <th className="px-6 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary-500" />
                  Medical Records
                </td>
                <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                  EHR Integration Sync completed for General Hospital Node #4
                </td>
                <td className="px-6 py-4 text-slate-500">System Gateway</td>
                <td className="px-6 py-4 text-slate-400">Just now</td>
                <td className="px-6 py-4 text-right">
                  <Badge variant="success" size="sm">Completed</Badge>
                </td>
              </tr>
              <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <Brain className="w-4 h-4 text-indigo-500" />
                  AI Prediction
                </td>
                <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                  Risk stratification model inference executed on Cardiology cohort
                </td>
                <td className="px-6 py-4 text-slate-500">Dr. Sarah Jenkins</td>
                <td className="px-6 py-4 text-slate-400">12m ago</td>
                <td className="px-6 py-4 text-right">
                  <Badge variant="info" size="sm">Processed</Badge>
                </td>
              </tr>
              <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  Consent
                </td>
                <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                  Data access consent granted for BioGen Research Study #89
                </td>
                <td className="px-6 py-4 text-slate-500">Patient #9281</td>
                <td className="px-6 py-4 text-slate-400">45m ago</td>
                <td className="px-6 py-4 text-right">
                  <Badge variant="success" size="sm">Active</Badge>
                </td>
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
};
