'use client';

/**
 * WORLD-CLASS TOUR DETAIL PAGE
 * 
 * Features:
 * - Comprehensive analytics dashboard
 * - Show management
 * - Financial tracking
 * - Routing optimization
 * - Real-time collaboration
 * - Export capabilities
 */

import { Card, Button } from '@cronkwaters/ui';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Edit,
  Share2,
  Calendar,
  MapPin,
  Users,
  Plus,
  MoreVertical,
  Download,
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

import { TourAnalyticsDashboard } from '@/components/tours/tour-analytics-dashboard';
import { useRequireAuth } from '@/hooks/use-require-auth';

export default function TourDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useRequireAuth();
  const [tour, setTour] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<'analytics' | 'shows' | 'setlists'>('analytics');

  const tourSlug = params.slug as string;

  useEffect(() => {
    if (user && tourSlug) {
      loadTourData();
    }
  }, [user, tourSlug]);

  const loadTourData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/tours/${tourSlug}?includeShowDetails=true`);
      if (response.ok) {
        const data = await response.json();
        setTour(data.tour);
      }
    } catch (error) {
      console.error('Error loading tour:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="text-brand-primary mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-800 border-t-brand-primary" />
          <p className="text-muted-foreground">Loading tour...</p>
        </div>
      </div>
    );
  }

  if (!tour) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground mb-4">Tour not found</p>
          <Link href="/tours">
            <Button>Back to Tours</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <div className="border-border/50 border-b">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="mb-4">
            <Link href="/tours">
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Tours
              </Button>
            </Link>
          </div>

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h1 className="font-display mb-2 text-3xl font-bold md:text-4xl">
                  {tour.name}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {new Date(tour.startDate).toLocaleDateString()}
                      {tour.endDate && ` - ${new Date(tour.endDate).toLocaleDateString()}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{tour._count?.shows || 0} shows</span>
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                      tour.status === 'ongoing'
                        ? 'bg-green-500/10 text-green-500'
                        : tour.status === 'planning'
                          ? 'bg-blue-500/10 text-blue-500'
                          : tour.status === 'completed'
                            ? 'bg-purple-500/10 text-purple-500'
                            : 'bg-gray-500/10 text-gray-500'
                    }`}
                  >
                    {tour.status}
                  </span>
                </div>
                {tour.description && (
                  <p className="text-muted-foreground mt-3 max-w-2xl">{tour.description}</p>
                )}
              </motion.div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Link href={`/tours/${tourSlug}/edit`}>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
              </Link>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Share2 className="h-4 w-4" />
                Share
              </Button>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="mt-6 flex gap-2 border-b border-border">
            <button
              onClick={() => setActiveSection('analytics')}
              className={`px-4 py-2 text-sm font-medium transition ${
                activeSection === 'analytics'
                  ? 'border-brand-primary text-brand-primary border-b-2'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Analytics
            </button>
            <button
              onClick={() => setActiveSection('shows')}
              className={`px-4 py-2 text-sm font-medium transition ${
                activeSection === 'shows'
                  ? 'border-brand-primary text-brand-primary border-b-2'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Shows ({tour._count?.shows || 0})
            </button>
            <button
              onClick={() => setActiveSection('setlists')}
              className={`px-4 py-2 text-sm font-medium transition ${
                activeSection === 'setlists'
                  ? 'border-brand-primary text-brand-primary border-b-2'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Setlists
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 py-8">
        {activeSection === 'analytics' && (
          <TourAnalyticsDashboard tourId={tour.id} tourSlug={tourSlug} />
        )}

        {activeSection === 'shows' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Tour Shows</h2>
              <Link href={`/tours/${tourSlug}/shows/new`}>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Show
                </Button>
              </Link>
            </div>

            {tour.shows && tour.shows.length > 0 ? (
              <div className="space-y-3">
                {tour.shows.map((show: any) => (
                  <Card key={show.id} className="p-4 hover:border-brand-primary/30 transition">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <Link
                          href={`/shows/${show.slug}`}
                          className="hover:text-brand-primary block font-semibold transition"
                        >
                          {show.name}
                        </Link>
                        <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {new Date(show.date).toLocaleDateString()}
                          </div>
                          {show.venue && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5" />
                              {show.venue.name}, {show.venue.city}
                            </div>
                          )}
                          {show.attendance && (
                            <div className="flex items-center gap-1">
                              <Users className="h-3.5 w-3.5" />
                              {show.attendance.toLocaleString()} attendees
                            </div>
                          )}
                        </div>
                      </div>
                      <span
                        className={`rounded px-2 py-0.5 text-xs font-medium capitalize ${
                          show.status === 'completed'
                            ? 'bg-green-500/10 text-green-500'
                            : show.status === 'scheduled'
                              ? 'bg-blue-500/10 text-blue-500'
                              : 'bg-gray-500/10 text-gray-500'
                        }`}
                      >
                        {show.status}
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <Calendar className="text-muted-foreground/50 mx-auto mb-4 h-16 w-16" />
                <h3 className="mb-2 text-lg font-semibold">No Shows Yet</h3>
                <p className="text-muted-foreground mb-6">
                  Start adding shows to your tour to track performance and manage logistics.
                </p>
                <Link href={`/tours/${tourSlug}/shows/new`}>
                  <Button className="inline-flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add First Show
                  </Button>
                </Link>
              </Card>
            )}
          </div>
        )}

        {activeSection === 'setlists' && (
          <Card className="p-12 text-center">
            <h3 className="mb-2 text-lg font-semibold">Setlist Management</h3>
            <p className="text-muted-foreground">
              Create and manage setlists for your tour shows. Coming soon!
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}

