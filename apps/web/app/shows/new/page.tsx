'use client';

/**
 * CREATE NEW SHOW PAGE
 * 
 * Form to create a new show with venue, date, times, and setlist linking
 */

import { Button, Card } from '@cronkwaters/ui';
import { formatDateLong } from '@/lib/format-date';
import { Calendar, MapPin, Clock, Music, DollarSign, FileText, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

import { useRequireAuth } from '@/hooks/use-require-auth';
import { ToastNotification, useToast } from '@/components/toast-notification';

type Venue = {
  id: string;
  name: string;
  city?: string;
  state?: string;
};

type Tour = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
};

export default function NewShowPage() {
  const { user, loading } = useRequireAuth();
  const router = useRouter();
  const { toasts, removeToast, success, error } = useToast();

  const [venues, setVenues] = useState<Venue[]>([]);
  const [tours, setTours] = useState<Tour[]>([]);
  const [loadingVenues, setLoadingVenues] = useState(false);
  const [loadingTours, setLoadingTours] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    date: '',
    venueId: '',
    tourId: '',
    doors_time: '',
    soundcheck_time: '',
    show_time: '',
    capacity: '',
    expected_attendance: '',
    guarantee: '',
    notes: '',
    status: 'scheduled' as 'scheduled' | 'confirmed' | 'cancelled' | 'completed',
  });

  useEffect(() => {
    if (user) {
      loadVenues();
      loadTours();
    }
  }, [user]);

  const loadVenues = async () => {
    setLoadingVenues(true);
    try {
      const response = await fetch('/api/venues');
      if (response.ok) {
        const data = await response.json();
        setVenues(data);
      }
    } catch (err) {
      console.error('Error loading venues:', err);
    } finally {
      setLoadingVenues(false);
    }
  };

  const loadTours = async () => {
    setLoadingTours(true);
    try {
      const response = await fetch('/api/tours');
      if (response.ok) {
        const data = await response.json();
        // Only show active/planning tours
        const activeTours = data.filter(
          (tour: Tour) => !['completed', 'cancelled'].includes(tour.status)
        );
        setTours(activeTours);
      }
    } catch (err) {
      console.error('Error loading tours:', err);
    } finally {
      setLoadingTours(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        name: formData.name,
        date: formData.date,
        venueId: formData.venueId || undefined,
        tourId: formData.tourId || undefined,
        doors_time: formData.doors_time || undefined,
        soundcheck_time: formData.soundcheck_time || undefined,
        show_time: formData.show_time || undefined,
        capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
        expected_attendance: formData.expected_attendance
          ? parseInt(formData.expected_attendance)
          : undefined,
        guarantee: formData.guarantee ? parseFloat(formData.guarantee) : undefined,
        notes: formData.notes || undefined,
        status: formData.status,
      };

      const response = await fetch('/api/shows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const show = await response.json();
        success('Show created successfully!');
        router.push('/shows');
      } else {
        const data = await response.json();
        error(data.error || 'Failed to create show');
      }
    } catch (err) {
      error('Error creating show');
      console.error('Error creating show:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <Loader2 className="text-brand-primary h-12 w-12 animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen px-4 py-12">
      <div className="rnrb-container mx-auto max-w-3xl">
        {/* Toast Notifications */}
        {toasts.map((toast) => (
          <ToastNotification
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}

        {/* Header */}
        <div className="mb-8">
          <Link href="/shows">
            <Button variant="ghost" className="mb-4 flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Shows
            </Button>
          </Link>
          <h1 className="font-display mb-2 text-3xl font-bold sm:text-4xl">Schedule a Show</h1>
          <p className="text-muted-foreground text-base sm:text-lg">
            Add a new gig to your touring calendar
          </p>
        </div>

        {/* Form */}
        <Card className="rnrb-card p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Show Name */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Show Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Summer Festival 2025"
                className="rnrb-input w-full rounded-xl"
              />
            </div>

            {/* Date & Status */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="rnrb-input w-full rounded-xl pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as any,
                    })
                  }
                  className="rnrb-input w-full rounded-xl"
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>

            {/* Venue */}
            <div>
              <label className="mb-2 block text-sm font-medium">Venue</label>
              <div className="relative">
                <MapPin className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                <select
                  value={formData.venueId}
                  onChange={(e) => setFormData({ ...formData, venueId: e.target.value })}
                  className="rnrb-input w-full rounded-xl pl-10"
                  disabled={loadingVenues}
                >
                  <option value="">Select venue (optional)</option>
                  {venues.map((venue) => (
                    <option key={venue.id} value={venue.id}>
                      {venue.name}
                      {venue.city && ` - ${venue.city}`}
                      {venue.state && `, ${venue.state}`}
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-muted-foreground mt-1 text-xs">
                Don't see your venue?{' '}
                <Link href="/venues" className="text-brand-primary hover:underline">
                  Add a new venue
                </Link>
              </p>
            </div>

            {/* Tour */}
            <div>
              <label className="mb-2 block text-sm font-medium">Tour (Optional)</label>
              <select
                value={formData.tourId}
                onChange={(e) => setFormData({ ...formData, tourId: e.target.value })}
                className="rnrb-input w-full rounded-xl"
                disabled={loadingTours}
              >
                <option value="">Not part of a tour</option>
                {tours.map((tour) => (
                  <option key={tour.id} value={tour.id}>
                    {tour.name} ({formatDateLong(tour.startDate)} -{' '}
                    {formatDateLong(tour.endDate)})
                  </option>
                ))}
              </select>
              <p className="text-muted-foreground mt-1 text-xs">
                Link this show to a multi-show tour for better organization
              </p>
            </div>

            {/* Times */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm font-medium">Doors Time</label>
                <div className="relative">
                  <Clock className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                  <input
                    type="time"
                    value={formData.doors_time}
                    onChange={(e) => setFormData({ ...formData, doors_time: e.target.value })}
                    className="rnrb-input w-full rounded-xl pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Soundcheck</label>
                <div className="relative">
                  <Clock className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                  <input
                    type="time"
                    value={formData.soundcheck_time}
                    onChange={(e) => setFormData({ ...formData, soundcheck_time: e.target.value })}
                    className="rnrb-input w-full rounded-xl pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Show Time</label>
                <div className="relative">
                  <Clock className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                  <input
                    type="time"
                    value={formData.show_time}
                    onChange={(e) => setFormData({ ...formData, show_time: e.target.value })}
                    className="rnrb-input w-full rounded-xl pl-10"
                  />
                </div>
              </div>
            </div>

            {/* Capacity & Attendance */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">Venue Capacity</label>
                <input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  placeholder="e.g., 500"
                  className="rnrb-input w-full rounded-xl"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Expected Attendance</label>
                <input
                  type="number"
                  value={formData.expected_attendance}
                  onChange={(e) =>
                    setFormData({ ...formData, expected_attendance: e.target.value })
                  }
                  placeholder="e.g., 300"
                  className="rnrb-input w-full rounded-xl"
                />
              </div>
            </div>

            {/* Guarantee */}
            <div>
              <label className="mb-2 block text-sm font-medium">Guarantee</label>
              <div className="relative">
                <DollarSign className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                <input
                  type="number"
                  step="0.01"
                  value={formData.guarantee}
                  onChange={(e) => setFormData({ ...formData, guarantee: e.target.value })}
                  placeholder="e.g., 500.00"
                  className="rnrb-input w-full rounded-xl pl-10"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="mb-2 block text-sm font-medium">Notes</label>
              <div className="relative">
                <FileText className="text-muted-foreground absolute left-3 top-3 h-4 w-4" />
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Load-in details, parking info, contact notes..."
                  rows={4}
                  className="rnrb-input w-full rounded-xl pl-10"
                />
              </div>
            </div>

            {/* Submit */}
            <div className="flex items-center justify-end gap-3 pt-4">
              <Link href="/shows">
                <Button type="button" variant="outline" className="rounded-xl">
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={submitting}
                className="rnrb-button-primary rounded-xl px-8 py-3 font-semibold"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Show'
                )}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}

