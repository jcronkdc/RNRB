'use client';

import { Card, Button } from '@cronkwaters/ui';
import { motion } from 'motion/react';
import {
  Copyright,
  DollarSign,
  Users,
  FileText,
  Check,
  AlertCircle,
  Plus,
  Trash2,
  Download,
} from '@/components/ui/custom-icons';
import { useEffect, useState } from 'react';

type Split = {
  id: string;
  userId: string;
  percentage: number;
  role: string;
  splitType: string;
  proAffiliation: string | null;
  ipiNumber: string | null;
  publisherName: string | null;
  publisherSplit: number | null;
  confirmed: boolean;
  confirmedAt: string | null;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
};

type CopyrightManagerProps = {
  songId: string;
  songTitle: string;
  currentCopyright?: any;
};

export function CopyrightManager({ songId, songTitle, currentCopyright }: CopyrightManagerProps) {
  const [copyrightInfo, setCopyrightInfo] = useState(currentCopyright || {});
  const [splits, setSplits] = useState<Split[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSplits();
  }, [songId]);

  const loadSplits = async () => {
    try {
      // Note: This endpoint would need to be created
      const response = await fetch(`/api/songs/${songId}/splits`);
      if (response.ok) {
        const data = await response.json();
        setSplits(data.splits || []);
      }
    } catch (err) {
      console.error('Failed to load splits:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCopyright = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/songs/${songId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ copyrightInfo }),
      });

      if (!response.ok) throw new Error('Failed to save');
      alert('Copyright information saved successfully!');
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleAddSplit = () => {
    const email = prompt('Collaborator email:');
    if (!email) return;

    const percentage = parseFloat(prompt('Percentage (0-100):') || '0');
    if (percentage <= 0 || percentage > 100) {
      alert('Invalid percentage');
      return;
    }

    const role = prompt('Role (e.g., writer, producer, performer):') || 'contributor';

    // In real implementation, this would call an API
    alert('Split added! (API integration needed)');
  };

  const totalSplits = splits.reduce((sum, s) => sum + s.percentage, 0);
  const splitsValid = Math.abs(totalSplits - 100) < 0.01;

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Loading copyright info...</div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Copyright className="h-5 w-5 text-brand-primary" />
          <h2 className="text-xl font-semibold">Copyright & Publishing</h2>
        </div>
        <Button onClick={handleSaveCopyright} disabled={saving} className="rnrb-button-primary">
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {/* Copyright Info */}
      <Card className="p-6">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
          <FileText className="h-5 w-5 text-brand-primary" />
          Song Information
        </h3>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm text-muted-foreground">Copyright Year</label>
            <input
              type="number"
              value={copyrightInfo.year || new Date().getFullYear()}
              onChange={(e) =>
                setCopyrightInfo({ ...copyrightInfo, year: parseInt(e.target.value) })
              }
              className="w-full rounded-lg border border-border bg-surface px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-muted-foreground">Copyright Holder</label>
            <input
              type="text"
              value={copyrightInfo.holder || ''}
              onChange={(e) => setCopyrightInfo({ ...copyrightInfo, holder: e.target.value })}
              placeholder="Your Name or Company"
              className="w-full rounded-lg border border-border bg-surface px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-muted-foreground">
              ISWC (International Standard Musical Work Code)
            </label>
            <input
              type="text"
              value={copyrightInfo.iswc || ''}
              onChange={(e) => setCopyrightInfo({ ...copyrightInfo, iswc: e.target.value })}
              placeholder="T-123.456.789-0"
              className="w-full rounded-lg border border-border bg-surface px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-muted-foreground">
              ISRC (International Standard Recording Code)
            </label>
            <input
              type="text"
              value={copyrightInfo.isrc || ''}
              onChange={(e) => setCopyrightInfo({ ...copyrightInfo, isrc: e.target.value })}
              placeholder="USRC17607839"
              className="w-full rounded-lg border border-border bg-surface px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-muted-foreground">PRO Affiliation</label>
            <select
              value={copyrightInfo.pro || ''}
              onChange={(e) => setCopyrightInfo({ ...copyrightInfo, pro: e.target.value })}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2"
            >
              <option value="">Select PRO</option>
              <option value="BMI">BMI</option>
              <option value="ASCAP">ASCAP</option>
              <option value="SESAC">SESAC</option>
              <option value="SOCAN">SOCAN (Canada)</option>
              <option value="PRS">PRS for Music (UK)</option>
              <option value="GEMA">GEMA (Germany)</option>
              <option value="APRA">APRA (Australia)</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm text-muted-foreground">
              IPI Number (Interested Party Info)
            </label>
            <input
              type="text"
              value={copyrightInfo.ipiNumber || ''}
              onChange={(e) => setCopyrightInfo({ ...copyrightInfo, ipiNumber: e.target.value })}
              placeholder="00123456789"
              className="w-full rounded-lg border border-border bg-surface px-3 py-2"
            />
          </div>
        </div>
      </Card>

      {/* Splits Calculator */}
      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="flex items-center gap-2 text-lg font-semibold">
              <DollarSign className="h-5 w-5 text-brand-primary" />
              Revenue Splits
            </h3>
            <p className="text-sm text-muted-foreground">
              Total: {totalSplits.toFixed(1)}% {splitsValid ? '✓' : '(Must equal 100%)'}
            </p>
          </div>
          <Button onClick={handleAddSplit} className="flex items-center gap-2" variant="secondary">
            <Plus className="h-4 w-4" />
            Add Split
          </Button>
        </div>

        {!splitsValid && splits.length > 0 && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-orange-500/20 bg-orange-500/10 p-3 text-orange-500">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <p className="text-sm">
              Splits must total exactly 100%. Currently at {totalSplits.toFixed(1)}%
            </p>
          </div>
        )}

        {splits.length === 0 ? (
          <div className="py-8 text-center">
            <Users className="mx-auto mb-3 h-12 w-12 text-muted-foreground/50" />
            <p className="mb-2 text-muted-foreground">No splits defined</p>
            <p className="mb-4 text-sm text-muted-foreground">
              Add collaborators and define revenue split percentages
            </p>
            <Button onClick={handleAddSplit} className="rnrb-button-primary">
              <Plus className="mr-2 h-4 w-4" />
              Add First Split
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {splits.map((split, index) => (
              <motion.div
                key={split.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="border-border bg-surface p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-primary/10">
                        <span className="font-semibold text-brand-primary">
                          {split.percentage}%
                        </span>
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{split.user.name || split.user.email}</p>
                          {split.confirmed && <Check className="h-4 w-4 text-green-500" />}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {split.role} • {split.splitType.replace(/_/g, ' ')}
                        </p>
                        {split.proAffiliation && (
                          <p className="text-xs text-muted-foreground">
                            PRO: {split.proAffiliation}
                            {split.ipiNumber && ` • IPI: ${split.ipiNumber}`}
                          </p>
                        )}
                      </div>
                    </div>

                    <Button
                      variant="secondary"
                      size="sm"
                      className="text-red-500 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {splitsValid && splits.length > 0 && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-green-500/20 bg-green-500/10 p-3 text-green-500">
            <Check className="h-4 w-4 flex-shrink-0" />
            <p className="text-sm">Splits are valid! Ready to generate split sheet.</p>
          </div>
        )}
      </Card>

      {/* Export Options */}
      {splitsValid && splits.length > 0 && (
        <Card className="p-6">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <Download className="h-5 w-5 text-brand-primary" />
            Export & Agreements
          </h3>

          <div className="grid gap-3 md:grid-cols-2">
            <Button variant="secondary" className="justify-start">
              <FileText className="mr-2 h-4 w-4" />
              Generate Split Sheet PDF
            </Button>

            <Button variant="secondary" className="justify-start">
              <FileText className="mr-2 h-4 w-4" />
              Collaboration Agreement
            </Button>

            <Button variant="secondary" className="justify-start">
              <FileText className="mr-2 h-4 w-4" />
              Work for Hire Agreement
            </Button>

            <Button variant="secondary" className="justify-start">
              <FileText className="mr-2 h-4 w-4" />
              Master Use License
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
