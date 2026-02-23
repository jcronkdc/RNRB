'use client';

import { trpc } from '@cronkwaters/trpc/client/react';
import {
  BarChart3,
  Calendar,
  Check,
  CreditCard,
  Database,
  FileJson,
  FileSpreadsheet,
  FileText,
  HardDrive,
  Loader2,
  Music4,
  PieChart,
  Play,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useState } from 'react';

interface ReportType {
  id: 'users' | 'revenue' | 'content' | 'usage' | 'full';
  label: string;
  description: string;
  icon: any;
  color: string;
}

const reportTypes: ReportType[] = [
  {
    id: 'users',
    label: 'User Report',
    description: 'All user data including profiles, subscriptions, and activity',
    icon: Users,
    color: '#f97316',
  },
  {
    id: 'revenue',
    label: 'Revenue Report',
    description: 'Subscription revenue, MRR, churn rates, and billing data',
    icon: CreditCard,
    color: '#22c55e',
  },
  {
    id: 'content',
    label: 'Content Report',
    description: 'Songs, projects, posts, and media uploads',
    icon: Music4,
    color: '#8b5cf6',
  },
  {
    id: 'usage',
    label: 'Usage Report',
    description: 'AI requests, storage, video minutes, and resource consumption',
    icon: HardDrive,
    color: '#06b6d4',
  },
  {
    id: 'full',
    label: 'Full Platform Report',
    description: 'Comprehensive overview of all platform metrics',
    icon: Database,
    color: '#ec4899',
  },
];

interface GeneratedReport {
  id: string;
  type: string;
  format: string;
  generatedAt: string;
  status: 'completed' | 'processing' | 'failed';
  downloadUrl?: string;
}

function ReportCard({
  report,
  isSelected,
  onSelect,
}: {
  report: ReportType;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={`group relative overflow-hidden rounded-2xl border p-5 text-left transition-all hover:scale-[1.02] active:scale-[0.98] ${
        isSelected
          ? 'border-orange-500/50 bg-orange-500/10'
          : 'border-white/10 hover:border-white/20 hover:bg-white/5'
      }`}
    >
      <div className="flex items-start justify-between">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-xl transition-transform group-hover:scale-110"
          style={{ background: `${report.color}20` }}
        >
          <report.icon className="h-6 w-6" style={{ color: report.color }} />
        </div>
        {isSelected && (
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500">
            <Check className="h-4 w-4 text-white" />
          </div>
        )}
      </div>
      <h3 className="mt-4 font-semibold text-white">{report.label}</h3>
      <p className="mt-1 text-sm text-zinc-500">{report.description}</p>
    </button>
  );
}

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState<ReportType['id']>('users');
  const [selectedFormat, setSelectedFormat] = useState<'json' | 'csv'>('json');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });
  const [generatedReports, setGeneratedReports] = useState<GeneratedReport[]>([]);

  const generateMutation = trpc.admin.generateReport.useMutation({
    onSuccess: (data) => {
      // Create a blob and trigger download
      const blob = new Blob(
        [selectedFormat === 'json' ? JSON.stringify(data.data, null, 2) : convertToCSV(data.data)],
        { type: selectedFormat === 'json' ? 'application/json' : 'text/csv' }
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${data.type}-report-${new Date().toISOString().split('T')[0]}.${selectedFormat}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Add to history
      setGeneratedReports((prev) => [
        {
          id: Date.now().toString(),
          type: data.type,
          format: data.format,
          generatedAt: data.generatedAt,
          status: 'completed',
        },
        ...prev,
      ]);
    },
  });

  const convertToCSV = (data: any): string => {
    if (Array.isArray(data)) {
      if (data.length === 0) return '';
      const headers = Object.keys(data[0]);
      const rows = data.map((item) =>
        headers
          .map((header) => {
            const value = item[header];
            if (typeof value === 'object') return JSON.stringify(value);
            return String(value ?? '');
          })
          .join(',')
      );
      return [headers.join(','), ...rows].join('\n');
    }
    // For nested objects, flatten them
    const flatten = (obj: any, prefix = ''): Record<string, any> => {
      return Object.keys(obj).reduce(
        (acc, key) => {
          const pre = prefix.length ? prefix + '_' : '';
          if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
            Object.assign(acc, flatten(obj[key], pre + key));
          } else {
            acc[pre + key] = obj[key];
          }
          return acc;
        },
        {} as Record<string, any>
      );
    };
    const flat = flatten(data);
    return Object.entries(flat)
      .map(([k, v]) => `${k},${v}`)
      .join('\n');
  };

  const handleGenerate = () => {
    generateMutation.mutate({
      type: selectedReport,
      format: selectedFormat,
      dateRange,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Reports & Export</h1>
        <p className="text-sm text-zinc-500">
          Generate and download comprehensive platform reports
        </p>
      </div>

      {/* Report Type Selection */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-white">Select Report Type</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {reportTypes.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              isSelected={selectedReport === report.id}
              onSelect={() => setSelectedReport(report.id)}
            />
          ))}
        </div>
      </div>

      {/* Configuration */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Date Range */}
        <div
          className="rounded-2xl border p-6"
          style={{
            background:
              'linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.01) 100%)',
            borderColor: 'rgba(255, 255, 255, 0.06)',
          }}
        >
          <div className="mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-orange-400" />
            <h3 className="font-semibold text-white">Date Range</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm text-zinc-400">Start Date</label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange((prev) => ({ ...prev, start: e.target.value }))}
                className="w-full rounded-xl border bg-white/5 px-4 py-2.5 text-white focus:border-orange-500/50 focus:outline-hidden"
                style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm text-zinc-400">End Date</label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange((prev) => ({ ...prev, end: e.target.value }))}
                className="w-full rounded-xl border bg-white/5 px-4 py-2.5 text-white focus:border-orange-500/50 focus:outline-hidden"
                style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
              />
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {[
              { label: 'Last 7 days', days: 7 },
              { label: 'Last 30 days', days: 30 },
              { label: 'Last 90 days', days: 90 },
              { label: 'All time', days: null },
            ].map((preset) => (
              <button
                key={preset.label}
                onClick={() => {
                  const end = new Date();
                  const start = preset.days
                    ? new Date(Date.now() - preset.days * 24 * 60 * 60 * 1000)
                    : new Date(0);
                  setDateRange({
                    start: start.toISOString().split('T')[0],
                    end: end.toISOString().split('T')[0],
                  });
                }}
                className="rounded-lg bg-white/5 px-3 py-1.5 text-sm text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Format Selection */}
        <div
          className="rounded-2xl border p-6"
          style={{
            background:
              'linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.01) 100%)',
            borderColor: 'rgba(255, 255, 255, 0.06)',
          }}
        >
          <div className="mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-orange-400" />
            <h3 className="font-semibold text-white">Export Format</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setSelectedFormat('json')}
              className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition-all ${
                selectedFormat === 'json'
                  ? 'border-orange-500/50 bg-orange-500/10'
                  : 'border-white/10 hover:border-white/20 hover:bg-white/5'
              }`}
            >
              <FileJson
                className={`h-8 w-8 ${selectedFormat === 'json' ? 'text-orange-400' : 'text-zinc-400'}`}
              />
              <span
                className={`text-sm font-medium ${selectedFormat === 'json' ? 'text-white' : 'text-zinc-400'}`}
              >
                JSON
              </span>
              <span className="text-xs text-zinc-500">Best for APIs</span>
            </button>
            <button
              onClick={() => setSelectedFormat('csv')}
              className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition-all ${
                selectedFormat === 'csv'
                  ? 'border-orange-500/50 bg-orange-500/10'
                  : 'border-white/10 hover:border-white/20 hover:bg-white/5'
              }`}
            >
              <FileSpreadsheet
                className={`h-8 w-8 ${selectedFormat === 'csv' ? 'text-orange-400' : 'text-zinc-400'}`}
              />
              <span
                className={`text-sm font-medium ${selectedFormat === 'csv' ? 'text-white' : 'text-zinc-400'}`}
              >
                CSV
              </span>
              <span className="text-xs text-zinc-500">Best for Excel</span>
            </button>
          </div>
        </div>
      </div>

      {/* Generate Button */}
      <div className="flex justify-center">
        <button
          onClick={handleGenerate}
          disabled={generateMutation.isPending}
          className="flex items-center gap-3 rounded-2xl bg-linear-to-r from-orange-500 to-red-500 px-8 py-4 text-lg font-semibold text-white transition-all hover:scale-105 hover:shadow-lg hover:shadow-orange-500/25 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {generateMutation.isPending ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Generating Report...
            </>
          ) : (
            <>
              <Play className="h-5 w-5" />
              Generate & Download Report
            </>
          )}
        </button>
      </div>

      {/* Recent Reports */}
      {generatedReports.length > 0 && (
        <div
          className="rounded-2xl border p-6"
          style={{
            background:
              'linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.01) 100%)',
            borderColor: 'rgba(255, 255, 255, 0.06)',
          }}
        >
          <h3 className="mb-4 font-semibold text-white">Recent Reports (This Session)</h3>
          <div className="space-y-3">
            {generatedReports.map((report) => (
              <div
                key={report.id}
                className="flex items-center justify-between rounded-xl bg-white/5 p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/20">
                    <Check className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="font-medium text-white capitalize">{report.type} Report</p>
                    <p className="text-sm text-zinc-500">
                      {new Date(report.generatedAt).toLocaleString()} •{' '}
                      {report.format.toUpperCase()}
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-400">
                  Downloaded
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div
          className="rounded-2xl border p-6"
          style={{
            background:
              'linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.01) 100%)',
            borderColor: 'rgba(255, 255, 255, 0.06)',
          }}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/20">
              <BarChart3 className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{generatedReports.length}</p>
              <p className="text-sm text-zinc-500">Reports Generated</p>
            </div>
          </div>
        </div>
        <div
          className="rounded-2xl border p-6"
          style={{
            background:
              'linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.01) 100%)',
            borderColor: 'rgba(255, 255, 255, 0.06)',
          }}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/20">
              <TrendingUp className="h-6 w-6 text-cyan-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">5</p>
              <p className="text-sm text-zinc-500">Report Types Available</p>
            </div>
          </div>
        </div>
        <div
          className="rounded-2xl border p-6"
          style={{
            background:
              'linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.01) 100%)',
            borderColor: 'rgba(255, 255, 255, 0.06)',
          }}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/20">
              <PieChart className="h-6 w-6 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">2</p>
              <p className="text-sm text-zinc-500">Export Formats</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
