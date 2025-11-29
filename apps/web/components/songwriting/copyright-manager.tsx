'use client';

import { Card, Button } from '@cronkwaters/ui';
import {
  Shield,
  Users,
  FileCheck,
  AlertCircle,
  Check,
  Plus,
  X,
  PieChart,
  Music,
  HelpCircle,
  ExternalLink,
  Info,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';

import { AudioUploader } from './audio-uploader';
import { CollaborationAgreementGenerator } from './collaboration-agreement';
import { CopyrightGuide } from './copyright-guide';
import { SplitSheetGenerator } from './split-sheet-generator';

const WaveformPlayer = dynamic(() => import('./waveform-player').then((m) => m.WaveformPlayer), {
  ssr: false,
});

export type PRO = 'ASCAP' | 'BMI' | 'SESAC' | 'GMR' | 'SOCAN' | 'PRS' | 'APRA' | 'GEMA' | null;

export type SongSplit = {
  contributorName: string;
  role: 'writer' | 'composer' | 'producer' | 'arranger';
  percentage: number; // 0-100
  email?: string;
  proAffiliation?: PRO;
};

export type CopyrightInfo = {
  // Core Copyright
  copyrightYear?: number;
  copyrightHolder?: string;

  // PRO (Performance Rights Organization)
  performingRightsOrg?: PRO;
  proPublisherNumber?: string;
  proWriterNumber?: string;

  // Industry IDs
  iswc?: string; // International Standard Musical Work Code (T-123.456.789-0)
  isrc?: string; // International Standard Recording Code

  // Publishing
  publisherName?: string;
  publisherShare?: number; // 0-100%

  // Splits
  splits: SongSplit[];

  // Registration
  isRegistered: boolean;
  registrationDate?: string;
  registrationNumber?: string;
};

type CopyrightManagerProps = {
  songId?: string;
  songTitle?: string;
  audioUrl?: string;
  audioPath?: string;
  initialData?: CopyrightInfo;
  onUpdate: (info: CopyrightInfo) => void;
  onAudioUpdate?: (url: string, path: string) => void;
  onAudioRemove?: () => void;
};

const PRO_OPTIONS: Array<{ value: NonNullable<PRO>; label: string; country: string }> = [
  { value: 'ASCAP', label: 'ASCAP', country: 'USA' },
  { value: 'BMI', label: 'BMI', country: 'USA' },
  { value: 'SESAC', label: 'SESAC', country: 'USA' },
  { value: 'GMR', label: 'GMR', country: 'USA' },
  { value: 'SOCAN', label: 'SOCAN', country: 'Canada' },
  { value: 'PRS', label: 'PRS for Music', country: 'UK' },
  { value: 'APRA', label: 'APRA AMCOS', country: 'Australia' },
  { value: 'GEMA', label: 'GEMA', country: 'Germany' },
];

const ROLE_OPTIONS = [
  { value: 'writer', label: 'Writer/Lyricist' },
  { value: 'composer', label: 'Composer' },
  { value: 'producer', label: 'Producer' },
  { value: 'arranger', label: 'Arranger' },
] as const;

export function CopyrightManager({
  songId,
  songTitle = 'Untitled Song',
  audioUrl,
  audioPath,
  initialData,
  onUpdate,
  onAudioUpdate,
  onAudioRemove,
}: CopyrightManagerProps) {
  const [copyrightInfo, setCopyrightInfo] = useState<CopyrightInfo>(
    initialData || {
      splits: [],
      isRegistered: false,
    }
  );

  const [isAddingSplit, setIsAddingSplit] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [newSplit, setNewSplit] = useState<SongSplit>({
    contributorName: '',
    role: 'writer',
    percentage: 0,
  });

  // Calculate total split percentage
  const totalSplitPercentage = copyrightInfo.splits.reduce(
    (sum, split) => sum + split.percentage,
    0
  );
  const remainingPercentage = 100 - totalSplitPercentage;

  // Auto-save when copyright info changes
  useEffect(() => {
    if (songId) {
      onUpdate(copyrightInfo);
    }
  }, [copyrightInfo, songId, onUpdate]);

  const addSplit = () => {
    if (!newSplit.contributorName || newSplit.percentage <= 0) {
      alert('Please enter a contributor name and valid percentage');
      return;
    }

    if (totalSplitPercentage + newSplit.percentage > 100) {
      alert(`Cannot add split. Only ${remainingPercentage}% remaining.`);
      return;
    }

    setCopyrightInfo({
      ...copyrightInfo,
      splits: [...copyrightInfo.splits, newSplit],
    });

    setNewSplit({
      contributorName: '',
      role: 'writer',
      percentage: 0,
    });
    setIsAddingSplit(false);
  };

  const removeSplit = (index: number) => {
    setCopyrightInfo({
      ...copyrightInfo,
      splits: copyrightInfo.splits.filter((_, i) => i !== index),
    });
  };

  const updateSplit = (index: number, field: keyof SongSplit, value: any) => {
    const updatedSplits = [...copyrightInfo.splits];
    updatedSplits[index] = { ...updatedSplits[index], [field]: value };
    setCopyrightInfo({
      ...copyrightInfo,
      splits: updatedSplits,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border-2 border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-blue-500/10 p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-purple-500/20">
              <Shield className="h-7 w-7 text-purple-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Copyright & Publishing</h2>
              <p className="mt-1 text-sm text-gray-300">
                Protect your work and manage ownership splits
              </p>
            </div>
          </div>
          <Button
            onClick={() => setShowGuide(!showGuide)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <HelpCircle className="h-4 w-4" />
            {showGuide ? 'Hide Guide' : 'Show Guide'}
          </Button>
        </div>
      </div>

      {/* Copyright Guide */}
      {showGuide && (
        <div className="animate-in slide-in-from-top">
          <CopyrightGuide onClose={() => setShowGuide(false)} />
        </div>
      )}

      {/* Quick Start Card - Show if user hasn't filled anything out yet */}
      {!copyrightInfo.performingRightsOrg && copyrightInfo.splits.length === 0 && !showGuide && (
        <Card className="border-yellow-500/30 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-yellow-500/20">
              <HelpCircle className="h-6 w-6 text-yellow-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white">New to Music Copyright?</h3>
              <p className="mt-2 text-sm text-gray-300">
                Don't worry! Most of these fields are optional to start. Here's what we recommend:
              </p>
              <ol className="mt-3 space-y-2 text-sm text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400">1.</span>
                  <span>
                    <strong className="text-white">Start simple:</strong> Fill in Copyright Year and
                    Holder below
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400">2.</span>
                  <span>
                    <strong className="text-white">Add collaborators:</strong> Set up ownership
                    splits (must total 100%)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400">3.</span>
                  <span>
                    <strong className="text-white">Join a PRO:</strong> Click "Show Guide" above for
                    step-by-step instructions
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400">4.</span>
                  <span>
                    <strong className="text-white">Get codes:</strong> ISWC, ISRC, and IPI numbers
                    come later when you register
                  </span>
                </li>
              </ol>
              <Button onClick={() => setShowGuide(true)} className="mt-4" variant="outline">
                <HelpCircle className="mr-2 h-4 w-4" />
                Show Complete Guide
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Copyright Information */}
      <Card className="border-gray-800 bg-gradient-to-b from-gray-900 to-black p-6">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
          <FileCheck className="h-5 w-5 text-blue-400" />
          Copyright Information
        </h3>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Copyright Year */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">Copyright Year</label>
            <input
              type="number"
              min="1900"
              max="2099"
              value={copyrightInfo.copyrightYear || new Date().getFullYear()}
              onChange={(e) =>
                setCopyrightInfo({ ...copyrightInfo, copyrightYear: parseInt(e.target.value) })
              }
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white"
              placeholder="2025"
            />
          </div>

          {/* Copyright Holder */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">Copyright Holder</label>
            <input
              type="text"
              value={copyrightInfo.copyrightHolder || ''}
              onChange={(e) =>
                setCopyrightInfo({ ...copyrightInfo, copyrightHolder: e.target.value })
              }
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white"
              placeholder="Your Name or Company"
            />
          </div>

          {/* ISWC */}
          <div>
            <label
              htmlFor="copyright-iswc"
              className="mb-2 block text-sm font-medium text-gray-300"
            >
              ISWC
              <span className="ml-1 text-xs text-gray-500">
                (International Standard Musical Work Code)
              </span>
              <button
                onClick={() => setShowGuide(true)}
                className="ml-2 inline-flex items-center text-blue-400 hover:text-blue-300"
                title="Click for help"
                type="button"
              >
                <Info className="h-3 w-3" />
              </button>
            </label>
            <input
              id="copyright-iswc"
              type="text"
              value={copyrightInfo.iswc || ''}
              onChange={(e) => setCopyrightInfo({ ...copyrightInfo, iswc: e.target.value })}
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 font-mono text-white"
              placeholder="T-123.456.789-0"
              maxLength={15}
            />
            <p className="mt-1 text-xs text-gray-500">
              Get from your PRO when registering this song •
              <a
                href="https://www.ascap.com/help/ace-title-registration"
                target="_blank"
                rel="noopener noreferrer"
                className="ml-1 text-blue-400 hover:text-blue-300"
              >
                Register with ASCAP <ExternalLink className="inline h-3 w-3" />
              </a>
            </p>
          </div>

          {/* ISRC */}
          <div>
            <label
              htmlFor="copyright-isrc"
              className="mb-2 block text-sm font-medium text-gray-300"
            >
              ISRC
              <span className="ml-1 text-xs text-gray-500">
                (International Standard Recording Code)
              </span>
              <button
                onClick={() => setShowGuide(true)}
                className="ml-2 inline-flex items-center text-blue-400 hover:text-blue-300"
                title="Click for help"
                type="button"
              >
                <Info className="h-3 w-3" />
              </button>
            </label>
            <input
              id="copyright-isrc"
              type="text"
              value={copyrightInfo.isrc || ''}
              onChange={(e) => setCopyrightInfo({ ...copyrightInfo, isrc: e.target.value })}
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 font-mono text-white"
              placeholder="US-ABC-12-34567"
              maxLength={12}
            />
            <p className="mt-1 text-xs text-gray-500">
              Get from your distributor (CD Baby, DistroKid) •
              <a
                href="https://usisrc.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="ml-1 text-blue-400 hover:text-blue-300"
              >
                Or register yourself <ExternalLink className="inline h-3 w-3" />
              </a>
            </p>
          </div>
        </div>
      </Card>

      {/* PRO Information */}
      <Card className="border-gray-800 bg-gradient-to-b from-gray-900 to-black p-6">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
          <Shield className="h-5 w-5 text-green-400" />
          Performance Rights Organization (PRO)
        </h3>

        <div className="grid gap-4 md:grid-cols-3">
          {/* PRO Selection */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">
              PRO Affiliation
              <button
                onClick={() => setShowGuide(true)}
                className="ml-2 inline-flex items-center text-blue-400 hover:text-blue-300"
                title="Click for help"
              >
                <Info className="h-3 w-3" />
              </button>
            </label>
            <select
              value={copyrightInfo.performingRightsOrg ?? ''}
              onChange={(e) =>
                setCopyrightInfo({
                  ...copyrightInfo,
                  performingRightsOrg: e.target.value ? (e.target.value as NonNullable<PRO>) : null,
                })
              }
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white"
            >
              <option value="">Select PRO</option>
              {PRO_OPTIONS.map((pro) => (
                <option key={pro.value} value={pro.value}>
                  {pro.label} ({pro.country})
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Don't have a PRO?
              <a
                href="https://www.ascap.com/join"
                target="_blank"
                rel="noopener noreferrer"
                className="ml-1 text-blue-400 hover:text-blue-300"
              >
                Join ASCAP (Free) <ExternalLink className="inline h-3 w-3" />
              </a>
              {' or '}
              <a
                href="https://www.bmi.com/join"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300"
              >
                BMI (Free) <ExternalLink className="inline h-3 w-3" />
              </a>
            </p>
          </div>

          {/* Writer IPI Number */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">
              Writer IPI Number
              <button
                onClick={() => setShowGuide(true)}
                className="ml-2 inline-flex items-center text-blue-400 hover:text-blue-300"
                title="Click for help"
              >
                <Info className="h-3 w-3" />
              </button>
            </label>
            <input
              type="text"
              value={copyrightInfo.proWriterNumber || ''}
              onChange={(e) =>
                setCopyrightInfo({ ...copyrightInfo, proWriterNumber: e.target.value })
              }
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 font-mono text-white"
              placeholder="000000000"
              maxLength={11}
            />
            <p className="mt-1 text-xs text-gray-500">
              Automatically assigned by your PRO when you join
            </p>
          </div>

          {/* Publisher IPI Number */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">
              Publisher IPI Number
              <button
                onClick={() => setShowGuide(true)}
                className="ml-2 inline-flex items-center text-blue-400 hover:text-blue-300"
                title="Click for help"
              >
                <Info className="h-3 w-3" />
              </button>
            </label>
            <input
              type="text"
              value={copyrightInfo.proPublisherNumber || ''}
              onChange={(e) =>
                setCopyrightInfo({ ...copyrightInfo, proPublisherNumber: e.target.value })
              }
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 font-mono text-white"
              placeholder="000000000"
              maxLength={11}
            />
            <p className="mt-1 text-xs text-gray-500">
              If you have your own publishing company (optional)
            </p>
          </div>
        </div>
      </Card>

      {/* Ownership Splits */}
      <Card className="border-gray-800 bg-gradient-to-b from-gray-900 to-black p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
            <Users className="h-5 w-5 text-orange-400" />
            Ownership Splits
          </h3>
          <div
            className={`flex items-center gap-2 rounded-lg border-2 px-4 py-2 ${
              totalSplitPercentage === 100
                ? 'border-green-500/30 bg-green-500/10 text-green-400'
                : totalSplitPercentage > 100
                  ? 'border-red-500/30 bg-red-500/10 text-red-400'
                  : 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400'
            }`}
          >
            <PieChart className="h-4 w-4" />
            <span className="font-mono text-lg font-bold">{totalSplitPercentage}%</span>
            {totalSplitPercentage === 100 && <Check className="h-4 w-4" />}
            {totalSplitPercentage > 100 && <AlertCircle className="h-4 w-4" />}
          </div>
        </div>

        {totalSplitPercentage !== 100 && (
          <div
            className={`mb-4 rounded-lg border-2 p-4 ${
              totalSplitPercentage > 100
                ? 'border-red-500/30 bg-red-500/10'
                : 'border-yellow-500/30 bg-yellow-500/10'
            }`}
          >
            <p
              className={`text-sm font-medium ${
                totalSplitPercentage > 100 ? 'text-red-400' : 'text-yellow-400'
              }`}
            >
              {totalSplitPercentage > 100
                ? `⚠️ Total exceeds 100% by ${totalSplitPercentage - 100}%. Please adjust splits.`
                : `ℹ️ ${remainingPercentage}% remaining to allocate`}
            </p>
          </div>
        )}

        {/* Existing Splits */}
        {copyrightInfo.splits.length > 0 && (
          <div className="mb-4 space-y-3">
            {copyrightInfo.splits.map((split, index) => (
              <div
                key={index}
                className="flex items-center gap-3 rounded-lg border border-gray-700 bg-gray-800/50 p-4"
              >
                <div className="grid flex-1 gap-3 md:grid-cols-4">
                  <div>
                    <p className="text-xs text-gray-500">Name</p>
                    <p className="font-medium text-white">{split.contributorName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Role</p>
                    <p className="text-white">{split.role}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Share</p>
                    <p className="font-mono text-lg font-bold text-orange-400">
                      {split.percentage}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm text-gray-300">{split.email || 'Not provided'}</p>
                  </div>
                </div>
                <button
                  onClick={() => removeSplit(index)}
                  className="rounded-lg border border-red-500/30 bg-red-500/10 p-2 text-red-400 transition hover:bg-red-500/20"
                  title="Remove split"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add Split Form */}
        {!isAddingSplit ? (
          <Button onClick={() => setIsAddingSplit(true)} className="w-full" variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Add Contributor
          </Button>
        ) : (
          <div className="rounded-lg border-2 border-blue-500/30 bg-blue-500/5 p-4">
            <h4 className="mb-3 font-semibold text-white">Add Contributor</h4>
            <div className="grid gap-3 md:grid-cols-2">
              <input
                type="text"
                value={newSplit.contributorName}
                onChange={(e) => setNewSplit({ ...newSplit, contributorName: e.target.value })}
                placeholder="Contributor name"
                className="rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white"
              />
              <select
                value={newSplit.role}
                onChange={(e) => setNewSplit({ ...newSplit, role: e.target.value as any })}
                className="rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white"
              >
                {ROLE_OPTIONS.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min="0"
                max={remainingPercentage}
                value={newSplit.percentage}
                onChange={(e) =>
                  setNewSplit({ ...newSplit, percentage: parseFloat(e.target.value) || 0 })
                }
                placeholder="Percentage"
                className="rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 font-mono text-white"
              />
              <input
                type="email"
                value={newSplit.email || ''}
                onChange={(e) => setNewSplit({ ...newSplit, email: e.target.value })}
                placeholder="Email (optional)"
                className="rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white"
              />
            </div>
            <div className="mt-3 flex gap-2">
              <Button onClick={addSplit} className="flex-1">
                <Check className="mr-2 h-4 w-4" />
                Add Split
              </Button>
              <Button onClick={() => setIsAddingSplit(false)} variant="outline" className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Publishing Information */}
      <Card className="border-gray-800 bg-gradient-to-b from-gray-900 to-black p-6">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
          <FileCheck className="h-5 w-5 text-purple-400" />
          Publishing Information
        </h3>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">Publisher Name</label>
            <input
              type="text"
              value={copyrightInfo.publisherName || ''}
              onChange={(e) =>
                setCopyrightInfo({ ...copyrightInfo, publisherName: e.target.value })
              }
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white"
              placeholder="Publisher or Self-Published"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">
              Publisher Share (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={copyrightInfo.publisherShare || 0}
              onChange={(e) =>
                setCopyrightInfo({
                  ...copyrightInfo,
                  publisherShare: parseFloat(e.target.value) || 0,
                })
              }
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 font-mono text-white"
              placeholder="0-100"
            />
          </div>
        </div>
      </Card>

      {/* Registration Status */}
      <Card className="border-gray-800 bg-gradient-to-b from-gray-900 to-black p-6">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
          <Shield className="h-5 w-5 text-green-400" />
          Registration Status
          <button
            onClick={() => setShowGuide(true)}
            className="ml-2 inline-flex items-center text-blue-400 hover:text-blue-300"
            title="Click for help"
          >
            <Info className="h-3 w-3" />
          </button>
        </h3>

        <div className="mb-4 rounded-lg border border-blue-500/30 bg-blue-500/5 p-4">
          <p className="text-sm text-gray-300">
            <strong className="text-white">💡 What does "registered" mean?</strong>
            <br />
            Check this box when you've registered this song with your PRO (ASCAP, BMI, etc.). This
            is different from U.S. Copyright registration.
          </p>
        </div>

        <div className="space-y-4">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={copyrightInfo.isRegistered}
              onChange={(e) =>
                setCopyrightInfo({ ...copyrightInfo, isRegistered: e.target.checked })
              }
              className="h-5 w-5 rounded border-gray-700 bg-gray-800"
            />
            <span className="text-white">Song is registered with PRO</span>
          </label>

          {copyrightInfo.isRegistered && (
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Registration Date
                </label>
                <input
                  type="date"
                  value={copyrightInfo.registrationDate || ''}
                  onChange={(e) =>
                    setCopyrightInfo({ ...copyrightInfo, registrationDate: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Registration Number
                </label>
                <input
                  type="text"
                  value={copyrightInfo.registrationNumber || ''}
                  onChange={(e) =>
                    setCopyrightInfo({ ...copyrightInfo, registrationNumber: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 font-mono text-white"
                  placeholder="PRO-assigned number"
                />
                <p className="mt-1 text-xs text-gray-500">
                  This is your PRO's tracking number for this song
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Split Sheet Generator */}
      <Card className="border-gray-800 bg-gradient-to-b from-gray-900 to-black p-6">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
          <FileCheck className="h-5 w-5 text-blue-400" />
          Generate Split Sheet
        </h3>
        <SplitSheetGenerator songTitle={songTitle} songId={songId} copyrightInfo={copyrightInfo} />
      </Card>

      {/* Collaboration Agreement */}
      <CollaborationAgreementGenerator songTitle={songTitle} copyrightInfo={copyrightInfo} />

      {/* Audio Upload */}
      <Card className="border-gray-800 bg-gradient-to-b from-gray-900 to-black p-6">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
          <Music className="h-5 w-5 text-purple-400" />
          Audio Track
        </h3>
        <p className="mb-4 text-sm text-gray-400">
          Upload an instrumental, demo, or reference track for this song
        </p>

        {!audioUrl ? (
          <AudioUploader
            songId={songId}
            currentAudioUrl={audioUrl}
            onUploadComplete={(url, path) => {
              if (onAudioUpdate) onAudioUpdate(url, path);
            }}
            onRemove={() => {
              if (onAudioRemove) onAudioRemove();
            }}
            maxSizeMB={50}
          />
        ) : (
          <div className="space-y-4">
            {/* Waveform Player with Sync */}
            <WaveformPlayer audioUrl={audioUrl} />

            {/* Remove Audio Button */}
            <button
              onClick={() => {
                if (onAudioRemove) onAudioRemove();
              }}
              className="w-full rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 transition hover:bg-red-500/20"
            >
              Remove Audio Track
            </button>
          </div>
        )}
      </Card>
    </div>
  );
}
