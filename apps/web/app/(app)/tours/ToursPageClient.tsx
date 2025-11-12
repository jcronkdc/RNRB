'use client';

import { useState } from 'react';
import { Plus, Calendar } from 'lucide-react';
import { Button } from '@cronkwaters/ui';
import { PageHeader } from '@/components/app/PageHeader';
import { EmptyState } from '@/components/app/EmptyState';
import { TourCard } from './TourCard';
import { NewTourDialog } from './NewTourDialog';
import type { Tour } from '@prisma/client';

interface ToursPageClientProps {
  initialTours: (Tour & { _count: { shows: number } })[];
}

export function ToursPageClient({ initialTours }: ToursPageClientProps) {
  const [tours, setTours] = useState(initialTours);
  const [showNewTourDialog, setShowNewTourDialog] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);

  const activeTours = tours.filter(t => t.status !== 'completed');
  const completedTours = tours.filter(t => t.status === 'completed');
  const displayedTours = showCompleted ? tours : activeTours;

  const handleTourCreated = (newTour: Tour & { _count: { shows: number } }) => {
    setTours([newTour, ...tours]);
    setShowNewTourDialog(false);
  };

  return (
    <>
      <PageHeader
        title="Tours & Shows"
        description="Manage your tour dates, venues, and setlists"
        actions={
          <Button onClick={() => setShowNewTourDialog(true)}>
            <Plus className="h-4 w-4" />
            New Tour
          </Button>
        }
      />

      <div className="space-y-6">
        {/* Filters */}
        <div className="flex items-center gap-4">
          <Button
            variant={showCompleted ? 'outline' : 'subtle'}
            size="sm"
            onClick={() => setShowCompleted(false)}
          >
            Active Tours ({activeTours.length})
          </Button>
          {completedTours.length > 0 && (
            <Button
              variant={showCompleted ? 'subtle' : 'outline'}
              size="sm"
              onClick={() => setShowCompleted(true)}
            >
              Completed ({completedTours.length})
            </Button>
          )}
        </div>

        {/* Tours Grid */}
        {displayedTours.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title={showCompleted ? "No Completed Tours" : "Plan Your First Tour"}
            description={showCompleted 
              ? "Tours you've completed will appear here" 
              : "Organize your shows, manage venues, and track your tour schedule"
            }
            action={!showCompleted && (
              <Button onClick={() => setShowNewTourDialog(true)}>
                <Plus className="h-4 w-4" />
                Create Tour
              </Button>
            )}
          />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {displayedTours.map((tour) => (
              <TourCard key={tour.id} tour={tour} />
            ))}
          </div>
        )}
      </div>

      <NewTourDialog 
        open={showNewTourDialog}
        onOpenChange={setShowNewTourDialog}
        onTourCreated={handleTourCreated}
      />
    </>
  );
}

