import React, { useState } from 'react';
import { StatCard } from '../components/common/StatCard';
import { MedicalRecordCard } from '../components/common/MedicalRecordCard';
import { ConsentCard } from '../components/common/ConsentCard';
import { PredictionCard } from '../components/common/PredictionCard';
import { ActivityTimeline } from '../components/common/ActivityTimeline';
import { HealthChart } from '../components/common/HealthChart';
import { DataTable } from '../components/common/DataTable';
import { SearchBox } from '../components/common/SearchBox';
import { FilterPanel } from '../components/common/FilterPanel';
import { FileUpload } from '../components/common/FileUpload';
import { ProfileCard } from '../components/common/ProfileCard';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { useToast } from '../components/ui/toast';
import { Activity, Users, ShieldCheck, Database, Layers } from 'lucide-react';

export const ComponentGallery: React.FC = () => {
  const [searchValue, setSearchValue] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const { addToast } = useToast();

  const handleConfirmAction = () => {
    setConfirmLoading(true);
    setTimeout(() => {
      setConfirmLoading(false);
      setIsConfirmOpen(false);
      addToast({ type: 'success', title: 'Consent Revoked', message: 'Action successfully logged in HIPAA audit trail.' });
    }, 1000);
  };

  const sampleChartData = [
    { name: 'Jan', value: 120, secondaryValue: 80 },
    { name: 'Feb', value: 210, secondaryValue: 130 },
    { name: 'Mar', value: 180, secondaryValue: 140 },
    { name: 'Apr', value: 340, secondaryValue: 220 },
    { name: 'May', value: 290, secondaryValue: 190 },
    { name: 'Jun', value: 410, secondaryValue: 310 },
  ];

  const sampleTableData = [
    { id: 1, name: 'Eleanor Vance', role: 'PATIENT', date: '2026-07-28', status: 'ACTIVE' },
    { id: 2, name: 'Dr. Marcus Brody', role: 'DOCTOR', date: '2026-07-27', status: 'GRANTED' },
    { id: 3, name: 'BioGen Labs', role: 'RESEARCHER', date: '2026-07-26', status: 'PENDING' },
    { id: 4, name: 'Arthur Pendelton', role: 'ADMIN', date: '2026-07-25', status: 'ACTIVE' },
  ];

  const tableColumns = [
    { key: 'name', header: 'Identity / Name', sortable: true },
    { key: 'role', header: 'User Role', accessor: (r: any) => <Badge variant="secondary">{r.role}</Badge> },
    { key: 'status', header: 'Status', accessor: (r: any) => <Badge variant="success" dot>{r.status}</Badge> },
    { key: 'date', header: 'Date', sortable: true },
  ];

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Intro Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-primary-900 via-secondary-900 to-slate-900 text-white shadow-elevated">
        <Badge variant="primary" className="bg-white/10 text-primary-200 border-none mb-2">
          Healthcare Component Suite
        </Badge>
        <h1 className="text-2xl sm:text-3xl font-extrabold">Reusable Component Showcase</h1>
        <p className="text-xs text-slate-300 mt-1 max-w-2xl">
          Production-ready, responsive, typed React components built for clinical EHR exchanges, ML analytics, and consent management.
        </p>
      </div>

      {/* 1. StatCards & KPI Metrics */}
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary-600" /> 1. Reusable Statistic Cards
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Patients"
            value="18,490"
            change="+14.2%"
            trend="up"
            subtext="vs last month"
            icon={<Users className="w-5 h-5" />}
          />
          <StatCard
            title="Active Consents"
            value="4,210"
            change="+9.5%"
            trend="up"
            subtext="verified HIPAA consents"
            icon={<ShieldCheck className="w-5 h-5" />}
            iconBg="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
          />
          <StatCard
            title="Dataset Queries"
            value="142"
            change="-2.1%"
            trend="down"
            subtext="research requests"
            icon={<Database className="w-5 h-5" />}
            iconBg="bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300"
          />
          <StatCard
            title="Audit Log Events"
            value="98,120"
            change="100%"
            trend="neutral"
            subtext="immutable records"
            icon={<Layers className="w-5 h-5" />}
            iconBg="bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
          />
        </div>
      </div>

      {/* 2. Medical Record & Consent Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4">2. Medical Record Card</h3>
          <MedicalRecordCard
            id="rec-101"
            title="Comprehensive Metabolic Panel & Lipid Profile"
            category="Lab Result"
            patientName="Eleanor Vance"
            doctorName="Dr. Sarah Jenkins"
            date="2026-07-28"
            fileSize="3.8 MB"
            onView={() => alert('View Record')}
            onDownload={() => alert('Download File')}
          />
        </div>

        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4">3. Consent Sharing Card</h3>
          <ConsentCard
            id="c-202"
            granteeName="BioGen Epidemiological Research"
            granteeRole="RESEARCHER"
            granteeOrganization="BioGen Institute"
            scope={['Anonymized EHR', 'Lab Trends', 'Demographics']}
            status="ACTIVE"
            validUntil="2026-12-31"
            createdAt="2026-01-15"
            onRevoke={() => setIsConfirmOpen(true)}
          />
        </div>
      </div>

      {/* 4. Prediction Card & Profile Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4">4. ML Prediction Analytics Card</h3>
          <PredictionCard
            diseaseName="Cardiovascular Disease Risk Model"
            riskScore={74}
            riskLevel="HIGH"
            confidence={92.4}
            keyFeatures={['Systolic BP > 140', 'Cholesterol 240 mg/dL', 'Age 58']}
            recommendation="Schedule follow-up lipid screening and prescribe preventative statin regimen."
          />
        </div>

        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4">5. User Profile Card</h3>
          <ProfileCard
            name="Dr. Marcus Brody"
            email="marcus.brody@stjude.org"
            role="DOCTOR"
            organization="St. Jude Cardiology Dept."
            joinedDate="Feb 2025"
            stats={[
              { label: 'Active Patients', value: 142 },
              { label: 'Records Reviewed', value: 890 },
              { label: 'Approvals', value: 45 },
            ]}
            onEditProfile={() => alert('Edit preferences')}
          />
        </div>
      </div>

      {/* 6. Health Charts */}
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4">6. Recharts Analytics Wrapper</h3>
        <HealthChart
          title="Patient Record Exchanges & Dataset Queries (2026)"
          subtitle="Monthly trend analysis for clinical interoperability."
          data={sampleChartData}
          type="area"
          dataKey="value"
          secondaryDataKey="secondaryValue"
        />
      </div>

      {/* 7. Search, Filter & Reusable DataTable */}
      <Card>
        <CardHeader>
          <CardTitle>7. Search Box, Filter Panel & DataTable Component</CardTitle>
          <CardDescription>Integrated search, multi-select filters, sorting, and pagination.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <SearchBox value={searchValue} onChange={setSearchValue} placeholder="Search user directory..." />
            <FilterPanel
              groups={[
                {
                  id: 'role',
                  title: 'User Role',
                  options: [
                    { id: 'PATIENT', label: 'Patient' },
                    { id: 'DOCTOR', label: 'Doctor' },
                    { id: 'RESEARCHER', label: 'Researcher' },
                    { id: 'ADMIN', label: 'Admin' },
                  ],
                },
              ]}
              selectedFilters={selectedFilters}
              onChange={setSelectedFilters}
            />
          </div>

          <DataTable data={sampleTableData} columns={tableColumns} itemsPerPage={3} />
        </CardContent>
      </Card>

      {/* 8. Drag & Drop File Upload */}
      <Card>
        <CardHeader>
          <CardTitle>8. Drag & Drop File Upload Component</CardTitle>
          <CardDescription>Supports format validation, max size checks, and upload list previews.</CardDescription>
        </CardHeader>
        <CardContent>
          <FileUpload onFilesSelected={(files) => addToast({ type: 'success', title: 'Files Uploaded', message: `${files.length} clinical file(s) selected.` })} />
        </CardContent>
      </Card>

      {/* 9. Activity Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>9. HIPAA Activity Audit Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <ActivityTimeline
            items={[
              {
                id: 1,
                title: 'Consent Scope Approved',
                description: 'Patient Eleanor Vance granted Cardiology Lab access to Dr. Sarah Jenkins.',
                timestamp: '12 mins ago',
                actorName: 'Eleanor Vance',
                actorRole: 'PATIENT',
                type: 'consent',
              },
              {
                id: 2,
                title: 'EHR Record Encrypted & Uploaded',
                description: 'Uploaded metabolic panel results (3.8 MB). Encryption key generated.',
                timestamp: '1 hour ago',
                actorName: 'Dr. Sarah Jenkins',
                actorRole: 'DOCTOR',
                type: 'record',
              },
            ]}
          />
        </CardContent>
      </Card>

      {/* 10. Confirmation Dialog Trigger */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmAction}
        title="Revoke Consent Permission?"
        description="This action will immediately prevent BioGen Epidemiological Research from querying anonymized health record trends."
        confirmText="Revoke Access"
        variant="danger"
        isLoading={confirmLoading}
      />
    </div>
  );
};
