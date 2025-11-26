'use client';

/**
 * MOBILE DAY-OF-SHOW VIEW
 * 
 * Optimized mobile interface for performers on show day
 * - Timeline view
 * - Quick access to setlist
 * - Venue details & directions
 * - Sound check/doors/show times
 * - Notes & contacts
 * - Weather info
 */

import { Button, Card } from '@cronkwaters/ui';
import { motion } from 'framer-motion';
import {
  Clock,
  MapPin,
  Music,
  Phone,
  Navigation,
  FileText,
  Users,
  DollarSign,
  CheckCircle,
  Circle,
  ExternalLink,
  Share2,
  Calendar,
} from 'lucide-react';
import Link from 'next/link';
import { useState, useMemo } from 'react';

import { formatTime, formatDateWithDay } from '@/lib/format-date';

interface DayOfShowViewProps {
  show: {
    id: string;
    name: string;
    date: string;
    soundcheckTime?: string;
    doorsTime?: string;
    venue?: {
      name: string;
      address?: string;
      city?: string;
      state?: string;
      postalCode?: string;
      phone?: string;
      capacity?: number;
    };
    setlist?: {
      id: string;
      name?: string;
    };
    notes?: string;
    tour?: {
      name: string;
    };
    attendance?: number;
    grossRevenue?: number;
    ticketPrice?: unknown;
    guarantee?: number;
    ticketUrl?: string;
    [key: string]: unknown;
  };
  onComplete?: () => void;
}

export function DayOfShowView({ show, onComplete }: DayOfShowViewProps) {
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());

  const timeline = useMemo(() => {
    const events = [];

    if (show.soundcheckTime) {
      events.push({
        id: 'soundcheck',
        time: new Date(show.soundcheckTime),
        label: 'Sound Check',
        icon: Music,
        color: 'text-purple-500',
      });
    }

    if (show.doorsTime) {
      events.push({
        id: 'doors',
        time: new Date(show.doorsTime),
        label: 'Doors Open',
        icon: Users,
        color: 'text-blue-500',
      });
    }

    // Assume show starts 30 min after doors if no explicit time
    const showTime = show.doorsTime
      ? new Date(new Date(show.doorsTime).getTime() + 30 * 60 * 1000)
      : new Date(show.date);

    events.push({
      id: 'show',
      time: showTime,
      label: 'Show Time',
      icon: Music,
      color: 'text-brand-primary',
    });

    return events.sort((a, b) => a.time.getTime() - b.time.getTime());
  }, [show]);

  const checklist = [
    { id: 'load-in', label: 'Load-in completed' },
    { id: 'soundcheck', label: 'Sound check done' },
    { id: 'merch', label: 'Merch table set up' },
    { id: 'setlist', label: 'Setlist confirmed' },
    { id: 'hospitality', label: 'Check hospitality/green room' },
  ];

  const toggleTask = (taskId: string) => {
    const newCompleted = new Set(completedTasks);
    if (newCompleted.has(taskId)) {
      newCompleted.delete(taskId);
    } else {
      newCompleted.add(taskId);
    }
    setCompletedTasks(newCompleted);
  };

  const venueAddress = [
    show.venue?.address,
    show.venue?.city,
    show.venue?.state,
    show.venue?.postalCode,
  ]
    .filter(Boolean)
    .join(', ');

  const mapsUrl = venueAddress
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venueAddress)}`
    : null;

  return (
    <div className="mx-auto max-w-2xl space-y-4 p-4">
      {/* Header */}
      <Card className="rnrb-card p-6">
        <div className="text-brand-primary mb-2 text-sm font-medium uppercase tracking-wide">
          Today's Show
        </div>
        <h1 className="font-display mb-2 text-3xl font-bold">{show.name}</h1>
        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4" />
          <span>{formatDateWithDay(show.date)}</span>
        </div>
      </Card>

      {/* Timeline */}
      <Card className="rnrb-card p-6">
        <h2 className="mb-4 flex items-center gap-2 font-semibold">
          <Clock className="h-5 w-5" />
          Schedule
        </h2>

        <div className="space-y-4">
          {timeline.map((event, index) => (
            <TimelineEvent
              key={event.id}
              event={event}
              isLast={index === timeline.length - 1}
            />
          ))}
        </div>
      </Card>

      {/* Venue Info */}
      {show.venue && (
        <Card className="rnrb-card p-6">
          <h2 className="mb-4 flex items-center gap-2 font-semibold">
            <MapPin className="h-5 w-5" />
            Venue
          </h2>

          <div className="space-y-3">
            <div>
              <div className="text-lg font-semibold">{show.venue.name}</div>
              {venueAddress && (
                <div className="text-muted-foreground text-sm">{venueAddress}</div>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {mapsUrl && (
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1"
                >
                  <Button className="w-full" variant="outline">
                    <Navigation className="mr-2 h-4 w-4" />
                    Directions
                  </Button>
                </a>
              )}

              {show.venue.phone && (
                <a href={`tel:${show.venue.phone}`} className="flex-1">
                  <Button className="w-full" variant="outline">
                    <Phone className="mr-2 h-4 w-4" />
                    Call
                  </Button>
                </a>
              )}
            </div>

            {show.venue.capacity && (
              <div className="border-border border-t pt-3">
                <div className="text-muted-foreground flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4" />
                  <span>Capacity: {show.venue.capacity.toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Checklist */}
      <Card className="rnrb-card p-6">
        <h2 className="mb-4 flex items-center gap-2 font-semibold">
          <CheckCircle className="h-5 w-5" />
          Pre-Show Checklist
        </h2>

        <div className="space-y-2">
          {checklist.map((task) => (
            <motion.button
              key={task.id}
              onClick={() => toggleTask(task.id)}
              className="flex w-full items-center gap-3 rounded-lg p-3 text-left transition hover:bg-muted/30"
              whileTap={{ scale: 0.98 }}
            >
              {completedTasks.has(task.id) ? (
                <CheckCircle className="h-5 w-5 shrink-0 text-green-500" />
              ) : (
                <Circle className="text-muted-foreground h-5 w-5 shrink-0" />
              )}
              <span
                className={`${
                  completedTasks.has(task.id)
                    ? 'text-muted-foreground line-through'
                    : ''
                }`}
              >
                {task.label}
              </span>
            </motion.button>
          ))}
        </div>

        <div className="mt-4 text-center text-sm text-muted-foreground">
          {completedTasks.size} of {checklist.length} completed
        </div>
      </Card>

      {/* Setlist */}
      {show.setlist && (
        <Card className="rnrb-card p-6">
          <h2 className="mb-4 flex items-center gap-2 font-semibold">
            <Music className="h-5 w-5" />
            Setlist
          </h2>

          <Link href={`/setlists/${show.setlist.id}`}>
            <Button className="rnrb-button-primary w-full">
              View Full Setlist
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </Card>
      )}

      {/* Notes */}
      {show.notes && (
        <Card className="rnrb-card p-6">
          <h2 className="mb-4 flex items-center gap-2 font-semibold">
            <FileText className="h-5 w-5" />
            Notes
          </h2>

          <div className="bg-muted/30 whitespace-pre-wrap rounded-lg p-4 text-sm">
            {show.notes}
          </div>
        </Card>
      )}

      {/* Financial Info */}
      {(show.ticketPrice || show.guarantee) && (
        <Card className="rnrb-card p-6">
          <h2 className="mb-4 flex items-center gap-2 font-semibold">
            <DollarSign className="h-5 w-5" />
            Financial
          </h2>

          <div className="space-y-2">
            {show.guarantee && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">Guarantee</span>
                <span className="font-semibold">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                  }).format(Number(show.guarantee))}
                </span>
              </div>
            )}
            {show.ticketPrice && typeof show.ticketPrice === 'object' && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">Ticket Price</span>
                <span className="font-semibold">
                  {show.ticketPrice.min && show.ticketPrice.max
                    ? `$${show.ticketPrice.min} - $${show.ticketPrice.max}`
                    : `$${show.ticketPrice.min || show.ticketPrice.max || 0}`}
                </span>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Share Button */}
      <Card className="rnrb-card p-6">
        <Button
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: show.name,
                text: `${show.name} at ${show.venue?.name || 'TBA'}`,
                url: show.ticketUrl || window.location.href,
              });
            }
          }}
          variant="outline"
          className="w-full"
        >
          <Share2 className="mr-2 h-4 w-4" />
          Share Show
        </Button>
      </Card>

      {/* Complete Show Button */}
      {onComplete && (
        <Button onClick={onComplete} className="rnrb-button-primary w-full py-6 text-lg">
          <CheckCircle className="mr-2 h-5 w-5" />
          Mark Show Complete
        </Button>
      )}
    </div>
  );
}

function TimelineEvent({ event, isLast }: { event: {
  id: string;
  time: Date;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}; isLast: boolean }) {
  const Icon = event.icon;
  const now = new Date();
  const isPast = event.time < now;
  const isSoon = !isPast && event.time.getTime() - now.getTime() < 60 * 60 * 1000; // Within 1 hour

  return (
    <div className="flex items-start gap-4">
      <div className="relative flex flex-col items-center">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-full ${
            isPast
              ? 'bg-green-500/20 text-green-500'
              : isSoon
                ? 'bg-brand-primary/20 text-brand-primary animate-pulse'
                : 'bg-muted text-muted-foreground'
          }`}
        >
          <Icon className="h-5 w-5" />
        </div>
        {!isLast && (
          <div
            className={`h-full w-0.5 ${isPast ? 'bg-green-500/30' : 'bg-border'} mt-2 min-h-[40px]`}
          />
        )}
      </div>

      <div className="flex-1 pb-4">
        <div className="flex items-baseline gap-2">
          <span className="font-semibold">{event.label}</span>
          {isSoon && (
            <span className="text-brand-primary text-xs font-medium uppercase">Soon</span>
          )}
        </div>
        <div className="text-muted-foreground text-sm">{formatTime(event.time.toISOString())}</div>
      </div>
    </div>
  );
}

