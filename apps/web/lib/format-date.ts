/**
 * SSR-Safe Date Formatting Utilities
 *
 * These functions prevent hydration mismatches by using consistent,
 * deterministic formatting that works identically on server and client.
 *
 * ⚠️ NEVER use toLocaleDateString(), toLocaleTimeString(), or toLocaleString()
 * directly in React components as they cause hydration errors.
 *
 * @see https://react.dev/errors/418
 * @see https://nextjs.org/docs/messages/react-hydration-error
 */

/**
 * Format date as YYYY-MM-DD (ISO date format)
 * Safe for SSR - produces consistent output regardless of timezone
 */
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return 'Invalid Date';

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

/**
 * Format date as "MMM DD, YYYY" (e.g., "Jan 15, 2024")
 * Safe for SSR - uses hardcoded month names
 */
export function formatDateLong(date: Date | string | null | undefined): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return 'Invalid Date';

  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  const month = months[d.getMonth()];
  const day = d.getDate();
  const year = d.getFullYear();

  return `${month} ${day}, ${year}`;
}

/**
 * Format date as "Month DD, YYYY" (e.g., "January 15, 2024")
 * Safe for SSR - uses hardcoded full month names
 */
export function formatDateFull(date: Date | string | null | undefined): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return 'Invalid Date';

  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  const month = months[d.getMonth()];
  const day = d.getDate();
  const year = d.getFullYear();

  return `${month} ${day}, ${year}`;
}

/**
 * Format date with weekday as "Day, MMM DD, YYYY" (e.g., "Mon, Jan 15, 2024")
 * Safe for SSR - uses hardcoded day/month names
 */
export function formatDateWithDay(date: Date | string | null | undefined): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return 'Invalid Date';

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  const day = days[d.getDay()];
  const month = months[d.getMonth()];
  const date_num = d.getDate();
  const year = d.getFullYear();

  return `${day}, ${month} ${date_num}, ${year}`;
}

/**
 * Format time as "HH:MM AM/PM"
 * Safe for SSR - uses 12-hour format without locale dependency
 */
export function formatTime(date: Date | string | number | null | undefined): string {
  if (date === null || date === undefined) return '';
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  if (isNaN(d.getTime())) return 'Invalid Time';

  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;

  return `${hours}:${minutes} ${ampm}`;
}

/**
 * Format date and time as "MMM DD, YYYY at HH:MM AM/PM"
 * Safe for SSR - combines formatDateLong and formatTime
 */
export function formatDateTime(date: Date | string | number | null | undefined): string {
  if (date === null || date === undefined) return '';
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  if (isNaN(d.getTime())) return 'Invalid DateTime';

  return `${formatDateLong(d)} at ${formatTime(d)}`;
}

/**
 * Format relative time (e.g., "2 minutes ago", "1 hour ago")
 * Safe for SSR - uses consistent time calculations
 *
 * Note: This can still cause minor hydration warnings if server and client
 * render times differ significantly. For critical cases, wrap in ClientOnly.
 */
export function formatRelativeTime(timestamp: number | Date | string | null | undefined): string {
  if (timestamp === null || timestamp === undefined) return '';

  const now = Date.now();
  const then = typeof timestamp === 'number' ? timestamp : new Date(timestamp).getTime();

  if (isNaN(then)) return 'Invalid Time';

  const diff = now - then;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (seconds < 60) return 'just now';
  if (minutes < 60) return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  if (hours < 24) return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  if (days < 7) return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  if (weeks < 4) return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
  if (months < 12) return `${months} ${months === 1 ? 'month' : 'months'} ago`;
  return `${years} ${years === 1 ? 'year' : 'years'} ago`;
}

/**
 * Format duration in milliseconds to "MM:SS" or "HH:MM:SS"
 * Safe for SSR - deterministic formatting
 */
export function formatDuration(ms: number): string {
  if (typeof ms !== 'number' || isNaN(ms)) return '0:00';

  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}:${String(minutes % 60).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  }
  return `${minutes}:${String(seconds % 60).padStart(2, '0')}`;
}

/**
 * Format number with thousands separators (e.g., "1,234,567")
 * Safe for SSR - uses 'en-US' locale explicitly
 *
 * Note: Using explicit locale makes it safe for SSR as both server
 * and client will format the same way.
 */
export function formatNumber(num: number | null | undefined): string {
  if (num === null || num === undefined || isNaN(num)) return '0';
  return num.toLocaleString('en-US');
}

/**
 * Format currency as "$1,234.56"
 * Safe for SSR - uses explicit locale and formatting
 */
export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) return '$0.00';
  return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
