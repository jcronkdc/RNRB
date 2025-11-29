'use client';

/**
 * VENUES MANAGEMENT PAGE
 *
 * List all venues with CRUD operations
 * Venue database for quick selection when creating shows
 */

import { Button, Card } from '@cronkwaters/ui';
import { motion } from 'framer-motion';
import {
  MapPin,
  Plus,
  Edit,
  Trash2,
  Phone,
  Mail,
  ExternalLink,
  Users,
  Search,
  Loader2,
  Building2,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { ToastNotification, useToast } from '@/components/toast-notification';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { formatNumber } from '@/lib/format-date';

type Venue = {
  id: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  capacity?: number;
  phone?: string;
  email?: string;
  website?: string;
  notes?: string;
  _count?: {
    shows: number;
  };
};

export default function VenuesPage() {
  const { user, loading } = useRequireAuth();
  const router = useRouter();
  const { toasts, removeToast, success, error } = useToast();

  const [venues, setVenues] = useState<Venue[]>([]);
  const [loadingVenues, setLoadingVenues] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    if (user) {
      loadVenues();
    }
  }, [user]);

  const loadVenues = async () => {
    setLoadingVenues(true);
    try {
      const response = await fetch('/api/venues');
      if (response.ok) {
        const data = await response.json();
        setVenues(data);
      } else if (response.status === 401) {
        error('Please sign in to view venues');
      } else {
        error('Failed to load venues');
      }
    } catch (err) {
      error('Error loading venues');
      console.error('Error loading venues:', err);
    } finally {
      setLoadingVenues(false);
    }
  };

  const deleteVenue = async (venueId: string, venueName: string) => {
    if (!confirm(`Delete "${venueName}"? This cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/venues/${venueId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        success(`Deleted "${venueName}"`);
        loadVenues();
      } else {
        error('Failed to delete venue');
      }
    } catch (err) {
      error('Error deleting venue');
      console.error('Error deleting venue:', err);
    }
  };

  const filteredVenues = venues.filter((venue) =>
    [venue.name, venue.city, venue.state, venue.address]
      .filter(Boolean)
      .some((field) => field!.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading || loadingVenues) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-brand-primary" />
          <p className="text-lg text-muted-foreground">Loading venues...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-12">
      <div className="rnrb-container mx-auto max-w-7xl">
        {/* Toast Notifications */}
        <ToastNotification toasts={toasts} onRemove={removeToast} />

        {/* Header */}
        <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="font-display mb-2 text-3xl font-bold sm:text-4xl lg:text-5xl">Venues</h1>
            <p className="text-base text-muted-foreground sm:text-lg lg:text-xl">
              Your touring venue database
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/shows">
              <Button variant="outline" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Back to Shows
              </Button>
            </Link>
            <Button
              onClick={() => setShowAddForm(true)}
              className="rnrb-button-primary flex items-center gap-2 rounded-xl px-6 py-3 font-semibold"
            >
              <Plus className="h-5 w-5" />
              Add Venue
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground sm:left-4 sm:h-5 sm:w-5" />
            <input
              type="text"
              placeholder="Search venues by name, city, state..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rnrb-input w-full rounded-xl py-2.5 pl-10 pr-4 sm:py-3 sm:pl-12"
            />
          </div>
        </div>

        {/* Add Form Modal */}
        {showAddForm && (
          <AddVenueForm
            onClose={() => setShowAddForm(false)}
            onSuccess={() => {
              setShowAddForm(false);
              loadVenues();
            }}
          />
        )}

        {/* Empty State */}
        {venues.length === 0 ? (
          <Card className="rnrb-card p-12 text-center sm:p-16">
            <MapPin className="mx-auto mb-6 h-20 w-20 text-muted-foreground/50 sm:h-24 sm:w-24" />
            <h2 className="font-display mb-4 text-2xl font-bold sm:text-3xl">
              No Venues in Database
            </h2>
            <p className="mx-auto mb-6 max-w-2xl text-base text-muted-foreground sm:text-lg">
              Build your touring venue database. Save venue details for quick access when scheduling
              shows.
            </p>
            <Button
              onClick={() => setShowAddForm(true)}
              className="rnrb-button-primary inline-flex items-center gap-3 rounded-xl px-8 py-4 text-lg font-semibold"
            >
              <Plus className="h-6 w-6" />
              Add Your First Venue
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {filteredVenues.map((venue) => (
              <VenueCard key={venue.id} venue={venue} onDelete={deleteVenue} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function VenueCard({
  venue,
  onDelete,
}: {
  venue: Venue;
  onDelete: (id: string, name: string) => void;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="rnrb-card group p-4 transition hover:border-brand-primary/30 sm:p-6">
        {/* Header */}
        <div className="mb-4 flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <h3 className="mb-1 truncate text-lg font-semibold sm:text-xl">{venue.name}</h3>
            {(venue.city || venue.state) && (
              <p className="truncate text-sm text-muted-foreground">
                {venue.city}
                {venue.city && venue.state && ', '}
                {venue.state}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="opacity-0 transition group-hover:opacity-100"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(venue.id, venue.name)}
              className="opacity-0 transition hover:text-red-500 group-hover:opacity-100"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-2">
          {venue.address && (
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
              <span className="break-words">{venue.address}</span>
            </div>
          )}

          {venue.capacity && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4 shrink-0" />
              <span>Capacity: {formatNumber(venue.capacity)}</span>
            </div>
          )}

          {venue.phone && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-4 w-4 shrink-0" />
              <a href={`tel:${venue.phone}`} className="hover:text-brand-primary">
                {venue.phone}
              </a>
            </div>
          )}

          {venue.email && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4 shrink-0" />
              <a href={`mailto:${venue.email}`} className="truncate hover:text-brand-primary">
                {venue.email}
              </a>
            </div>
          )}

          {venue.website && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ExternalLink className="h-4 w-4 shrink-0" />
              <a
                href={venue.website}
                target="_blank"
                rel="noopener noreferrer"
                className="truncate hover:text-brand-primary"
              >
                Website
              </a>
            </div>
          )}
        </div>

        {/* Show Count */}
        {venue._count && venue._count.shows > 0 && (
          <div className="mt-4 border-t border-border pt-3">
            <p className="text-xs text-muted-foreground">
              {venue._count.shows} {venue._count.shows === 1 ? 'show' : 'shows'} at this venue
            </p>
          </div>
        )}
      </Card>
    </motion.div>
  );
}

function AddVenueForm({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const { success, error } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: 'USA',
    capacity: '',
    phone: '',
    email: '',
    website: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        name: formData.name,
        address: formData.address || undefined,
        city: formData.city || undefined,
        state: formData.state || undefined,
        zip: formData.zip || undefined,
        country: formData.country || undefined,
        capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
        phone: formData.phone || undefined,
        email: formData.email || undefined,
        website: formData.website || undefined,
        notes: formData.notes || undefined,
      };

      const response = await fetch('/api/venues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        success('Venue added successfully!');
        onSuccess();
      } else {
        const data = await response.json();
        error(data.error || 'Failed to add venue');
      }
    } catch (err) {
      error('Error adding venue');
      console.error('Error adding venue:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto"
      >
        <Card className="rnrb-card p-6 sm:p-8">
          <h2 className="font-display mb-6 text-2xl font-bold">Add Venue</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Venue Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., The Fillmore"
                className="rnrb-input w-full rounded-xl"
              />
            </div>

            {/* Address */}
            <div>
              <label className="mb-1.5 block text-sm font-medium">Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="123 Main St"
                className="rnrb-input w-full rounded-xl"
              />
            </div>

            {/* City, State, Zip */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="col-span-2 sm:col-span-1">
                <label className="mb-1.5 block text-sm font-medium">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="San Francisco"
                  className="rnrb-input w-full rounded-xl"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">State</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  placeholder="CA"
                  className="rnrb-input w-full rounded-xl"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Zip</label>
                <input
                  type="text"
                  value={formData.zip}
                  onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                  placeholder="94102"
                  className="rnrb-input w-full rounded-xl"
                />
              </div>
            </div>

            {/* Capacity */}
            <div>
              <label className="mb-1.5 block text-sm font-medium">Capacity</label>
              <input
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                placeholder="e.g., 500"
                className="rnrb-input w-full rounded-xl"
              />
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(555) 123-4567"
                  className="rnrb-input w-full rounded-xl"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="booking@venue.com"
                  className="rnrb-input w-full rounded-xl"
                />
              </div>
            </div>

            {/* Website */}
            <div>
              <label className="mb-1.5 block text-sm font-medium">Website</label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://venue.com"
                className="rnrb-input w-full rounded-xl"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="mb-1.5 block text-sm font-medium">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Load-in info, parking details, etc..."
                rows={3}
                className="rnrb-input w-full rounded-xl"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="rounded-xl">
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="rnrb-button-primary rounded-xl px-8 py-3 font-semibold"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add Venue'
                )}
              </Button>
            </div>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
