// Shared utility functions for tasks

/**
 * Validates that a date string is in ISO format with timezone offset
 * Examples of valid formats:
 * - "2025-01-15T14:30:00Z" (UTC)
 * - "2025-01-15T14:30:00-05:00" (EST)
 * - "2025-01-15T14:30:00+01:00" (CET)
 */
export function validateISODateString(dateStr: string): { isValid: boolean; error?: string } {
  // Check basic ISO format with timezone
  const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?(Z|[+-]\d{2}:\d{2})$/;

  if (!isoRegex.test(dateStr)) {
    return {
      isValid: false,
      error: "Date must be in ISO format with timezone (e.g., '2025-01-15T14:30:00-05:00')"
    };
  }

  // Check if date is actually parseable
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    return {
      isValid: false,
      error: "Invalid date value"
    };
  }

  // Check if date is in the future
  if (date.getTime() <= Date.now()) {
    return {
      isValid: false,
      error: "Due date must be in the future"
    };
  }

  return { isValid: true };
}

/**
 * Validates timezone string (IANA timezone names)
 * Examples: "America/New_York", "Europe/London", "UTC"
 */
export function validateTimezone(timezone: string): { isValid: boolean; error?: string } {
  try {
    // Try to create a date formatter with the timezone
    // This will throw if timezone is invalid
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
    return { isValid: true };
  } catch (error) {
    return {
      isValid: false,
      error: `Invalid timezone: ${timezone}. Use IANA timezone names like 'America/New_York'`
    };
  }
}