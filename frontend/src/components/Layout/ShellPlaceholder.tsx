import React from 'react';
import { Activity, CheckCircle2, ShieldCheck, Layers, Layout, Bell } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';

export const ShellPlaceholder: React.FC = () => {
  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto py-4">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary-700 via-primary-600 to-indigo-700 p-8 sm:p-10 text-white shadow-2xl">
        <div className="absolute right-0 top-0 -mr-16 -mt-16 w-72 h-72 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold backdrop-blur-md">
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            <span>Application Shell Ready</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            Welcome to HealthShare
          </h1>

          <p className="text-sm sm:text-base text-primary-100 max-w-2xl leading-relaxed">
            The application shell foundation is assembled and operating. The TopNavbar, collapsible Sidebar, and responsive Main Content area are integrated and ready for page component injection.
          </p>
        </div>
      </div>

      {/* Shell System Integration Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary-100 dark:bg-primary-950/60 text-primary-600 rounded-xl">
                <Layout className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-base font-bold">TopNavbar</CardTitle>
                <p className="text-2xs text-slate-400">Header Component</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="text-xs text-slate-600 dark:text-slate-400 space-y-2">
            <p>Sticky top navigation bar featuring HealthShare breadcrumb, global search bar, notification badge, and profile dropdown.</p>
            <Badge variant="success" size="sm" dot>Integrated</Badge>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 rounded-xl">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-base font-bold">Sidebar</CardTitle>
                <p className="text-2xs text-slate-400">Navigation Drawer</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="text-xs text-slate-600 dark:text-slate-400 space-y-2">
            <p>Fixed desktop sidebar with collapsible states, active item highlighting, and 6 core navigation items.</p>
            <Badge variant="success" size="sm" dot>Integrated</Badge>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 rounded-xl">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-base font-bold">Main Content</CardTitle>
                <p className="text-2xs text-slate-400">React Children Landmark</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="text-xs text-slate-600 dark:text-slate-400 space-y-2">
            <p>Independently scrollable main content landmark area rendering dynamic React page children.</p>
            <Badge variant="success" size="sm" dot>Integrated</Badge>
          </CardContent>
        </Card>
      </div>

      {/* Integration Checklist Summary */}
      <Card className="border-slate-200/80 dark:border-slate-800 p-6">
        <div className="flex items-center gap-3 mb-4">
          <ShieldCheck className="w-5 h-5 text-primary-600" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Architecture Integration Status
          </h3>
        </div>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600 dark:text-slate-300">
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>TopNavbar spans full viewport width at top</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Sidebar fixed below navbar on desktop</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Main content area scrolls independently</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Clean layout spacing & zero overlapping components</span>
          </li>
        </ul>
      </Card>
    </div>
  );
};

export default ShellPlaceholder;
