'use client';

import { Button } from '@cronkwaters/ui';
import { Input } from '@cronkwaters/ui';
import { Label } from '@cronkwaters/ui';
import { Textarea } from '@cronkwaters/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@cronkwaters/ui';
import { Calendar as CalendarIcon, MapPin, Clock, Users, Music } from 'lucide-react';
import Link from 'next/link';
import { useState, useCallback, useMemo, memo } from 'react';

// Memoized tips card component
const ProTipsCard = memo(() => (
  <div className="mt-6 rnrb-card p-6 bg-brand-primary/5 border-brand-primary/20">
    <h3 className="font-semibold mb-2">💡 Pro Tips</h3>
    <ul className="text-sm text-muted-foreground space-y-1">
      <li>• Add shows early to help with planning and promotion</li>
      <li>• Include load-in times and technical requirements in notes</li>
      <li>• Share ticket links with your fanbase via social media</li>
      <li>• Track attendance to understand your growing audience</li>
    </ul>
  </div>
));
ProTipsCard.displayName = 'ProTipsCard';

export default function ScheduleShowPage() {
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    
    // TODO: Implement actual scheduling logic
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setSubmitting(false);
    // Redirect to dashboard or shows page
  }, []);

  // Memoize button disabled state
  const isSubmitDisabled = useMemo(() => submitting, [submitting]);

  return (
    <div className="container mx-auto max-w-3xl py-8 px-6">
      <div className="mb-8">
        <Link 
          href="/dashboard" 
          className="text-sm text-muted-foreground hover:text-brand-foreground inline-flex items-center gap-2 mb-4"
        >
          ← Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-brand-foreground mb-2">Schedule Show</h1>
        <p className="text-muted-foreground">
          Add a new performance or event to your calendar
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Event Details */}
        <div className="rnrb-card p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="event-name">Event Name *</Label>
            <Input
              id="event-name"
              name="eventName"
              placeholder="Summer Music Festival"
              required
              disabled={submitting}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="event-date">Date *</Label>
              <div className="relative">
                <Input
                  id="event-date"
                  name="eventDate"
                  type="date"
                  required
                  disabled={submitting}
                />
                <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="event-time">Time *</Label>
              <div className="relative">
                <Input
                  id="event-time"
                  name="eventTime"
                  type="time"
                  required
                  disabled={submitting}
                />
                <Clock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="venue">Venue *</Label>
            <div className="relative">
              <Input
                id="venue"
                name="venue"
                placeholder="The Basement Rock Club"
                required
                disabled={submitting}
                className="pl-10"
              />
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              name="address"
              placeholder="123 Music St, Rock City, RC 12345"
              disabled={submitting}
            />
          </div>
        </div>

        {/* Performance Details */}
        <div className="rnrb-card p-6 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Music className="w-5 h-5" />
            Performance Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="set-duration">Set Duration (minutes)</Label>
              <Input
                id="set-duration"
                name="setDuration"
                type="number"
                placeholder="60"
                min="1"
                max="300"
                disabled={submitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="show-type">Show Type</Label>
              <Select name="showType" disabled={submitting}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="headline">Headline</SelectItem>
                  <SelectItem value="support">Support Act</SelectItem>
                  <SelectItem value="festival">Festival</SelectItem>
                  <SelectItem value="private">Private Event</SelectItem>
                  <SelectItem value="livestream">Livestream</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="expected-attendance">Expected Attendance</Label>
            <div className="relative">
              <Input
                id="expected-attendance"
                name="expectedAttendance"
                type="number"
                placeholder="200"
                min="1"
                disabled={submitting}
                className="pl-10"
              />
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ticket-price">Ticket Price ($)</Label>
            <Input
              id="ticket-price"
              name="ticketPrice"
              type="number"
              step="0.01"
              placeholder="25.00"
              min="0"
              disabled={submitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ticket-link">Ticket Link</Label>
            <Input
              id="ticket-link"
              name="ticketLink"
              type="url"
              placeholder="https://tickets.example.com/event"
              disabled={submitting}
            />
          </div>
        </div>

        {/* Additional Info */}
        <div className="rnrb-card p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Load-in time, special requirements, contact info..."
              rows={4}
              disabled={submitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="promoter-contact">Promoter Contact</Label>
            <Input
              id="promoter-contact"
              name="promoterContact"
              placeholder="name@promoter.com"
              type="email"
              disabled={submitting}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            type="submit"
            className="flex-1"
            disabled={isSubmitDisabled}
          >
            {submitting ? 'Scheduling...' : 'Schedule Show'}
          </Button>
          <Link href="/dashboard" className="flex-1">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={submitting}
            >
              Cancel
            </Button>
          </Link>
        </div>
      </form>

      <ProTipsCard />
    </div>
  );
}

