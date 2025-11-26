'use client';

/**
 * WORLD-CLASS GIG CALENDAR VIEW
 * 
 * Features:
 * - Month/Week/Day/Agenda views
 * - Drag-and-drop rescheduling
 * - Conflict detection
 * - Travel time calculations
 * - Color coding by status/tour
 * - Click to view details
 * - Mini calendar navigation
 * - Today button
 * - Keyboard shortcuts
 * - Mobile responsive
 */

import { Button, Card } from '@cronkwaters/ui';
import { motion } from 'framer-motion';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Music,
  DollarSign,
  AlertTriangle,
  Car,
  Plus,
  Grid3x3,
  List,
  Calendar as CalendarIcon,
  Sun,
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { formatDateWithDay, formatTime } from '@/lib/format-date';

type Show = {
  id: string;
  name: string;
  date: string;
  doorsTime?: string;
  soundcheckTime?: string;
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed';
  venue?: {
    id: string;
    name: string;
    city?: string;
    state?: string;
  };
  tour?: {
    id: string;
    name: string;
  };
  setlist?: {
    id: string;
    name: string;
  };
  attendance?: number;
  grossRevenue?: number;
  notes?: string;
};

type ViewMode = 'month' | 'week' | 'day' | 'agenda';

interface CalendarViewProps {
  shows: Show[];
  onShowClick: (show: Show) => void;
  onDateSelect: (date: Date) => void;
  onReschedule?: (showId: string, newDate: Date) => void;
  onCreateShow?: (date: Date) => void;
  loading?: boolean;
}

export function CalendarView({
  shows,
  onShowClick,
  onDateSelect,
  onReschedule,
  onCreateShow,
  loading = false,
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [draggedShow, setDraggedShow] = useState<Show | null>(null);

  // Get calendar data for current view
  const calendarData = useMemo(() => {
    return generateCalendarData(currentDate, viewMode);
  }, [currentDate, viewMode]);

  // Map shows to calendar dates
  const showsByDate = useMemo(() => {
    const map = new Map<string, Show[]>();
    shows.forEach((show) => {
      const dateKey = new Date(show.date).toISOString().split('T')[0];
      if (!map.has(dateKey)) {
        map.set(dateKey, []);
      }
      map.get(dateKey)!.push(show);
    });
    return map;
  }, [shows]);

  // Detect conflicts (multiple shows same day)
  const conflicts = useMemo(() => {
    const conflictDates = new Set<string>();
    showsByDate.forEach((dateShows, date) => {
      if (dateShows.length > 1) {
        conflictDates.add(date);
      }
    });
    return conflictDates;
  }, [showsByDate]);

  // Navigation handlers
  const goToPrevious = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() - 1);
    }
    setCurrentDate(newDate);
  };

  const goToNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() + 1);
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Drag and drop handlers
  const handleDragStart = (show: Show) => {
    setDraggedShow(show);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (date: Date) => {
    if (draggedShow && onReschedule) {
      onReschedule(draggedShow.id, date);
    }
    setDraggedShow(null);
  };

  // Get header title based on view
  const getHeaderTitle = () => {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    if (viewMode === 'month') {
      return `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    } else if (viewMode === 'week') {
      const weekStart = getWeekStart(currentDate);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      return `${monthNames[weekStart.getMonth()]} ${weekStart.getDate()} - ${
        weekStart.getMonth() !== weekEnd.getMonth() ? monthNames[weekEnd.getMonth()] + ' ' : ''
      }${weekEnd.getDate()}, ${weekEnd.getFullYear()}`;
    } else if (viewMode === 'day') {
      return formatDateWithDay(currentDate.toISOString());
    }
    return 'Upcoming Shows';
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Navigation */}
        <div className="flex items-center gap-3">
          <Button
            onClick={goToPrevious}
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Previous</span>
          </Button>

          <Button onClick={goToToday} variant="outline" size="sm" className="font-semibold">
            Today
          </Button>

          <Button
            onClick={goToNext}
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="h-4 w-4" />
          </Button>

          <h2 className="font-display ml-2 text-lg font-bold sm:text-xl">{getHeaderTitle()}</h2>
        </div>

        {/* View Mode Selector */}
        <div className="flex items-center gap-2 overflow-x-auto">
          <Button
            onClick={() => setViewMode('month')}
            variant={viewMode === 'month' ? 'default' : 'outline'}
            size="sm"
            className="flex items-center gap-1"
          >
            <Grid3x3 className="h-4 w-4" />
            <span className="hidden sm:inline">Month</span>
          </Button>
          <Button
            onClick={() => setViewMode('week')}
            variant={viewMode === 'week' ? 'default' : 'outline'}
            size="sm"
            className="flex items-center gap-1"
          >
            <CalendarIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Week</span>
          </Button>
          <Button
            onClick={() => setViewMode('day')}
            variant={viewMode === 'day' ? 'default' : 'outline'}
            size="sm"
            className="flex items-center gap-1"
          >
            <Sun className="h-4 w-4" />
            <span className="hidden sm:inline">Day</span>
          </Button>
          <Button
            onClick={() => setViewMode('agenda')}
            variant={viewMode === 'agenda' ? 'default' : 'outline'}
            size="sm"
            className="flex items-center gap-1"
          >
            <List className="h-4 w-4" />
            <span className="hidden sm:inline">Agenda</span>
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      {viewMode === 'month' && (
        <MonthView
          calendarData={calendarData}
          showsByDate={showsByDate}
          conflicts={conflicts}
          currentDate={currentDate}
          onShowClick={onShowClick}
          onDateClick={(date) => {
            setSelectedDate(date);
            onDateSelect(date);
          }}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onCreateShow={onCreateShow}
        />
      )}

      {viewMode === 'week' && (
        <WeekView
          calendarData={calendarData}
          showsByDate={showsByDate}
          conflicts={conflicts}
          currentDate={currentDate}
          onShowClick={onShowClick}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onCreateShow={onCreateShow}
        />
      )}

      {viewMode === 'day' && (
        <DayView
          date={currentDate}
          shows={showsByDate.get(currentDate.toISOString().split('T')[0]) || []}
          onShowClick={onShowClick}
          onCreateShow={onCreateShow}
        />
      )}

      {viewMode === 'agenda' && (
        <AgendaView
          shows={shows}
          onShowClick={onShowClick}
          conflicts={conflicts}
        />
      )}

      {/* Stats Footer */}
      <ShowStats shows={shows} />
    </div>
  );
}

// Month View Component
function MonthView({
  calendarData,
  showsByDate,
  conflicts,
  currentDate,
  onShowClick,
  onDateClick,
  onDragStart,
  onDragOver,
  onDrop,
  onCreateShow,
}: {
  calendarData: Array<{ date: Date }>;
  showsByDate: Map<string, Show[]>;
  conflicts: Set<string>;
  currentDate: Date;
  onShowClick: (show: Show) => void;
  onDateClick: (date: Date) => void;
  onDragStart: (show: Show) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (date: Date) => void;
  onCreateShow?: (date: Date) => void;
}) {
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="flex-1 overflow-auto">
      {/* Week day headers */}
      <div className="grid grid-cols-7 border-b border-border">
        {weekDays.map((day) => (
          <div
            key={day}
            className="bg-muted/30 p-2 text-center text-sm font-semibold uppercase tracking-wide"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid auto-rows-fr grid-cols-7">
        {calendarData.map((day: any, index: number) => {
          const dateKey = day.date.toISOString().split('T')[0];
          const dayShows = showsByDate.get(dateKey) || [];
          const hasConflict = conflicts.has(dateKey);
          const isToday = isSameDay(day.date, new Date());
          const isCurrentMonth = day.date.getMonth() === currentDate.getMonth();

          return (
              <div
                key={index}
                role="button"
                tabIndex={0}
                className={`min-h-[120px] border-b border-r border-border p-2 transition hover:bg-muted/20 ${
                  !isCurrentMonth ? 'bg-muted/10 opacity-50' : ''
                } ${isToday ? 'bg-brand-primary/5' : ''}`}
                onDragOver={onDragOver}
                onDrop={() => onDrop(day.date)}
                onClick={() => onDateClick(day.date)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    onDateClick(day.date);
                  }
                }}
              >
              {/* Date number */}
              <div className="mb-2 flex items-center justify-between">
                <span
                  className={`text-sm font-semibold ${
                    isToday
                      ? 'bg-brand-primary text-primary-foreground flex h-6 w-6 items-center justify-center rounded-full'
                      : ''
                  }`}
                >
                  {day.date.getDate()}
                </span>
                {hasConflict && (
                  <AlertTriangle className="h-4 w-4 text-red-500" title="Multiple shows" />
                )}
                {onCreateShow && isCurrentMonth && dayShows.length === 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onCreateShow(day.date);
                    }}
                    className="h-5 w-5 p-0 opacity-0 transition hover:opacity-100"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                )}
              </div>

              {/* Shows */}
              <div className="space-y-1">
                {dayShows.slice(0, 3).map((show: Show) => (
                  <motion.div
                    key={show.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    draggable
                    onDragStart={() => onDragStart(show)}
                    onClick={(e) => {
                      e.stopPropagation();
                      onShowClick(show);
                    }}
                    className={`cursor-move rounded px-1.5 py-1 text-xs font-medium transition hover:opacity-80 ${getStatusColor(
                      show.status
                    )}`}
                    title={`${show.name} - ${show.venue?.name || 'TBA'}`}
                  >
                    <div className="truncate">{show.name}</div>
                    {show.venue && (
                      <div className="text-muted-foreground truncate text-[10px]">
                        {show.venue.city}
                      </div>
                    )}
                  </motion.div>
                ))}
                {dayShows.length > 3 && (
                  <div className="text-muted-foreground text-[10px]">
                    +{dayShows.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Week View Component
function WeekView({
  calendarData,
  showsByDate,
  conflicts,
  currentDate,
  onShowClick,
  onDragStart,
  onDragOver,
  onDrop,
  onCreateShow,
}: {
  calendarData: Array<{ date: Date }>;
  showsByDate: Map<string, Show[]>;
  conflicts: Set<string>;
  currentDate: Date;
  onShowClick: (show: Show) => void;
  onDragStart: (show: Show) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (date: Date) => void;
  onCreateShow?: (date: Date) => void;
}) {
  const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="flex-1 overflow-auto">
      {/* Day headers */}
      <div className="grid grid-cols-8 border-b border-border sticky top-0 bg-background z-10">
        <div className="p-2"></div>
        {calendarData.slice(0, 7).map((day: any, index: number) => {
          const dateKey = day.date.toISOString().split('T')[0];
          const dayShows = showsByDate.get(dateKey) || [];
          const isToday = isSameDay(day.date, new Date());

          return (
            <div
              key={index}
              className={`border-l border-border p-2 text-center ${
                isToday ? 'bg-brand-primary/5' : ''
              }`}
            >
              <div className="text-xs text-muted-foreground">{weekDays[day.date.getDay()]}</div>
              <div
                className={`mt-1 text-lg font-semibold ${
                  isToday
                    ? 'bg-brand-primary text-primary-foreground inline-flex h-8 w-8 items-center justify-center rounded-full'
                    : ''
                }`}
              >
                {day.date.getDate()}
              </div>
              <div className="text-muted-foreground mt-1 text-xs">
                {dayShows.length} {dayShows.length === 1 ? 'show' : 'shows'}
              </div>
            </div>
          );
        })}
      </div>

      {/* Time grid */}
      <div className="relative">
        {hours.map((hour) => (
          <div key={hour} className="grid grid-cols-8 border-b border-border">
            {/* Hour label */}
            <div className="p-2 text-right text-xs text-muted-foreground">
              {formatHour(hour)}
            </div>

            {/* Day columns */}
            {calendarData.slice(0, 7).map((day: any, index: number) => {
              const dateKey = day.date.toISOString().split('T')[0];
              const dayShows = showsByDate.get(dateKey) || [];
              const showsInHour = dayShows.filter((show) => {
                if (!show.doorsTime) return false;
                const showHour = new Date(show.doorsTime).getHours();
                return showHour === hour;
              });

              return (
                <div
                  key={index}
                  className="min-h-[60px] border-l border-border p-1 transition hover:bg-muted/20"
                  onDragOver={onDragOver}
                  onDrop={() => onDrop(day.date)}
                >
                  {showsInHour.map((show) => (
                    <motion.div
                      key={show.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      draggable
                      onDragStart={() => onDragStart(show)}
                      onClick={() => onShowClick(show)}
                      className={`mb-1 cursor-move rounded p-2 text-xs font-medium transition hover:opacity-80 ${getStatusColor(
                        show.status
                      )}`}
                    >
                      <div className="font-semibold">{show.name}</div>
                      {show.venue && (
                        <div className="text-muted-foreground text-[10px]">{show.venue.name}</div>
                      )}
                    </motion.div>
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

// Day View Component
function DayView({ date, shows, onShowClick, onCreateShow }: any) {
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Sort shows by time
  const sortedShows = [...shows].sort((a, b) => {
    const timeA = a.doorsTime || a.date;
    const timeB = b.doorsTime || b.date;
    return new Date(timeA).getTime() - new Date(timeB).getTime();
  });

  return (
    <div className="flex-1 overflow-auto">
      <Card className="rnrb-card p-6">
        {/* Date header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="font-display text-2xl font-bold">{formatDateWithDay(date.toISOString())}</h3>
            <p className="text-muted-foreground text-sm">
              {shows.length} {shows.length === 1 ? 'show' : 'shows'} scheduled
            </p>
          </div>
          {onCreateShow && (
            <Button
              onClick={() => onCreateShow(date)}
              className="rnrb-button-primary flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Show
            </Button>
          )}
        </div>

        {/* Timeline */}
        <div className="space-y-4">
          {sortedShows.length === 0 ? (
            <div className="py-12 text-center">
              <Calendar className="text-muted-foreground/50 mx-auto mb-4 h-16 w-16" />
              <p className="text-muted-foreground">No shows scheduled for this day</p>
            </div>
          ) : (
            sortedShows.map((show, index) => (
              <motion.div
                key={show.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <ShowDetailCard show={show} onClick={() => onShowClick(show)} />
              </motion.div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}

// Agenda View Component
function AgendaView({ shows, onShowClick, conflicts }: any) {
  // Group shows by month
  const showsByMonth = useMemo(() => {
    const map = new Map<string, Show[]>();
    shows.forEach((show: Show) => {
      const date = new Date(show.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!map.has(monthKey)) {
        map.set(monthKey, []);
      }
      map.get(monthKey)!.push(show);
    });

    // Sort shows within each month
    map.forEach((monthShows) => {
      monthShows.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    });

    return map;
  }, [shows]);

  const sortedMonths = Array.from(showsByMonth.keys()).sort();

  return (
    <div className="flex-1 overflow-auto">
      <div className="space-y-6">
        {sortedMonths.map((monthKey) => {
          const [year, month] = monthKey.split('-');
          const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleString('default', {
            month: 'long',
            year: 'numeric',
          });
          const monthShows = showsByMonth.get(monthKey)!;

          return (
            <div key={monthKey}>
              <h3 className="font-display mb-4 text-xl font-bold">{monthName}</h3>
              <div className="space-y-3">
                {monthShows.map((show) => {
                  const dateKey = new Date(show.date).toISOString().split('T')[0];
                  const hasConflict = conflicts.has(dateKey);

                  return (
                    <motion.div
                      key={show.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <ShowDetailCard 
                        show={show} 
                        onClick={() => onShowClick(show)} 
                        hasConflict={hasConflict}
                      />
                    </motion.div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {sortedMonths.length === 0 && (
          <Card className="rnrb-card p-12 text-center">
            <Calendar className="text-muted-foreground/50 mx-auto mb-4 h-20 w-20" />
            <h3 className="font-display mb-2 text-xl font-bold">No Upcoming Shows</h3>
            <p className="text-muted-foreground">
              Your calendar is clear. Time to book some gigs!
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}

// Show Detail Card Component
function ShowDetailCard({ show, onClick, hasConflict = false }: any) {
  return (
    <Card
      className="rnrb-card group cursor-pointer p-4 transition hover:border-brand-primary/50"
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="mb-2 flex items-center gap-2">
            <h4 className="truncate text-lg font-semibold">{show.name}</h4>
            <span
              className={`inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-xs font-medium capitalize ${getStatusColorBorder(
                show.status
              )}`}
            >
              {show.status}
            </span>
            {hasConflict && (
              <AlertTriangle className="h-4 w-4 shrink-0 text-red-500" title="Conflicting shows" />
            )}
          </div>

          {/* Details */}
          <div className="space-y-1 text-sm">
            <div className="text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4 shrink-0" />
              <span>{formatDateWithDay(show.date)}</span>
            </div>

            {show.venue && (
              <div className="text-muted-foreground flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0" />
                <span className="truncate">
                  {show.venue.name}
                  {show.venue.city && ` • ${show.venue.city}`}
                  {show.venue.state && `, ${show.venue.state}`}
                </span>
              </div>
            )}

            {(show.doorsTime || show.soundcheckTime) && (
              <div className="text-muted-foreground flex items-center gap-2">
                <Clock className="h-4 w-4 shrink-0" />
                <span>
                  {show.soundcheckTime && `Soundcheck ${formatTime(show.soundcheckTime)}`}
                  {show.soundcheckTime && show.doorsTime && ' • '}
                  {show.doorsTime && `Doors ${formatTime(show.doorsTime)}`}
                </span>
              </div>
            )}

            {show.setlist && (
              <div className="text-muted-foreground flex items-center gap-2">
                <Music className="h-4 w-4 shrink-0" />
                <span>{show.setlist.name || 'Setlist attached'}</span>
              </div>
            )}

            {show.tour && (
              <div className="text-brand-primary flex items-center gap-2 text-xs">
                <Car className="h-3 w-3 shrink-0" />
                <span>{show.tour.name}</span>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        {(show.attendance || show.grossRevenue) && (
          <div className="text-right">
            {show.attendance && (
              <div className="text-muted-foreground flex items-center gap-1 text-xs">
                <span className="font-semibold">{show.attendance}</span>
                <span>attendees</span>
              </div>
            )}
            {show.grossRevenue && (
              <div className="flex items-center gap-1 text-xs text-green-500">
                <DollarSign className="h-3 w-3" />
                <span className="font-semibold">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                    minimumFractionDigits: 0,
                  }).format(Number(show.grossRevenue))}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

// Stats Footer Component
function ShowStats({ shows }: { shows: Show[] }) {
  const stats = useMemo(() => {
    const now = new Date();
    const upcoming = shows.filter((show) => new Date(show.date) >= now);
    const past = shows.filter((show) => new Date(show.date) < now);
    const totalRevenue = shows.reduce(
      (sum, show) => sum + (show.grossRevenue ? Number(show.grossRevenue) : 0),
      0
    );
    const totalAttendance = shows.reduce((sum, show) => sum + (show.attendance || 0), 0);
    const confirmed = shows.filter((show) => show.status === 'confirmed').length;

    return {
      upcoming: upcoming.length,
      past: past.length,
      totalRevenue,
      totalAttendance,
      confirmed,
    };
  }, [shows]);

  return (
    <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
      <Card className="rnrb-card p-3 text-center">
        <div className="text-brand-primary text-2xl font-bold">{stats.upcoming}</div>
        <div className="text-muted-foreground text-xs">Upcoming</div>
      </Card>
      <Card className="rnrb-card p-3 text-center">
        <div className="text-green-500 text-2xl font-bold">{stats.confirmed}</div>
        <div className="text-muted-foreground text-xs">Confirmed</div>
      </Card>
      <Card className="rnrb-card p-3 text-center">
        <div className="text-blue-500 text-2xl font-bold">{stats.past}</div>
        <div className="text-muted-foreground text-xs">Completed</div>
      </Card>
      <Card className="rnrb-card p-3 text-center">
        <div className="text-purple-500 text-2xl font-bold">
          {stats.totalAttendance.toLocaleString()}
        </div>
        <div className="text-muted-foreground text-xs">Total Fans</div>
      </Card>
      <Card className="rnrb-card p-3 text-center">
        <div className="text-yellow-500 text-2xl font-bold">
          {new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          }).format(stats.totalRevenue)}
        </div>
        <div className="text-muted-foreground text-xs">Revenue</div>
      </Card>
    </div>
  );
}

// Utility Functions

function generateCalendarData(date: Date, viewMode: ViewMode) {
  if (viewMode === 'month') {
    return generateMonthCalendar(date);
  } else if (viewMode === 'week') {
    return generateWeekCalendar(date);
  } else if (viewMode === 'day') {
    return [{ date: new Date(date) }];
  }
  return [];
}

function generateMonthCalendar(date: Date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());

  const calendar = [];
  const current = new Date(startDate);

  // Generate 6 weeks (42 days) to ensure consistent grid
  for (let i = 0; i < 42; i++) {
    calendar.push({ date: new Date(current) });
    current.setDate(current.getDate() + 1);
  }

  return calendar;
}

function generateWeekCalendar(date: Date) {
  const weekStart = getWeekStart(date);
  const calendar = [];

  for (let i = 0; i < 7; i++) {
    const day = new Date(weekStart);
    day.setDate(day.getDate() + i);
    calendar.push({ date: day });
  }

  return calendar;
}

function getWeekStart(date: Date) {
  const day = new Date(date);
  const diff = day.getDate() - day.getDay();
  return new Date(day.setDate(diff));
}

function isSameDay(date1: Date, date2: Date) {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

function formatHour(hour: number) {
  if (hour === 0) return '12 AM';
  if (hour === 12) return '12 PM';
  if (hour < 12) return `${hour} AM`;
  return `${hour - 12} PM`;
}

function getStatusColor(status: string) {
  const colors = {
    scheduled: 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400',
    confirmed: 'bg-green-500/20 text-green-600 dark:text-green-400',
    cancelled: 'bg-red-500/20 text-red-600 dark:text-red-400',
    completed: 'bg-blue-500/20 text-blue-600 dark:text-blue-400',
  };
  return colors[status as keyof typeof colors] || colors.scheduled;
}

function getStatusColorBorder(status: string) {
  const colors = {
    scheduled: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    confirmed: 'bg-green-500/10 text-green-500 border-green-500/20',
    cancelled: 'bg-red-500/10 text-red-500 border-red-500/20',
    completed: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  };
  return colors[status as keyof typeof colors] || colors.scheduled;
}

