import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Converts user-friendly time input to UTC timestamp for today
 * @param timeInput - User's time input (e.g., "9pm", "9:30 PM", "21:00", "9:30")
 * @param timezone - User's timezone (e.g., "America/New_York", "Europe/London")
 * @param targetDate - Optional date to schedule for (defaults to today)
 * @returns UTC timestamp in milliseconds
 */
export function convertUserTimeToUTC(
  timeInput: string,
  timezone: string,
  targetDate?: Date
): number {
  // Normalize the input
  const normalizedTime = normalizeTimeInput(timeInput);
  const { hours, minutes } = parseTime(normalizedTime);

  // Use target date or today
  const date = targetDate || new Date();

  // Create a date in the user's timezone
  const userLocalDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), hours, minutes, 0, 0);

  // Convert to UTC using Intl.DateTimeFormat
  const utcTimestamp = convertToUTC(userLocalDate, timezone);

  return utcTimestamp;
}

/**
 * Normalizes various time input formats to a consistent format
 */
function normalizeTimeInput(input: string): string {
  return input
    .toLowerCase()
    .replace(/\s+/g, '') // Remove spaces
    .replace(/\./g, ':') // Convert dots to colons
    .trim();
}

/**
 * Parses normalized time string into hours and minutes
 */
function parseTime(timeStr: string): { hours: number; minutes: number } {
  // Handle different formats
  const patterns = [
    // 12-hour format with am/pm
    /^(\d{1,2}):?(\d{0,2})(am|pm)$/,
    // 24-hour format
    /^(\d{1,2}):(\d{2})$/,
    // Hour only (no minutes)
    /^(\d{1,2})(am|pm)?$/
  ];

  for (const pattern of patterns) {
    const match = timeStr.match(pattern);
    if (match) {
      let hours = parseInt(match[1]);
      let minutes = match[2] ? parseInt(match[2]) : 0;
      const ampm = match[3];

      // Convert to 24-hour format if needed
      if (ampm) {
        if (ampm === 'pm' && hours !== 12) {
          hours += 12;
        } else if (ampm === 'am' && hours === 12) {
          hours = 0;
        }
      }

      // Validate
      if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
        return { hours, minutes };
      }
    }
  }

  throw new Error(`Invalid time format: ${timeStr}. Use formats like "9pm", "9:30 PM", "21:00", or "9:30"`);
}

/**
 * Converts a local date/time to UTC timestamp accounting for timezone
 */
function convertToUTC(localDate: Date, timezone: string): number {
  try {
    // Create a date string in the format that works with timezone conversion
    const year = localDate.getFullYear();
    const month = (localDate.getMonth() + 1).toString().padStart(2, '0');
    const day = localDate.getDate().toString().padStart(2, '0');
    const hours = localDate.getHours().toString().padStart(2, '0');
    const minutes = localDate.getMinutes().toString().padStart(2, '0');

    const dateTimeString = `${year}-${month}-${day}T${hours}:${minutes}:00`;

    // Use Intl.DateTimeFormat to handle timezone conversion
    const dateInTimezone = new Date(dateTimeString);

    // Get the timezone offset for this specific date
    const tempDate = new Date(dateTimeString + 'Z'); // Assume UTC first
    const utcTime = tempDate.getTime();

    // Create a formatter for the target timezone
    const formatter = new Intl.DateTimeFormat('en', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });

    // Get what UTC time would display as the target time in the user's timezone
    let targetUtcTime = utcTime;
    const maxIterations = 24; // Prevent infinite loops
    let iterations = 0;

    while (iterations < maxIterations) {
      const testDate = new Date(targetUtcTime);
      const parts = formatter.formatToParts(testDate);

      const formattedHour = parseInt(parts.find(p => p.type === 'hour')?.value || '0');
      const formattedMinute = parseInt(parts.find(p => p.type === 'minute')?.value || '0');

      if (formattedHour === localDate.getHours() && formattedMinute === localDate.getMinutes()) {
        return targetUtcTime;
      }

      // Adjust by 1 hour and try again
      const hourDiff = localDate.getHours() - formattedHour;
      const minuteDiff = localDate.getMinutes() - formattedMinute;
      targetUtcTime += (hourDiff * 60 + minuteDiff) * 60 * 1000;
      iterations++;
    }

    // Fallback: use a simpler approach
    const offsetDate = new Date(dateTimeString);
    const timezoneOffset = getTimezoneOffset(timezone, offsetDate);
    return offsetDate.getTime() - (timezoneOffset * 60 * 1000);

  } catch (error) {
    throw new Error(`Failed to convert time to UTC: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get timezone offset in minutes for a specific date
 */
function getTimezoneOffset(timezone: string, date: Date): number {
  const utc = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
  const local = new Date(date.toLocaleString('en-US', { timeZone: timezone }));
  return (local.getTime() - utc.getTime()) / (1000 * 60);
}

/**
 * Convert UTC timestamp back to user's local time for display
 */
export function convertUTCToUserTime(
  utcTimestamp: number,
  timezone: string,
  format12Hour: boolean = true
): string {
  const date = new Date(utcTimestamp);

  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour: 'numeric',
    minute: '2-digit',
    hour12: format12Hour
  });

  return formatter.format(date);
}

/**
 * Get the next occurrence of a specific time (today or tomorrow if already passed)
 */
export function getNextOccurrenceUTC(
  timeInput: string,
  timezone: string
): number {
  const today = new Date();
  const todayUTC = convertUserTimeToUTC(timeInput, timezone, today);

  // If the time has already passed today, schedule for tomorrow
  if (todayUTC <= Date.now()) {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return convertUserTimeToUTC(timeInput, timezone, tomorrow);
  }

  return todayUTC;
}

/**
 * Validate timezone string
 */
export function isValidTimezone(timezone: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
    return true;
  } catch {
    return false;
  }
}

// Example usage and test function
export function testTimeConversions() {
  console.log('Testing time conversions...');

  const testCases = [
    { time: '9pm', timezone: 'America/New_York' },
    { time: '9:30 PM', timezone: 'America/Los_Angeles' },
    { time: '21:00', timezone: 'Europe/London' },
    { time: '9:30', timezone: 'Asia/Tokyo' },
    { time: '12pm', timezone: 'America/Chicago' },
    { time: '12am', timezone: 'UTC' }
  ];

  testCases.forEach(({ time, timezone }) => {
    try {
      const utcTimestamp = convertUserTimeToUTC(time, timezone);
      const backToLocal = convertUTCToUserTime(utcTimestamp, timezone);
      console.log(`${time} in ${timezone} -> UTC: ${new Date(utcTimestamp).toISOString()} -> Back: ${backToLocal}`);
    } catch (error) {
      console.error(`Error with ${time} in ${timezone}:`, error);
    }
  });
}