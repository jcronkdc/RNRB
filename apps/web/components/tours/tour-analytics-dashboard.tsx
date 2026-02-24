'use client';

/**
 * TOUR DASHBOARD - PRACTICAL METRICS ONLY
 *
 * Features:
 * - Show schedule overview
 * - Routing/distance optimization
 * - Attendance tracking (actual data only)
 * - No fake financial projections
 */

import {
  AlertCircle,
  Calendar,
  Clock,
  Download,
  ExternalLink,
  Loader2,
  MapPin,
  Navigation,
  Ticket,
  Users,
} from '@/components/ui/custom-icons';
import { Button, Card } from '@cronkwaters/ui';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';

interface TourAnalyticsProps {
  tourId: string;
  tourSlug: string;
}

export function TourAnalyticsDashboard({ tourId, tourSlug }: TourAnalyticsProps) {
  const [routing, setRouting] = useState<any>(null);
  const [shows, setShows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'schedule' | 'routing'>('schedule');

  useEffect(() => {
    loadData();
  }, [tourId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [tourRes, routingRes] = await Promise.all([
        fetch(`/api/tours/${tourSlug}?includeShowDetails=true`),
        fetch(`/api/tours/${tourSlug}/routing`),
      ]);

      if (tourRes.ok) {
        const data = await tourRes.json();
        setShows(data.tour?.shows || []);
      }

      if (routingRes.ok) {
        const data = await routingRes.json();
        setRouting(data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await fetch(`/api/tours/${tourSlug}/export?format=csv`);
      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${tourSlug}-schedule.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export data');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="text-brand-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (shows.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Calendar className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
        <p className="text-muted-foreground">No shows scheduled yet.</p>
        <p className="text-muted-foreground text-sm">Add shows to your tour to see the schedule.</p>
      </Card>
    );
  }

  const now = new Date();
  const upcomingShows = shows.filter((show) => new Date(show.date) >= now);
  const pastShows = shows.filter((show) => new Date(show.date) < now);
  const totalAttendance = pastShows.reduce((sum, show) => sum + (show.attendance || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header with Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            variant={activeTab === 'schedule' ? 'default' : 'outline'}
            onClick={() => setActiveTab('schedule')}
            className="flex items-center gap-2"
          >
            <Calendar className="h-4 w-4" />
            Schedule
          </Button>
          <Button
            variant={activeTab === 'routing' ? 'default' : 'outline'}
            onClick={() => setActiveTab('routing')}
            className="flex items-center gap-2"
          >
            <Navigation className="h-4 w-4" />
            Routing
          </Button>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Export Schedule
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <StatCard icon={Calendar} label="Total Shows" value={shows.length} color="blue" />
        <StatCard icon={MapPin} label="Upcoming" value={upcomingShows.length} color="green" />
        <StatCard icon={Clock} label="Completed" value={pastShows.length} color="purple" />
        <StatCard
          icon={Users}
          label="Total Attendance"
          value={totalAttendance.toLocaleString()}
          color="orange"
        />
      </div>

      {/* Schedule Tab */}
      {activeTab === 'schedule' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Upcoming Shows */}
          {upcomingShows.length > 0 && (
            <Card className="p-6">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                <Calendar className="h-5 w-5 text-green-500" />
                Upcoming Shows ({upcomingShows.length})
              </h3>
              <div className="space-y-3">
                {upcomingShows.map((show) => (
                  <ShowCard key={show.id} show={show} />
                ))}
              </div>
            </Card>
          )}

          {/* Past Shows */}
          {pastShows.length > 0 && (
            <Card className="p-6">
              <h3 className="text-muted-foreground mb-4 flex items-center gap-2 text-lg font-semibold">
                <Clock className="h-5 w-5" />
                Completed Shows ({pastShows.length})
              </h3>
              <div className="space-y-3">
                {pastShows.slice(0, 5).map((show) => (
                  <ShowCard key={show.id} show={show} isPast />
                ))}
                {pastShows.length > 5 && (
                  <p className="text-muted-foreground text-center text-sm">
                    + {pastShows.length - 5} more completed shows
                  </p>
                )}
              </div>
            </Card>
          )}
        </motion.div>
      )}

      {/* Routing Tab */}
      {activeTab === 'routing' && routing && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Routing Summary */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card className="p-6">
              <h4 className="text-muted-foreground mb-2 text-sm">Total Distance</h4>
              <p className="text-2xl font-bold">
                {routing.current?.totalDistance?.toLocaleString() || 0} mi
              </p>
              <p className="text-muted-foreground mt-1 text-xs">
                {routing.current?.totalDrivingTime?.toFixed(1) || 0} hours driving
              </p>
            </Card>
            <Card className="p-6">
              <h4 className="text-muted-foreground mb-2 text-sm">Avg Per Leg</h4>
              <p className="text-2xl font-bold">
                {routing.current?.averageDistancePerLeg?.toLocaleString() || 0} mi
              </p>
            </Card>
            <Card className="p-6">
              <h4 className="text-muted-foreground mb-2 text-sm">Issues Detected</h4>
              <p className="text-2xl font-bold text-yellow-500">
                {(routing.current?.issues?.backtracking || 0) +
                  (routing.current?.issues?.longDrives || 0) +
                  (routing.current?.issues?.tightSchedules || 0)}
              </p>
              <p className="text-muted-foreground mt-1 text-xs">
                {routing.current?.issues?.longDrives || 0} long drives •{' '}
                {routing.current?.issues?.tightSchedules || 0} tight schedules
              </p>
            </Card>
          </div>

          {/* Optimization Opportunity */}
          {routing.savings?.distance > 0 && (
            <Card className="border-green-500/20 bg-green-500/5 p-6">
              <h3 className="mb-4 text-lg font-semibold text-green-500">
                Optimization Opportunity
              </h3>
              <p className="text-muted-foreground">
                Reordering shows could save{' '}
                <span className="font-bold text-green-500">
                  {Math.round(routing.savings.distance).toLocaleString()} miles
                </span>{' '}
                and{' '}
                <span className="font-bold text-green-500">
                  {routing.savings.drivingHours?.toFixed(1) || 0} hours
                </span>{' '}
                of driving.
              </p>
            </Card>
          )}

          {/* Route Legs */}
          {routing.current?.legs && routing.current.legs.length > 0 && (
            <Card className="p-6">
              <h3 className="mb-4 text-lg font-semibold">Route Details</h3>
              <div className="space-y-3">
                {routing.current.legs.map((leg: any, index: number) => (
                  <div
                    key={index}
                    className={`rounded-lg border p-4 ${
                      leg.drivingTime > 8
                        ? 'border-red-500/20 bg-red-500/5'
                        : leg.drivingTime > 5
                          ? 'border-yellow-500/20 bg-yellow-500/5'
                          : 'border-border'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">
                          {leg.from.city}, {leg.from.state} → {leg.to.city}, {leg.to.state}
                        </p>
                        <p className="text-muted-foreground text-sm">
                          {leg.from.venue} → {leg.to.venue}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{Math.round(leg.distance)} mi</p>
                        <p className="text-muted-foreground text-sm">
                          ~{Math.round(leg.drivingTime * 10) / 10} hrs
                        </p>
                      </div>
                    </div>
                    {leg.drivingTime > 8 && (
                      <p className="mt-2 text-sm text-red-500">
                        Long drive - consider a rest day or splitting the trip
                      </p>
                    )}
                    {leg.daysBetween === 1 && leg.drivingTime > 4 && (
                      <p className="mt-2 text-sm text-yellow-500">
                        Tight schedule - back-to-back shows with {Math.round(leg.drivingTime)} hr
                        drive
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Recommendations */}
          {routing.recommendations && routing.recommendations.length > 0 && (
            <Card className="p-6">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                <AlertCircle className="h-5 w-5 text-blue-500" />
                Routing Recommendations
              </h3>
              <div className="space-y-4">
                {routing.recommendations.map((rec: any, index: number) => (
                  <div
                    key={index}
                    className={`rounded-lg border p-4 ${
                      rec.priority === 'high'
                        ? 'border-red-500/20 bg-red-500/5'
                        : rec.priority === 'medium'
                          ? 'border-yellow-500/20 bg-yellow-500/5'
                          : 'border-blue-500/20 bg-blue-500/5'
                    }`}
                  >
                    <div className="mb-2 flex items-start justify-between">
                      <h4 className="font-semibold">{rec.title}</h4>
                      <span
                        className={`rounded px-2 py-0.5 text-xs font-medium ${
                          rec.priority === 'high'
                            ? 'bg-red-500/20 text-red-500'
                            : rec.priority === 'medium'
                              ? 'bg-yellow-500/20 text-yellow-500'
                              : 'bg-blue-500/20 text-blue-500'
                        }`}
                      >
                        {rec.priority}
                      </span>
                    </div>
                    <p className="text-muted-foreground text-sm">{rec.description}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </motion.div>
      )}

      {activeTab === 'routing' && !routing && (
        <Card className="p-8 text-center">
          <Navigation className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
          <p className="text-muted-foreground">
            Routing optimization requires venues with coordinates.
          </p>
          <p className="text-muted-foreground text-sm">
            Add venue addresses to enable smart routing.
          </p>
        </Card>
      )}
    </div>
  );
}

// Simple stat card
function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: any;
  label: string;
  value: string | number;
  color: string;
}) {
  const colorClasses = {
    green: 'text-green-500 bg-green-500/10',
    blue: 'text-blue-500 bg-blue-500/10',
    purple: 'text-purple-500 bg-purple-500/10',
    orange: 'text-orange-500 bg-orange-500/10',
  };

  return (
    <Card className="p-6">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-muted-foreground text-sm">{label}</p>
        <div className={`rounded-lg p-2 ${colorClasses[color as keyof typeof colorClasses]}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="text-2xl font-bold">{value}</p>
    </Card>
  );
}

// Show card with ticket link
function ShowCard({ show, isPast = false }: { show: any; isPast?: boolean }) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (date: string | null) => {
    if (!date) return null;
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <div
      className={`rounded-lg border p-4 transition ${
        isPast ? 'border-border/50 bg-muted/20' : 'border-border hover:border-brand-primary/30'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className={`font-semibold ${isPast ? 'text-muted-foreground' : ''}`}>{show.name}</p>
          <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-3 text-sm">
            <div className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(show.date)}
            </div>
            {show.venue && (
              <div className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {show.venue.name}, {show.venue.city}
              </div>
            )}
            {show.doorsTime && (
              <div className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                Doors: {formatTime(show.doorsTime)}
              </div>
            )}
            {show.attendance && isPast && (
              <div className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {show.attendance.toLocaleString()} attended
              </div>
            )}
          </div>
        </div>

        {/* Ticket Link */}
        {show.ticketUrl && !isPast && (
          <a
            href={show.ticketUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/20 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition"
          >
            <Ticket className="h-4 w-4" />
            Tickets
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>

      {/* Show times row */}
      {(show.loadInTime || show.soundcheckTime || show.setTime) && (
        <div className="border-border/50 text-muted-foreground mt-3 flex flex-wrap gap-4 border-t pt-3 text-xs">
          {show.loadInTime && <span>Load-in: {formatTime(show.loadInTime)}</span>}
          {show.soundcheckTime && <span>Soundcheck: {formatTime(show.soundcheckTime)}</span>}
          {show.setTime && <span>Set: {formatTime(show.setTime)}</span>}
          {show.setLength && <span>{show.setLength} min set</span>}
        </div>
      )}

      {/* Notes */}
      {show.notes && <p className="text-muted-foreground mt-2 text-sm italic">{show.notes}</p>}
    </div>
  );
}
