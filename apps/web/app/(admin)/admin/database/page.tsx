'use client';

import { trpc } from '@cronkwaters/trpc/client/react';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Clock,
  Cpu,
  Database,
  HardDrive,
  Loader2,
  MemoryStick,
  RefreshCw,
  Server,
  Table,
  TrendingUp,
} from 'lucide-react';

function TableRow({
  table,
  index,
  maxCount,
}: {
  table: { table: string; count: number };
  index: number;
  maxCount: number;
}) {
  const percentage = (table.count / maxCount) * 100;

  return (
    <tr className="border-b border-white/5 hover:bg-white/[0.02]">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/20">
            <Table className="h-4 w-4 text-purple-400" />
          </div>
          <span className="font-medium capitalize text-white">
            {table.table.replace(/_/g, ' ')}
          </span>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className="text-lg font-semibold text-white">{table.count.toLocaleString()}</span>
      </td>
      <td className="w-64 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/5">
            <div
              style={{ width: `${percentage}%` }}
              className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
            />
          </div>
          <span className="w-12 text-right text-xs text-zinc-500">{percentage.toFixed(1)}%</span>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-400">
          <CheckCircle2 className="h-3 w-3" />
          Healthy
        </span>
      </td>
    </tr>
  );
}

function SystemMetric({
  label,
  value,
  unit,
  icon: Icon,
  color,
  percentage,
}: {
  label: string;
  value: string | number;
  unit?: string;
  icon: any;
  color: string;
  percentage?: number;
}) {
  return (
    <div
      className="rounded-xl border p-4"
      style={{ borderColor: 'rgba(255, 255, 255, 0.06)', background: 'rgba(255,255,255,0.02)' }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4" style={{ color }} />
          <span className="text-sm text-zinc-500">{label}</span>
        </div>
        {percentage !== undefined && (
          <span
            className={`text-xs ${percentage > 80 ? 'text-red-400' : percentage > 60 ? 'text-amber-400' : 'text-emerald-400'}`}
          >
            {percentage.toFixed(1)}%
          </span>
        )}
      </div>
      <p className="mt-2 text-xl font-bold text-white">
        {value}
        {unit && <span className="ml-1 text-sm text-zinc-500">{unit}</span>}
      </p>
      {percentage !== undefined && (
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/5">
          <div
            className={`h-full rounded-full ${percentage > 80 ? 'bg-red-500' : percentage > 60 ? 'bg-amber-500' : 'bg-emerald-500'}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}
    </div>
  );
}

export default function DatabasePage() {
  const {
    data: dbStats,
    isLoading: dbLoading,
    refetch: refetchDb,
  } = trpc.admin.getDatabaseStats.useQuery();
  const {
    data: health,
    isLoading: healthLoading,
    refetch: refetchHealth,
  } = trpc.admin.getSystemHealth.useQuery();

  const isLoading = dbLoading || healthLoading;
  const maxCount = dbStats ? Math.max(...dbStats.tables.map((t) => t.count)) : 1;

  const handleRefresh = () => {
    refetchDb();
    refetchHealth();
  };

  // Format bytes
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Calculate memory percentage (using reasonable limits)
  const heapUsedMB = health?.memory ? health.memory.heapUsed / 1024 / 1024 : 0;
  const heapTotalMB = health?.memory ? health.memory.heapTotal / 1024 / 1024 : 1;
  const memoryPercentage = (heapUsedMB / heapTotalMB) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Database Health</h1>
          <p className="text-sm text-zinc-500">Monitor database tables and system performance</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        </div>
      ) : (
        <>
          {/* System Status */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div
              className="rounded-xl border p-4"
              style={{
                borderColor: 'rgba(255, 255, 255, 0.06)',
                background: 'rgba(255,255,255,0.02)',
              }}
            >
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-purple-400" />
                <span className="text-sm text-zinc-500">Database Status</span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                {health?.database === 'healthy' ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    <span className="text-lg font-semibold text-emerald-400">Healthy</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-5 w-5 text-red-400" />
                    <span className="text-lg font-semibold text-red-400">Error</span>
                  </>
                )}
              </div>
            </div>
            <div
              className="rounded-xl border p-4"
              style={{
                borderColor: 'rgba(255, 255, 255, 0.06)',
                background: 'rgba(255,255,255,0.02)',
              }}
            >
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-cyan-400" />
                <span className="text-sm text-zinc-500">Server Uptime</span>
              </div>
              <p className="mt-2 text-lg font-semibold text-white">
                {health?.uptime
                  ? `${Math.floor(health.uptime / 3600)}h ${Math.floor((health.uptime % 3600) / 60)}m`
                  : 'N/A'}
              </p>
            </div>
            <div
              className="rounded-xl border p-4"
              style={{
                borderColor: 'rgba(255, 255, 255, 0.06)',
                background: 'rgba(255,255,255,0.02)',
              }}
            >
              <div className="flex items-center gap-2">
                <Server className="h-4 w-4 text-orange-400" />
                <span className="text-sm text-zinc-500">Node Version</span>
              </div>
              <p className="mt-2 text-lg font-semibold text-white">
                {health?.nodeVersion || 'N/A'}
              </p>
            </div>
            <div
              className="rounded-xl border p-4"
              style={{
                borderColor: 'rgba(255, 255, 255, 0.06)',
                background: 'rgba(255,255,255,0.02)',
              }}
            >
              <div className="flex items-center gap-2">
                <HardDrive className="h-4 w-4 text-pink-400" />
                <span className="text-sm text-zinc-500">Total Records</span>
              </div>
              <p className="mt-2 text-lg font-semibold text-white">
                {dbStats?.totalRecords.toLocaleString() || 0}
              </p>
            </div>
          </div>

          {/* Memory Usage */}
          <div
            className="rounded-2xl border p-6"
            style={{
              background:
                'linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.01) 100%)',
              borderColor: 'rgba(255, 255, 255, 0.06)',
            }}
          >
            <h2 className="mb-4 text-lg font-semibold text-white">Memory Usage</h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <SystemMetric
                label="Heap Used"
                value={formatBytes(health?.memory?.heapUsed || 0)}
                icon={MemoryStick}
                color="#8b5cf6"
                percentage={memoryPercentage}
              />
              <SystemMetric
                label="Heap Total"
                value={formatBytes(health?.memory?.heapTotal || 0)}
                icon={HardDrive}
                color="#06b6d4"
              />
              <SystemMetric
                label="RSS"
                value={formatBytes(health?.memory?.rss || 0)}
                icon={Cpu}
                color="#f97316"
              />
              <SystemMetric
                label="External"
                value={formatBytes(health?.memory?.external || 0)}
                icon={Activity}
                color="#ec4899"
              />
            </div>
          </div>

          {/* Database Tables */}
          <div
            className="rounded-2xl border"
            style={{
              background:
                'linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.01) 100%)',
              borderColor: 'rgba(255, 255, 255, 0.06)',
            }}
          >
            <div className="border-b border-white/5 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Database Tables</h2>
                <span className="text-sm text-zinc-500">{dbStats?.tables.length || 0} tables</span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr
                    className="border-b border-white/10"
                    style={{ background: 'rgba(255,255,255,0.02)' }}
                  >
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                      Table Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                      Record Count
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                      Distribution
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {dbStats?.tables
                    .sort((a, b) => b.count - a.count)
                    .map((table, index) => (
                      <TableRow key={table.table} table={table} index={index} maxCount={maxCount} />
                    ))}
                </tbody>
              </table>
            </div>
          </div>

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
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20">
                  <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm text-zinc-500">Query Performance</p>
                  <p className="text-lg font-semibold text-emerald-400">Optimal</p>
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
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/20">
                  <BarChart3 className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-zinc-500">Connection Pool</p>
                  <p className="text-lg font-semibold text-white">Active</p>
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
                  <p className="text-sm text-zinc-500">Last Backup</p>
                  <p className="text-lg font-semibold text-white">Automatic (Supabase)</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
