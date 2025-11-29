'use client';

import { useState, useCallback } from 'react';
import {
  Link2,
  Link2Off,
  RefreshCw,
  Settings2,
  Check,
  AlertTriangle,
  Clock,
  Database,
  Loader2,
  ChevronDown,
  ChevronUp,
  Music,
  Calendar,
  Users,
  Trophy,
} from 'lucide-react';
import { DataSyncPicker, SyncableItem } from './DataSyncPicker';

type SyncDataType = 'songs' | 'shows' | 'members' | 'awards';

interface SyncConfig {
  enabled: boolean;
  dataType: SyncDataType;
  selectedIds: string[];
  lastSyncedAt?: string;
  autoRefresh?: boolean;
}

interface SyncControlsProps {
  sectionType: string;
  syncConfig: SyncConfig | null;
  onSyncConfigChange: (config: SyncConfig | null) => void;
  onRefresh: (items: unknown[]) => void;
}

// Map section types to their sync data types
const sectionToDataType: Record<string, SyncDataType> = {
  music_player: 'songs',
  music_spotify: 'songs',
  music_apple: 'songs',
  discography: 'songs',
  streaming: 'songs',
  tour_dates: 'shows',
  tour_map: 'shows',
  tour_upcoming: 'shows',
  band_members: 'members',
  achievements: 'awards',
  awards: 'awards',
};

const dataTypeLabels: Record<SyncDataType, { label: string; icon: typeof Music }> = {
  songs: { label: 'Songs', icon: Music },
  shows: { label: 'Tour Dates', icon: Calendar },
  members: { label: 'Band Members', icon: Users },
  awards: { label: 'Awards', icon: Trophy },
};

export function SyncControls({
  sectionType,
  syncConfig,
  onSyncConfigChange,
  onRefresh,
}: SyncControlsProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const dataType = sectionToDataType[sectionType];

  // If this section type doesn't support syncing, don't render anything
  if (!dataType) {
    return null;
  }

  const { label, icon: Icon } = dataTypeLabels[dataType];
  const isEnabled = syncConfig?.enabled ?? false;
  const selectedCount = syncConfig?.selectedIds?.length ?? 0;
  const lastSynced = syncConfig?.lastSyncedAt ? new Date(syncConfig.lastSyncedAt) : null;

  const handleToggleSync = () => {
    if (isEnabled) {
      // Disable sync - confirm first if they have selections
      if (selectedCount > 0) {
        if (
          confirm('Disabling sync will disconnect this section from your dashboard data. Continue?')
        ) {
          onSyncConfigChange(null);
        }
      } else {
        onSyncConfigChange(null);
      }
    } else {
      // Enable sync - open picker
      setShowPicker(true);
    }
  };

  const handleSelectionChange = (selectedIds: string[], selectedItems: SyncableItem[]) => {
    // Convert selected items to section content format
    const items = selectedItems.map((item) => {
      switch (item.type) {
        case 'song':
          return {
            id: item.data.id,
            title: item.data.title,
            artist: item.data.artist,
            audioUrl: item.data.audioUrl,
            coverUrl: item.data.coverUrl,
            duration: item.data.duration,
          };
        case 'show':
          return {
            id: item.data.id,
            name: item.data.name,
            date: item.data.date,
            venue: item.data.venue,
            ticketUrl: item.data.ticketUrl,
            status: item.data.status,
          };
        case 'member':
          return {
            id: item.data.id,
            name: item.data.name,
            role: item.data.role,
            image: item.data.image,
            instruments: item.data.instruments,
          };
        case 'award':
          return {
            id: item.data.id,
            name: item.data.name,
            organization: item.data.organization,
            year: item.data.year,
            image: item.data.image,
          };
        default:
          return item.data;
      }
    });

    // Update sync config
    onSyncConfigChange({
      enabled: true,
      dataType,
      selectedIds,
      lastSyncedAt: new Date().toISOString(),
      autoRefresh: syncConfig?.autoRefresh ?? false,
    });

    // Push the data to the section
    onRefresh(items);
  };

  const handleRefresh = useCallback(async () => {
    if (!syncConfig || selectedCount === 0) return;

    setIsRefreshing(true);
    try {
      const response = await fetch('/api/sites/sync-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: dataType,
          ids: syncConfig.selectedIds,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to refresh');
      }

      const data = await response.json();

      // Update last synced time
      onSyncConfigChange({
        ...syncConfig,
        lastSyncedAt: data.syncedAt,
      });

      // Push refreshed data
      onRefresh(data.items);
    } catch (error) {
      console.error('Sync refresh failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [syncConfig, selectedCount, dataType, onSyncConfigChange, onRefresh]);

  const formatLastSynced = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const getSyncStatus = () => {
    if (!isEnabled) return { status: 'disabled', color: 'var(--muted)' };
    if (selectedCount === 0) return { status: 'no-selection', color: 'var(--muted)' };
    if (!lastSynced) return { status: 'never-synced', color: '#f59e0b' };

    const hoursSinceSync = (Date.now() - lastSynced.getTime()) / 3600000;
    if (hoursSinceSync > 24) return { status: 'stale', color: '#f59e0b' };
    return { status: 'synced', color: '#10b981' };
  };

  const syncStatus = getSyncStatus();

  return (
    <>
      {/* Compact Sync Bar */}
      <div
        className="rounded-xl"
        style={{
          background: 'var(--panel)',
          border: `1px solid ${isEnabled ? syncStatus.color + '40' : 'var(--border)'}`,
        }}
      >
        {/* Header */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex w-full items-center justify-between px-4 py-3"
        >
          <div className="flex items-center gap-3">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg"
              style={{ background: isEnabled ? syncStatus.color + '20' : 'var(--bg)' }}
            >
              {isEnabled ? (
                <Link2 size={16} style={{ color: syncStatus.color }} />
              ) : (
                <Link2Off size={16} style={{ color: 'var(--muted)' }} />
              )}
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                  Dashboard Sync
                </span>
                {isEnabled && (
                  <span
                    className="rounded-full px-2 py-0.5 text-xs font-medium"
                    style={{ background: syncStatus.color + '20', color: syncStatus.color }}
                  >
                    {selectedCount} {label}
                  </span>
                )}
              </div>
              <span className="text-xs" style={{ color: 'var(--muted)' }}>
                {isEnabled
                  ? lastSynced
                    ? `Last synced ${formatLastSynced(lastSynced)}`
                    : 'Never synced'
                  : 'Connect to your dashboard data'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isEnabled && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRefresh();
                }}
                disabled={isRefreshing || selectedCount === 0}
                className="rounded-lg p-2 transition-colors hover:bg-white/10 disabled:opacity-50"
                style={{ color: 'var(--muted)' }}
                title="Refresh from dashboard"
              >
                <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
              </button>
            )}
            {isExpanded ? (
              <ChevronUp size={16} style={{ color: 'var(--muted)' }} />
            ) : (
              <ChevronDown size={16} style={{ color: 'var(--muted)' }} />
            )}
          </div>
        </button>

        {/* Expanded Content */}
        {isExpanded && (
          <div
            className="space-y-4 px-4 pb-4"
            style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}
          >
            {/* Sync Status */}
            <div
              className="flex items-center gap-3 rounded-lg p-3"
              style={{ background: 'var(--bg)' }}
            >
              {syncStatus.status === 'synced' && (
                <>
                  <Check size={18} style={{ color: '#10b981' }} />
                  <div className="flex-1">
                    <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                      Synced with Dashboard
                    </p>
                    <p className="text-xs" style={{ color: 'var(--muted)' }}>
                      {selectedCount} items connected
                    </p>
                  </div>
                </>
              )}
              {syncStatus.status === 'stale' && (
                <>
                  <AlertTriangle size={18} style={{ color: '#f59e0b' }} />
                  <div className="flex-1">
                    <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                      Data may be outdated
                    </p>
                    <p className="text-xs" style={{ color: 'var(--muted)' }}>
                      Last synced {lastSynced && formatLastSynced(lastSynced)}
                    </p>
                  </div>
                </>
              )}
              {syncStatus.status === 'disabled' && (
                <>
                  <Database size={18} style={{ color: 'var(--muted)' }} />
                  <div className="flex-1">
                    <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                      Manual Mode
                    </p>
                    <p className="text-xs" style={{ color: 'var(--muted)' }}>
                      Data is managed manually in this section
                    </p>
                  </div>
                </>
              )}
              {syncStatus.status === 'no-selection' && (
                <>
                  <Clock size={18} style={{ color: 'var(--muted)' }} />
                  <div className="flex-1">
                    <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                      No Items Selected
                    </p>
                    <p className="text-xs" style={{ color: 'var(--muted)' }}>
                      Choose items from your dashboard to sync
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              {isEnabled ? (
                <>
                  <button
                    onClick={() => setShowPicker(true)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors hover:bg-white/5"
                    style={{
                      color: 'var(--text)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    <Settings2 size={16} />
                    Edit Selection
                  </button>
                  <button
                    onClick={handleToggleSync}
                    className="flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10"
                    style={{ border: '1px solid rgba(239, 68, 68, 0.3)' }}
                  >
                    <Link2Off size={16} />
                    Disconnect
                  </button>
                </>
              ) : (
                <button
                  onClick={handleToggleSync}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all hover:scale-[1.02]"
                  style={{
                    background: 'var(--accent)',
                    color: '#fff',
                  }}
                >
                  <Link2 size={16} />
                  Connect to Dashboard
                </button>
              )}
            </div>

            {/* Auto-refresh toggle (when enabled) */}
            {isEnabled && (
              <label
                className="flex cursor-pointer items-center justify-between rounded-lg p-3"
                style={{ background: 'var(--bg)' }}
              >
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                    Auto-refresh
                  </p>
                  <p className="text-xs" style={{ color: 'var(--muted)' }}>
                    Automatically update when you edit your dashboard
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onSyncConfigChange({
                      ...syncConfig,
                      autoRefresh: !syncConfig.autoRefresh,
                    });
                  }}
                  className={`relative h-6 w-11 rounded-full transition-colors ${
                    syncConfig.autoRefresh ? '' : ''
                  }`}
                  style={{
                    background: syncConfig.autoRefresh ? 'var(--accent)' : 'var(--border)',
                  }}
                >
                  <span
                    className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                      syncConfig.autoRefresh ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </label>
            )}

            {/* Info */}
            <p className="text-xs" style={{ color: 'var(--muted)' }}>
              {isEnabled
                ? 'Synced items will update when you click Refresh or save changes to your dashboard.'
                : 'Enabling sync lets you import data directly from your dashboard instead of entering it manually.'}
            </p>
          </div>
        )}
      </div>

      {/* Data Picker Modal */}
      <DataSyncPicker
        isOpen={showPicker}
        onClose={() => setShowPicker(false)}
        dataType={dataType}
        currentSelection={syncConfig?.selectedIds || []}
        onSelectionChange={handleSelectionChange}
        sectionType={sectionType}
      />
    </>
  );
}
