import React, { useState, useMemo, useEffect } from 'react';
import {
  BarChart2,
  TrendingUp,
  Filter,
  Users,
  Activity,
  Award,
  Calendar,
  X,
} from 'lucide-react';
import { StatCard } from '../components/common/StatCard';
import { HealthChart } from '../components/common/HealthChart';
import { InsightCard } from '../components/common/InsightCard';
import { ExportToolbar } from '../components/common/ExportToolbar';
import { analyticsService } from '../services/analytics.service';
import { cn } from '../lib/utils';

export const ResearchAnalyticsPage: React.FC = () => {
  // Filter States
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('ALL');
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('Past 6 Months');
  const [selectedAgeBand, setSelectedAgeBand] = useState<string>('ALL');
  const [analyticsData, setAnalyticsData] = useState<any>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await analyticsService.getResearcherAnalytics();
        setAnalyticsData(data);
      } catch (err: any) {
        console.warn('Analytics fetch info:', err?.message);
      }
    };
    fetchAnalytics();
  }, []);

  const specialties = ['ALL', 'Cardiology', 'Oncology', 'Endocrinology', 'Neurology'];
  const timeframes = ['Past 30 Days', 'Past 6 Months', 'Past 1 Year', 'All-Time'];
  const ageBands = ['ALL', '20-35', '36-50', '51-65', '65+'];

  // Synthetic Analytics Data for Charts
  const ckdRiskDistributionData = [
    { name: 'Low Risk', value: 55, secondaryValue: 0 },
    { name: 'Moderate Risk', value: 30, secondaryValue: 0 },
    { name: 'High Risk', value: 15, secondaryValue: 0 },
  ];

  const ageDistributionData = [
    { name: '20-35 Yrs', value: 18, secondaryValue: 12 },
    { name: '36-50 Yrs', value: 32, secondaryValue: 24 },
    { name: '51-65 Yrs', value: 38, secondaryValue: 28 },
    { name: '65+ Yrs', value: 12, secondaryValue: 10 },
  ];

  const diseaseCategoryData = [
    { name: 'Cardiology', value: 38, secondaryValue: 28 },
    { name: 'Endocrinology', value: 28, secondaryValue: 22 },
    { name: 'Oncology', value: 18, secondaryValue: 14 },
    { name: 'Neurology', value: 16, secondaryValue: 10 },
  ];

  const datasetGrowthTrendData = [
    { name: 'Jan', value: 18400, secondaryValue: 12000 },
    { name: 'Feb', value: 24200, secondaryValue: 16500 },
    { name: 'Mar', value: 31000, secondaryValue: 22000 },
    { name: 'Apr', value: 38500, secondaryValue: 28400 },
    { name: 'May', value: 42900, secondaryValue: 34100 },
    { name: 'Jun', value: 48920, secondaryValue: 39500 },
  ];

  // Calculated KPI stats based on filters
  const kpiStats = useMemo(() => {
    let cohortMultiplier = selectedSpecialty === 'Cardiology' ? 0.38 : selectedSpecialty === 'Endocrinology' ? 0.28 : 1.0;
    return {
      cohortSize: Math.round(48920 * cohortMultiplier).toLocaleString(),
      ckdPrevalence: '24.8%',
      avgAge: '54.2 yrs',
      dataQualityScore: '98.5%',
    };
  }, [selectedSpecialty]);

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-2">
            <BarChart2 className="w-3.5 h-3.5" /> De-Identified Population Analytics Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Research Analytics & Insights
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Population-level epidemiological distributions, demographic breakdowns, and AI-generated insights.
          </p>
        </div>

        {/* Export Toolbar Component */}
        <ExportToolbar reportTitle="HealthShare Population Analytics Report 2026" />
      </div>

      {/* 2. Analytics Filters Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
            <Filter className="w-4 h-4 text-primary-600" />
            <span>Population Analytics Filters</span>
          </div>
          {(selectedSpecialty !== 'ALL' || selectedTimeframe !== 'Past 6 Months' || selectedAgeBand !== 'ALL') && (
            <button
              onClick={() => {
                setSelectedSpecialty('ALL');
                setSelectedTimeframe('Past 6 Months');
                setSelectedAgeBand('ALL');
              }}
              className="text-2xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1"
            >
              <X className="w-3 h-3" /> Reset Filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          {/* Specialty Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Therapeutic Specialty</label>
            <div className="flex flex-wrap gap-1">
              {specialties.map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedSpecialty(s)}
                  className={cn(
                    'px-2.5 py-1 rounded-lg text-2xs font-bold transition-all',
                    selectedSpecialty === s
                      ? 'bg-primary-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Timeframe Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Observation Timeframe</label>
            <div className="flex flex-wrap gap-1">
              {timeframes.map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedTimeframe(t)}
                  className={cn(
                    'px-2.5 py-1 rounded-lg text-2xs font-bold transition-all',
                    selectedTimeframe === t
                      ? 'bg-primary-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Age Band Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Cohort Age Band</label>
            <div className="flex flex-wrap gap-1">
              {ageBands.map((a) => (
                <button
                  key={a}
                  onClick={() => setSelectedAgeBand(a)}
                  className={cn(
                    'px-2.5 py-1 rounded-lg text-2xs font-bold transition-all',
                    selectedAgeBand === a
                      ? 'bg-primary-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  )}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. KPI Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Anonymized Cohort Volume"
          value={kpiStats.cohortSize}
          change="Safe Harbor Certified"
          trend="up"
          subtext="De-identified patient records"
          icon={<Users className="w-5 h-5" />}
        />
        <StatCard
          title="CKD Prevalence Rate"
          value={kpiStats.ckdPrevalence}
          change="+1.8% baseline shift"
          trend="neutral"
          subtext="Biomarker validated"
          icon={<Activity className="w-5 h-5" />}
          iconBg="bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
        />
        <StatCard
          title="Mean Cohort Age"
          value={kpiStats.avgAge}
          change="Std Dev: 11.4 yrs"
          trend="neutral"
          subtext="Demographic average"
          icon={<Calendar className="w-5 h-5" />}
          iconBg="bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300"
        />
        <StatCard
          title="Data Quality Index"
          value={kpiStats.dataQualityScore}
          change="Safe Harbor Verified"
          trend="up"
          subtext="Completeness score"
          icon={<Award className="w-5 h-5" />}
          iconBg="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
        />
      </div>

      {/* 4. AI-GENERATED INSIGHT CARDS SECTION */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary-600" /> AI Population Health Insights & Findings
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InsightCard
            title="Elevated CKD Risk Trajectory in 51-65 Demographic"
            category="Renal Epidemiological Finding"
            type="warning"
            impactScore="HIGH IMPACT"
            metric="+14.2%"
            description="Statistical correlation observed between serum creatinine > 1.6 mg/dL and systolic BP > 138 mmHg in the 51-65 age cohort."
          />
          <InsightCard
            title="Cardiovascular Biomarker Stability"
            category="Cardiology Telemetry"
            type="positive"
            impactScore="STABLE"
            metric="92.4%"
            description="Over 92.4% of cardiac cohort telemetry records exhibit stable lipid panel distributions under routine statin therapy."
          />
          <InsightCard
            title="Safe Harbor Sanitization Quality Verified"
            category="IRB Compliance Audit"
            type="info"
            impactScore="VERIFIED"
            metric="98.5%"
            description="Automated zero-PII audit confirmed 100% compliance across all 48,920 anonymized research records."
          />
        </div>
      </div>

      {/* 5. INTERACTIVE CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart 1: CKD Risk Distribution */}
        <HealthChart
          title="CKD Risk Level Population Distribution"
          subtitle="Percentage breakdown of low, moderate, and high renal risk categories."
          data={ckdRiskDistributionData}
          type="bar"
          dataKey="value"
        />

        {/* Chart 2: Age Distribution */}
        <HealthChart
          title="Cohort Age Demographic Distribution"
          subtitle="Anonymized patient count grouped into standard epidemiological age bands."
          data={ageDistributionData}
          type="bar"
          dataKey="value"
          secondaryDataKey="secondaryValue"
        />

        {/* Chart 3: Disease Category Volume */}
        <HealthChart
          title="Specialty Disease Category Volume"
          subtitle="De-identified patient volume across Cardiology, Endocrinology, Oncology, and Neurology."
          data={diseaseCategoryData}
          type="area"
          dataKey="value"
          secondaryDataKey="secondaryValue"
        />

        {/* Chart 4: Monthly Dataset Growth */}
        <HealthChart
          title="Longitudinal Dataset & Cohort Expansion (2026)"
          subtitle="Monthly growth trajectory of anonymized patient records added to repository."
          data={datasetGrowthTrendData}
          type="line"
          dataKey="value"
          secondaryDataKey="secondaryValue"
        />
      </div>
    </div>
  );
};

export default ResearchAnalyticsPage;
