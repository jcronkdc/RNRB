'use client';

/**
 * CONFLICT DETECTOR & TOUR ANALYTICS
 *
 * Shows potential scheduling conflicts, travel warnings, and tour insights
 */

import { Card } from '@cronkwaters/ui';
import { motion } from 'motion/react';
import {
  AlertCircle,
  AlertTriangle,
  Car,
  DollarSign,
  Navigation,
  ExternalLink,
} from '@/components/ui/custom-icons';
import { useMemo } from 'react';

import {
  detectConflicts,
  calculateTourStats,
  formatTravelTime,
  calculatePerDiem,
  generateDirectionsUrl,
  type ShowConflict,
  type TourStats,
  type PerDiemCalculation,
} from '@/lib/calendar-utils';

interface ConflictDetectorProps {
  shows: Array<{
    id: string;
    name: string;
    date: string;
    venue?: {
      latitude?: number;
      longitude?: number;
      city?: string;
      state?: string;
      name: string;
    };
    [key: string]: unknown;
  }>;
  bandMembers?: number;
  perDiemRate?: number;
}

export function ConflictDetector({
  shows,
  bandMembers = 4,
  perDiemRate = 50,
}: ConflictDetectorProps) {
  const conflicts = useMemo(() => detectConflicts(shows), [shows]);
  const tourStats = useMemo(() => calculateTourStats(shows), [shows]);
  const perDiem = useMemo(
    () => calculatePerDiem(shows, bandMembers, perDiemRate),
    [shows, bandMembers, perDiemRate]
  );

  const errors = conflicts.filter((c) => c.severity === 'error');
  const warnings = conflicts.filter((c) => c.severity === 'warning');

  if (shows.length < 2) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Conflicts */}
      {conflicts.length > 0 && (
        <Card className="rnrb-card p-4">
          <div className="mb-3 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <h3 className="font-semibold">
              {errors.length} {errors.length === 1 ? 'Conflict' : 'Conflicts'} Detected
            </h3>
            {warnings.length > 0 && (
              <span className="text-sm text-muted-foreground">
                + {warnings.length} {warnings.length === 1 ? 'warning' : 'warnings'}
              </span>
            )}
          </div>

          <div className="space-y-2">
            {conflicts.map((conflict, index) => (
              <ConflictCard key={index} conflict={conflict} shows={shows} />
            ))}
          </div>
        </Card>
      )}

      {/* Tour Analytics */}
      <TourAnalytics stats={tourStats} perDiem={perDiem} shows={shows} />
    </div>
  );
}

function ConflictCard({ conflict, shows }: { conflict: ShowConflict; shows: any[] }) {
  const conflictShows = conflict.shows.map((id) => shows.find((s) => s.id === id)).filter(Boolean);

  const severityStyles = {
    error: 'border-red-500/50 bg-red-500/10',
    warning: 'border-yellow-500/50 bg-yellow-500/10',
  };

  const iconStyles = {
    error: 'text-red-500',
    warning: 'text-yellow-500',
  };

  const Icon = conflict.severity === 'error' ? AlertCircle : AlertTriangle;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-lg border p-3 ${severityStyles[conflict.severity]}`}
    >
      <div className="flex items-start gap-3">
        <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${iconStyles[conflict.severity]}`} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">{conflict.message}</p>
          <div className="mt-1 space-y-1">
            {conflictShows.map((show) => (
              <div key={show.id} className="text-xs text-muted-foreground">
                • {show.name}
                {show.venue?.city && ` - ${show.venue.city}, ${show.venue.state || ''}`}
              </div>
            ))}
          </div>
          {conflict.distance && conflict.travelTime && (
            <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
              <Car className="h-3 w-3" />
              <span>
                {Math.round(conflict.distance)} miles • {formatTravelTime(conflict.travelTime)}{' '}
                drive
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function TourAnalytics({
  stats,
  perDiem,
  shows,
}: {
  stats: TourStats;
  perDiem: PerDiemCalculation;
  shows: any[];
}) {
  const directionsUrl = useMemo(() => generateDirectionsUrl(shows), [shows]);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {/* Travel Stats */}
      <Card className="rnrb-card p-4">
        <div className="mb-3 flex items-center gap-2">
          <Car className="h-5 w-5 text-brand-primary" />
          <h3 className="font-semibold">Travel Statistics</h3>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total Distance</span>
            <span className="font-semibold">{stats.totalMiles.toLocaleString()} mi</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total Travel Time</span>
            <span className="font-semibold">{formatTravelTime(stats.totalTravelTime)}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Avg Miles/Day</span>
            <span className="font-semibold">{stats.averageMilesPerDay} mi</span>
          </div>

          {stats.longestDrive && (
            <div className="border-t border-border pt-3">
              <div className="mb-1 text-xs text-muted-foreground">Longest Drive</div>
              <div className="text-sm">
                <div className="font-medium">{Math.round(stats.longestDrive.distance)} miles</div>
                <div className="text-xs text-muted-foreground">
                  {stats.longestDrive.from} → {stats.longestDrive.to}
                </div>
              </div>
            </div>
          )}

          <div className="border-t border-border pt-3">
            <div className="mb-1 text-xs text-muted-foreground">Coverage</div>
            <div className="text-sm">
              <span className="font-medium">{stats.statesVisited.size}</span> states •{' '}
              <span className="font-medium">{stats.citiesVisited.size}</span> cities
            </div>
          </div>

          {directionsUrl && (
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-brand-primary hover:underline"
            >
              <Navigation className="h-4 w-4" />
              Open Route in Google Maps
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </Card>

      {/* Per Diem Budget */}
      <Card className="rnrb-card p-4">
        <div className="mb-3 flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-green-500" />
          <h3 className="font-semibold">Per Diem Budget</h3>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total Days</span>
            <span className="font-semibold">{perDiem.totalDays}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Band Members</span>
            <span className="font-semibold">{perDiem.bandMembers}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Rate per Person/Day</span>
            <span className="font-semibold">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
              }).format(perDiem.perDiemRate)}
            </span>
          </div>

          <div className="border-t border-border pt-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium">Total Budget</span>
              <span className="text-lg font-bold text-green-500">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  minimumFractionDigits: 0,
                }).format(perDiem.totalPerDiem)}
              </span>
            </div>
          </div>

          <div className="space-y-2 border-t border-border pt-3">
            <div className="mb-1 text-xs text-muted-foreground">Breakdown</div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Meals (50%)</span>
              <span>
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  minimumFractionDigits: 0,
                }).format(perDiem.breakdown.meals)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Lodging (35%)</span>
              <span>
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  minimumFractionDigits: 0,
                }).format(perDiem.breakdown.lodging)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Transport (15%)</span>
              <span>
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  minimumFractionDigits: 0,
                }).format(perDiem.breakdown.transportation)}
              </span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
