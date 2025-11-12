'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import { Calendar, MapPin, Users, ExternalLink } from 'lucide-react';
import { Card } from '@cronkwater/ui';
import { Badge } from '@cronkwater/ui';
import type { Tour } from '@prisma/client';

interface TourCardProps {
  tour: Tour & { _count: { shows: number } };
}

export function TourCard({ tour }: TourCardProps) {
  const statusColors = {
    planning: 'warning',
    announced: 'info',
    ongoing: 'success',
    completed: 'subtle',
    cancelled: 'danger',
  } as const;

  return (
    <Link href={`/tours/${tour.slug}`}>
      <Card className="group relative overflow-hidden transition-all hover:shadow-xl">
        {tour.posterImage && (
          <div className="aspect-[3/4] overflow-hidden rounded-t-lg">
            <img
              src={tour.posterImage}
              alt={tour.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        )}
        
        <div className="p-6">
          <div className="mb-4 flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-xl font-bold tracking-tight">
                {tour.name}
              </h3>
              <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>
                  {format(new Date(tour.startDate), 'MMM d, yyyy')}
                  {tour.endDate && ` - ${format(new Date(tour.endDate), 'MMM d, yyyy')}`}
                </span>
              </div>
            </div>
            <Badge variant={statusColors[tour.status]}>
              {tour.status}
            </Badge>
          </div>

          {tour.description && (
            <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
              {tour.description}
            </p>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {tour._count.shows} shows
              </span>
              {tour.public && (
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  Public
                </span>
              )}
            </div>
            <ExternalLink className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />
          </div>
        </div>
      </Card>
    </Link>
  );
}


