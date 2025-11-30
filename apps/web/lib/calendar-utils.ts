/**
 * ADVANCED CALENDAR UTILITIES
 *
 * - Conflict detection
 * - Travel time calculation
 * - Distance calculation
 * - Routing optimization
 * - Mileage tracking
 */

// Haversine distance calculation (in miles)
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959; // Earth's radius in miles
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

// Estimate travel time based on distance (average 60 mph)
export function estimateTravelTime(distanceMiles: number): number {
  // Average speed: 60 mph
  // Add buffer for stops, traffic, etc.
  const hours = (distanceMiles / 60) * 1.3; // 30% buffer
  return Math.ceil(hours * 60); // Return minutes
}

// Format travel time
export function formatTravelTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

// Detect conflicts between shows
export interface ShowConflict {
  type: 'same_day' | 'travel_time' | 'overlap';
  severity: 'warning' | 'error';
  message: string;
  shows: string[]; // Show IDs
  travelTime?: number; // Minutes
  distance?: number; // Miles
}

export function detectConflicts(
  shows: Array<{
    id: string;
    date: string;
    venue?: {
      latitude?: number;
      longitude?: number;
      name: string;
    };
    [key: string]: unknown;
  }>
): ShowConflict[] {
  const conflicts: ShowConflict[] = [];
  const sortedShows = [...shows].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  for (let i = 0; i < sortedShows.length - 1; i++) {
    const current = sortedShows[i];
    const next = sortedShows[i + 1];

    const currentDate = new Date(current.date);
    const nextDate = new Date(next.date);
    const hoursBetween = (nextDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60);

    // Same day conflict
    if (isSameDay(currentDate, nextDate)) {
      conflicts.push({
        type: 'same_day',
        severity: 'error',
        message: `Multiple shows on ${formatDate(currentDate)}`,
        shows: [current.id, next.id],
      });
      continue;
    }

    // Check if venues have coordinates for travel time calculation
    if (
      current.venue?.latitude &&
      current.venue?.longitude &&
      next.venue?.latitude &&
      next.venue?.longitude
    ) {
      const distance = calculateDistance(
        current.venue.latitude,
        current.venue.longitude,
        next.venue.latitude,
        next.venue.longitude
      );

      const travelTime = estimateTravelTime(distance);
      const travelHours = travelTime / 60;

      // If less than travel time + buffer, flag as warning
      if (hoursBetween < travelHours + 4) {
        // 4 hour buffer for load-out/in
        conflicts.push({
          type: 'travel_time',
          severity: hoursBetween < travelHours ? 'error' : 'warning',
          message: `Only ${Math.round(hoursBetween)}h between shows, ${Math.round(distance)}mi drive takes ~${formatTravelTime(travelTime)}`,
          shows: [current.id, next.id],
          travelTime,
          distance,
        });
      }
    }
  }

  return conflicts;
}

// Check if two dates are the same day
function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

// Calculate tour statistics
export interface TourStats {
  totalShows: number;
  totalMiles: number;
  totalTravelTime: number; // minutes
  averageMilesPerDay: number;
  longestDrive: {
    distance: number;
    from: string;
    to: string;
  } | null;
  statesVisited: Set<string>;
  citiesVisited: Set<string>;
}

export function calculateTourStats(
  shows: Array<{
    date: string;
    venue?: {
      latitude?: number;
      longitude?: number;
      name: string;
      city?: string;
      state?: string;
    };
    [key: string]: unknown;
  }>
): TourStats {
  const sortedShows = [...shows].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  let totalMiles = 0;
  let totalTravelTime = 0;
  let longestDrive: TourStats['longestDrive'] = null;
  const statesVisited = new Set<string>();
  const citiesVisited = new Set<string>();

  for (let i = 0; i < sortedShows.length; i++) {
    const show = sortedShows[i];

    if (show.venue?.state) statesVisited.add(show.venue.state);
    if (show.venue?.city) citiesVisited.add(show.venue.city);

    if (i > 0 && show.venue?.latitude && show.venue?.longitude) {
      const prev = sortedShows[i - 1];
      if (prev.venue?.latitude && prev.venue?.longitude) {
        const distance = calculateDistance(
          prev.venue.latitude,
          prev.venue.longitude,
          show.venue.latitude,
          show.venue.longitude
        );
        const travelTime = estimateTravelTime(distance);

        totalMiles += distance;
        totalTravelTime += travelTime;

        if (!longestDrive || distance > longestDrive.distance) {
          longestDrive = {
            distance,
            from: prev.venue.city || prev.venue.name,
            to: show.venue.city || show.venue.name,
          };
        }
      }
    }
  }

  const firstDate = new Date(sortedShows[0]?.date || new Date());
  const lastDate = new Date(sortedShows[sortedShows.length - 1]?.date || new Date());
  const daysBetween = Math.max(
    1,
    (lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  return {
    totalShows: shows.length,
    totalMiles: Math.round(totalMiles),
    totalTravelTime: Math.round(totalTravelTime),
    averageMilesPerDay: Math.round(totalMiles / daysBetween),
    longestDrive,
    statesVisited,
    citiesVisited,
  };
}

// Optimize tour routing (traveling salesman problem approximation)
export function optimizeTourRoute<
  T extends {
    date: string;
    venue?: {
      latitude?: number;
      longitude?: number;
    };
  },
>(shows: T[]): T[] {
  // Simple greedy nearest-neighbor algorithm
  if (shows.length <= 1) return shows;

  const unvisited = [...shows];
  const route = [];

  // Start with the first show chronologically
  const startShow = unvisited.reduce((earliest, show) =>
    new Date(show.date) < new Date(earliest.date) ? show : earliest
  );

  route.push(startShow);
  unvisited.splice(unvisited.indexOf(startShow), 1);

  while (unvisited.length > 0) {
    const current = route[route.length - 1];

    if (!current.venue?.latitude || !current.venue?.longitude) {
      // If no coordinates, just add next chronologically
      const next = unvisited.reduce((earliest, show) =>
        new Date(show.date) < new Date(earliest.date) ? show : earliest
      );
      route.push(next);
      unvisited.splice(unvisited.indexOf(next), 1);
      continue;
    }

    // Find nearest unvisited show
    let nearest = unvisited[0];
    let minDistance = Infinity;

    for (const show of unvisited) {
      if (show.venue?.latitude && show.venue?.longitude) {
        const distance = calculateDistance(
          current.venue.latitude,
          current.venue.longitude,
          show.venue.latitude,
          show.venue.longitude
        );

        if (distance < minDistance) {
          minDistance = distance;
          nearest = show;
        }
      }
    }

    route.push(nearest);
    unvisited.splice(unvisited.indexOf(nearest), 1);
  }

  return route;
}

// Generate Google Maps directions URL
export function generateDirectionsUrl(
  shows: Array<{
    date: string;
    venue?: {
      latitude?: number;
      longitude?: number;
    };
    [key: string]: unknown;
  }>
): string {
  const sortedShows = [...shows]
    .filter((show) => show.venue?.latitude && show.venue?.longitude)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (sortedShows.length < 2) return '';

  const firstVenue = sortedShows[0]?.venue;
  const lastVenue = sortedShows[sortedShows.length - 1]?.venue;

  if (
    !firstVenue?.latitude ||
    !firstVenue?.longitude ||
    !lastVenue?.latitude ||
    !lastVenue?.longitude
  ) {
    return '';
  }

  const origin = `${firstVenue.latitude},${firstVenue.longitude}`;
  const destination = `${lastVenue.latitude},${lastVenue.longitude}`;

  const waypoints = sortedShows
    .slice(1, -1)
    .filter((show) => show.venue?.latitude && show.venue?.longitude)
    .map((show) => `${show.venue!.latitude},${show.venue!.longitude}`)
    .join('|');

  let url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`;
  if (waypoints) {
    url += `&waypoints=${waypoints}`;
  }

  return url;
}

// Calculate per diem budget
export interface PerDiemCalculation {
  totalDays: number;
  perDiemRate: number; // per person per day
  bandMembers: number;
  totalPerDiem: number;
  breakdown: {
    meals: number;
    lodging: number;
    transportation: number;
  };
}

export function calculatePerDiem(
  shows: Array<{ date: string; [key: string]: unknown }>,
  bandMembers: number = 4,
  dailyRate: number = 50
): PerDiemCalculation {
  const sortedShows = [...shows].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  if (sortedShows.length === 0) {
    return {
      totalDays: 0,
      perDiemRate: dailyRate,
      bandMembers,
      totalPerDiem: 0,
      breakdown: { meals: 0, lodging: 0, transportation: 0 },
    };
  }

  const firstDate = new Date(sortedShows[0].date);
  const lastDate = new Date(sortedShows[sortedShows.length - 1].date);

  // Add travel days (day before first show, day after last show)
  const totalDays =
    Math.ceil((lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)) + 2;

  const totalPerDiem = totalDays * dailyRate * bandMembers;

  return {
    totalDays,
    perDiemRate: dailyRate,
    bandMembers,
    totalPerDiem,
    breakdown: {
      meals: Math.round(totalPerDiem * 0.5), // 50% for meals
      lodging: Math.round(totalPerDiem * 0.35), // 35% for lodging
      transportation: Math.round(totalPerDiem * 0.15), // 15% for local transport
    },
  };
}
