import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { cn } from '../../lib/utils';

export interface HealthChartDataPoint {
  name: string;
  value: number;
  secondaryValue?: number;
  [key: string]: any;
}

export interface HealthChartProps {
  title?: string;
  subtitle?: string;
  data: HealthChartDataPoint[];
  type?: 'area' | 'bar' | 'line';
  dataKey?: string;
  secondaryDataKey?: string;
  height?: number;
  color?: string;
  secondaryColor?: string;
  className?: string;
}

export const HealthChart: React.FC<HealthChartProps> = ({
  title,
  subtitle,
  data,
  type = 'area',
  dataKey = 'value',
  secondaryDataKey,
  height = 300,
  color = '#0f766e', // Primary Teal
  secondaryColor = '#06b6d4', // Accent Cyan
  className,
}) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl shadow-elevated text-xs">
          <p className="font-bold text-slate-900 dark:text-slate-100 mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center gap-2 text-2xs">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-slate-500 capitalize">{entry.name}:</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    if (type === 'bar') {
      return (
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
          <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
          <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey={dataKey} fill={color} radius={[6, 6, 0, 0]} />
          {secondaryDataKey && <Bar dataKey={secondaryDataKey} fill={secondaryColor} radius={[6, 6, 0, 0]} />}
        </BarChart>
      );
    }

    if (type === 'line') {
      return (
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
          <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
          <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={3} dot={{ r: 4 }} />
          {secondaryDataKey && <Line type="monotone" dataKey={secondaryDataKey} stroke={secondaryColor} strokeWidth={3} dot={{ r: 4 }} />}
        </LineChart>
      );
    }

    // Default Area Chart with Gradients
    return (
      <AreaChart data={data}>
        <defs>
          <linearGradient id="primaryColorGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.4} />
            <stop offset="95%" stopColor={color} stopOpacity={0.0} />
          </linearGradient>
          {secondaryDataKey && (
            <linearGradient id="secondaryColorGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={secondaryColor} stopOpacity={0.4} />
              <stop offset="95%" stopColor={secondaryColor} stopOpacity={0.0} />
            </linearGradient>
          )}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
        <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
        <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2.5} fillOpacity={1} fill="url(#primaryColorGradient)" />
        {secondaryDataKey && (
          <Area type="monotone" dataKey={secondaryDataKey} stroke={secondaryColor} strokeWidth={2.5} fillOpacity={1} fill="url(#secondaryColorGradient)" />
        )}
      </AreaChart>
    );
  };

  return (
    <Card className={cn('w-full', className)}>
      {(title || subtitle) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {subtitle && <CardDescription>{subtitle}</CardDescription>}
        </CardHeader>
      )}
      <CardContent className="pt-4">
        <div style={{ width: '100%', height }}>
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
