/**
 * Date and time utilities for event processing
 */

import { addDays, isWithinInterval, parseISO, format, startOfDay, endOfDay } from 'date-fns';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';

/**
 * Timezone for all events (America/New_York)
 */
export const TIMEZONE = 'America/New_York';

/**
 * Number of days in the future to include events
 */
export const EVENT_WINDOW_DAYS = 30;

/**
 * Checks if a date is within the next 30 days
 */
export function isWithinEventWindow(date: Date): boolean {
  const now = new Date();
  const windowEnd = addDays(now, EVENT_WINDOW_DAYS);

  return isWithinInterval(date, {
    start: startOfDay(now),
    end: endOfDay(windowEnd),
  });
}

/**
 * Converts a date to the event timezone (America/New_York)
 */
export function toEventTimezone(date: Date): Date {
  return toZonedTime(date, TIMEZONE);
}

/**
 * Converts a date from the event timezone to UTC
 */
export function fromEventTimezone(date: Date): Date {
  return fromZonedTime(date, TIMEZONE);
}

/**
 * Parses a date string and returns a Date object in the event timezone
 * Supports various formats
 */
export function parseEventDate(dateString: string): Date | null {
  try {
    const parsed = parseISO(dateString);
    if (isNaN(parsed.getTime())) return null;
    return toEventTimezone(parsed);
  } catch {
    return null;
  }
}

/**
 * Formats a date for database storage (ISO 8601)
 */
export function formatForDatabase(date: Date): string {
  return format(date, "yyyy-MM-dd'T'HH:mm:ss");
}

/**
 * Formats a date for display (readable format)
 */
export function formatForDisplay(date: Date): string {
  return format(date, 'EEEE, MMMM d, yyyy h:mm a');
}

/**
 * Extracts just the date portion (no time) for database storage
 */
export function getDateOnly(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

/**
 * Checks if a time is unclear or missing
 * Returns true if the time appears to be a default/placeholder
 */
export function isTimeUnclear(datetime: Date | null | undefined): boolean {
  if (!datetime) return true;

  const hours = datetime.getHours();
  const minutes = datetime.getMinutes();

  // If time is exactly midnight (00:00), it's likely unclear
  if (hours === 0 && minutes === 0) {
    return true;
  }

  return false;
}

/**
 * Time clarity enum matching database schema
 */
export type TimeClarity = 'exact' | 'unclear';

/**
 * Determines time clarity for an event
 */
export function determineTimeClarity(datetime: Date | null | undefined): TimeClarity {
  return isTimeUnclear(datetime) ? 'unclear' : 'exact';
}

/**
 * Parses common date formats found in event sources
 * Returns null if parsing fails
 */
export function parseFlexibleDate(dateStr: string): Date | null {
  if (!dateStr) return null;

  try {
    // Try ISO format first
    let date = parseISO(dateStr);
    if (!isNaN(date.getTime())) {
      return toEventTimezone(date);
    }

    // Try common US formats
    const usFormats = [
      /(\d{1,2})\/(\d{1,2})\/(\d{4})/, // MM/DD/YYYY
      /(\d{1,2})-(\d{1,2})-(\d{4})/, // MM-DD-YYYY
    ];

    for (const regex of usFormats) {
      const match = dateStr.match(regex);
      if (match) {
        const [, month, day, year] = match;
        date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        if (!isNaN(date.getTime())) {
          return toEventTimezone(date);
        }
      }
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Combines a date and time string into a single datetime
 */
export function combineDateTime(dateStr: string, timeStr?: string): Date | null {
  const date = parseFlexibleDate(dateStr);
  if (!date) return null;

  if (!timeStr) return date;

  // Parse time string (e.g., "7:00 PM", "19:00", "7pm")
  const timeMatch = timeStr.match(/(\d{1,2}):?(\d{2})?\s*(am|pm)?/i);
  if (!timeMatch) return date;

  let hours = parseInt(timeMatch[1]);
  const minutes = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
  const meridiem = timeMatch[3]?.toLowerCase();

  // Convert to 24-hour format
  if (meridiem === 'pm' && hours !== 12) {
    hours += 12;
  } else if (meridiem === 'am' && hours === 12) {
    hours = 0;
  }

  date.setHours(hours, minutes, 0, 0);
  return toEventTimezone(date);
}
