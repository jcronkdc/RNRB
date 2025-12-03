'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Music,
  Mic2,
  Headphones,
  Guitar,
  Edit3,
  FileText,
  Radio,
  Loader2,
  X,
  Check,
  Sparkles,
} from '@/components/ui/custom-icons';

interface ActivityOption {
  id: string;
  label: string;
  icon: typeof Music;
  color: string;
}

const ACTIVITY_OPTIONS: ActivityOption[] = [
  { id: 'writing', label: 'Writing a song', icon: Edit3, color: '#f59e0b' },
  { id: 'recording', label: 'Recording in studio', icon: Mic2, color: '#ef4444' },
  { id: 'practicing', label: 'Practicing', icon: Guitar, color: '#22c55e' },
  { id: 'listening', label: 'Listening to music', icon: Headphones, color: '#8b5cf6' },
  { id: 'mixing', label: 'Mixing a track', icon: Radio, color: '#3b82f6' },
  { id: 'jamming', label: 'Jamming', icon: Music, color: '#ec4899' },
  { id: 'learning', label: 'Learning something new', icon: Sparkles, color: '#06b6d4' },
  { id: 'composing', label: 'Composing', icon: FileText, color: '#f97316' },
];

interface UserStatus {
  activity: string | null;
  customMessage: string | null;
  updatedAt: string | null;
}

export function ActivityStatus() {
  const [status, setStatus] = useState<UserStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [customMessage, setCustomMessage] = useState('');
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/social/activity-status');
      if (response.ok) {
        const data = await response.json();
        setStatus(data);
        setCustomMessage(data.customMessage || '');
      }
    } catch (error) {
      console.error('Error fetching status:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (activity: string | null, message?: string) => {
    setUpdating(true);
    try {
      const response = await fetch('/api/social/activity-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activity, customMessage: message || customMessage }),
      });

      if (response.ok) {
        const data = await response.json();
        setStatus(data);
        setShowOptions(false);
        setEditMode(false);
      }
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setUpdating(false);
    }
  };

  const clearStatus = async () => {
    setUpdating(true);
    try {
      const response = await fetch('/api/social/activity-status', {
        method: 'DELETE',
      });

      if (response.ok) {
        setStatus({ activity: null, customMessage: null, updatedAt: null });
        setCustomMessage('');
      }
    } catch (error) {
      console.error('Error clearing status:', error);
    } finally {
      setUpdating(false);
    }
  };

  const currentActivity = ACTIVITY_OPTIONS.find((a) => a.id === status?.activity);

  if (loading) {
    return (
      <div
        className="flex items-center gap-3 rounded-xl p-4"
        style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--border)' }}
      >
        <Loader2 className="h-5 w-5 animate-spin" style={{ color: 'var(--muted)' }} />
        <span style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>Loading status...</span>
      </div>
    );
  }

  return (
    <div
      className="overflow-hidden rounded-xl"
      style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--border)' }}
    >
      {/* Current Status Display */}
      <div className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: '600',
              color: 'var(--muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            Your Activity Status
          </span>
          {status?.activity && (
            <button
              onClick={clearStatus}
              disabled={updating}
              style={{
                fontSize: '0.75rem',
                color: 'var(--muted)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              {updating ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <>
                  <X className="h-3 w-3" />
                  Clear
                </>
              )}
            </button>
          )}
        </div>

        {status?.activity ? (
          <div className="flex items-center gap-3">
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: `${currentActivity?.color}20`,
              }}
            >
              {currentActivity && (
                <currentActivity.icon
                  style={{ height: '20px', width: '20px', color: currentActivity.color }}
                />
              )}
            </div>
            <div className="flex-1">
              <p style={{ fontWeight: '500', color: 'var(--text)' }}>{currentActivity?.label}</p>
              {status.customMessage && (
                <p style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>
                  {status.customMessage}
                </p>
              )}
            </div>
            <button
              onClick={() => setShowOptions(true)}
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--panel)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
                fontSize: '0.75rem',
              }}
            >
              Change
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowOptions(true)}
            className="flex w-full items-center gap-3 rounded-xl p-3 transition-all hover:bg-white/5"
            style={{ backgroundColor: 'var(--panel)', border: '1px dashed var(--border)' }}
          >
            <Sparkles style={{ height: '20px', width: '20px', color: 'var(--muted)' }} />
            <span style={{ color: 'var(--muted)' }}>What are you working on?</span>
          </button>
        )}
      </div>

      {/* Activity Options Modal */}
      <AnimatePresence>
        {showOptions && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ borderTop: '1px solid var(--border)', overflow: 'hidden' }}
          >
            <div className="space-y-3 p-4">
              <p style={{ fontWeight: '500', color: 'var(--text)', fontSize: '0.875rem' }}>
                What are you working on?
              </p>

              <div className="grid grid-cols-2 gap-2">
                {ACTIVITY_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => {
                      if (status?.activity === option.id) {
                        setEditMode(true);
                      } else {
                        updateStatus(option.id);
                      }
                    }}
                    disabled={updating}
                    className="flex items-center gap-2 rounded-xl p-3 transition-all hover:scale-[1.02]"
                    style={{
                      backgroundColor:
                        status?.activity === option.id ? `${option.color}20` : 'var(--panel)',
                      border:
                        status?.activity === option.id
                          ? `1px solid ${option.color}`
                          : '1px solid var(--border)',
                    }}
                  >
                    <option.icon style={{ height: '16px', width: '16px', color: option.color }} />
                    <span style={{ fontSize: '0.75rem', color: 'var(--text)' }}>
                      {option.label}
                    </span>
                  </button>
                ))}
              </div>

              {/* Custom message input */}
              <div className="mt-4">
                <input
                  type="text"
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="Add a custom message..."
                  maxLength={100}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--panel)',
                    border: '1px solid var(--border)',
                    color: 'var(--text)',
                    fontSize: '0.875rem',
                  }}
                />
              </div>

              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => updateStatus(status?.activity || 'practicing')}
                  disabled={updating}
                  style={{
                    flex: 1,
                    padding: '10px 16px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--accent)',
                    color: 'white',
                    fontWeight: '500',
                    fontSize: '0.875rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  {updating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      Save Status
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowOptions(false)}
                  style={{
                    padding: '10px 16px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--panel)',
                    border: '1px solid var(--border)',
                    color: 'var(--text)',
                    fontWeight: '500',
                    fontSize: '0.875rem',
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
