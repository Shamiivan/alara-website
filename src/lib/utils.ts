// utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Converts user-friendly time input to UTC timestamp for today
 * (kept as-is from your file)
 */
export function convertUserTimeToUTC(
  timeInput: string,
  timezone: string,
  targetDate?: Date
): number {
  const normalizedTime = normalizeTimeInput(timeInput);
  const { hours, minutes } = parseTime(normalizedTime);
  const date = targetDate || new Date();
  const userLocalDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    hours,
    minutes,
    0,
    0
  );
  const utcTimestamp = convertToUTC(userLocalDate, timezone);
  return utcTimestamp;
}

/** Normalization + parsing (kept as-is) */
function normalizeTimeInput(input: string): string {
  return input.toLowerCase().replace(/\s+/g, "").replace(/\./g, ":").trim();
}
function parseTime(timeStr: string): { hours: number; minutes: number } {
  const patterns = [
    /^(\d{1,2}):?(\d{0,2})(am|pm)$/,
    /^(\d{1,2}):(\d{2})$/,
    /^(\d{1,2})(am|pm)?$/,
  ];
  for (const pattern of patterns) {
    const match = timeStr.match(pattern);
    if (match) {
      let hours = parseInt(match[1]);
      const minutes = match[2] ? parseInt(match[2]) : 0;
      const ampm = match[3];
      if (ampm) {
        if (ampm === "pm" && hours !== 12) hours += 12;
        else if (ampm === "am" && hours === 12) hours = 0;
      }
      if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
        return { hours, minutes };
      }
    }
  }
  throw new Error(
    `Invalid time format: ${timeStr}. Use formats like "9pm", "9:30 PM", "21:00", or "9:30"`
  );
}

/** TZ conversion (kept as-is) */
function convertToUTC(localDate: Date, timezone: string): number {
  try {
    const year = localDate.getFullYear();
    const month = (localDate.getMonth() + 1).toString().padStart(2, "0");
    const day = localDate.getDate().toString().padStart(2, "0");
    const hours = localDate.getHours().toString().padStart(2, "0");
    const minutes = localDate.getMinutes().toString().padStart(2, "0");
    const dateTimeString = `${year}-${month}-${day}T${hours}:${minutes}:00`;

    const tempDate = new Date(dateTimeString + "Z");
    const utcTime = tempDate.getTime();

    const formatter = new Intl.DateTimeFormat("en", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

    let targetUtcTime = utcTime;
    const maxIterations = 24;
    let iterations = 0;

    while (iterations < maxIterations) {
      const testDate = new Date(targetUtcTime);
      const parts = formatter.formatToParts(testDate);
      const formattedHour = parseInt(parts.find(p => p.type === "hour")?.value || "0");
      const formattedMinute = parseInt(parts.find(p => p.type === "minute")?.value || "0");

      if (
        formattedHour === localDate.getHours() &&
        formattedMinute === localDate.getMinutes()
      ) {
        return targetUtcTime;
      }

      const hourDiff = localDate.getHours() - formattedHour;
      const minuteDiff = localDate.getMinutes() - formattedMinute;
      targetUtcTime += (hourDiff * 60 + minuteDiff) * 60 * 1000;
      iterations++;
    }

    const offsetDate = new Date(dateTimeString);
    const timezoneOffset = getTimezoneOffset(timezone, offsetDate);
    return offsetDate.getTime() - timezoneOffset * 60 * 1000;
  } catch (error) {
    throw new Error(
      `Failed to convert time to UTC: ${error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

function getTimezoneOffset(timezone: string, date: Date): number {
  const utc = new Date(date.toLocaleString("en-US", { timeZone: "UTC" }));
  const local = new Date(date.toLocaleString("en-US", { timeZone: timezone }));
  return (local.getTime() - utc.getTime()) / (1000 * 60);
}

/** Display UTC in user's TZ (kept as-is) */
export function convertUTCToUserTime(
  utcTimestamp: number,
  timezone: string,
  format12Hour: boolean = true
): string {
  const date = new Date(utcTimestamp);
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "numeric",
    minute: "2-digit",
    hour12: format12Hour,
  });
  return formatter.format(date);
}

/** Next occurrence util (kept as-is) */
export function getNextOccurrenceUTC(timeInput: string, timezone: string): number {
  const today = new Date();
  const todayUTC = convertUserTimeToUTC(timeInput, timezone, today);
  if (todayUTC <= Date.now()) {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return convertUserTimeToUTC(timeInput, timezone, tomorrow);
  }
  return todayUTC;
}

/** Validate TZ (kept as-is) */
export function isValidTimezone(timezone: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
    return true;
  } catch {
    return false;
  }
}

/* ------------------------------------------------------------------ */
/* NEW: generic helpers that were previously inside NextCallCard       */
/* ------------------------------------------------------------------ */

/** Safe default timezone from the runtime */
export function getDefaultTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

// Type for Intl with optional supportedValuesOf method
type IntlWithSupportedValues = {
  supportedValuesOf(key: string): string[];
};

/** Compact list of time zones with modern API fallback */
export function getAllTimeZones(): string[] {
  // Keep small and predictable; you can swap for a full list later if needed
  const extendedIntl = Intl as unknown as IntlWithSupportedValues;
  if (extendedIntl.supportedValuesOf) {
    const vals = extendedIntl.supportedValuesOf("timeZone");
    if (Array.isArray(vals) && vals.length) return vals;
  }
  return [
    "UTC",
    "America/Toronto",
    "America/New_York",
    "America/Chicago",
    "America/Los_Angeles",
    "Europe/London",
    "Europe/Paris",
    "Asia/Tokyo",
  ];
}

/** Format a date in a specific TZ with arbitrary Intl options */
export function formatInTZ(
  date: Date | string | number,
  timeZone: string,
  options: Intl.DateTimeFormatOptions
): string {
  const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
  return new Intl.DateTimeFormat(undefined, { timeZone, ...options }).format(d);
}

/** Convert UTC ISO -> { date: 'YYYY-MM-DD', time: 'HH:MM' } in TZ */
export function utcToLocalFields(utcISO: string, tz: string): { date: string; time: string } {
  const d = new Date(utcISO);
  if (isNaN(d.getTime())) return { date: "", time: "" };

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(d);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value || "";

  const yyyy = get("year");
  const mm = get("month");
  const dd = get("day");
  const hh = get("hour");
  const mi = get("minute");

  return { date: `${yyyy}-${mm}-${dd}`, time: `${hh}:${mi}` };
}

/**
 * Convert local date+time in a TZ to a UTC ISO string.
 * DST-safe without Temporal/Luxon.
 */
export function localFieldsToUtcISO(
  dateYYYYMMDD: string,
  timeHHMM: string,
  tz: string
): string {
  if (!dateYYYYMMDD || !timeHHMM) return "";

  const [y, m, d] = dateYYYYMMDD.split("-").map((v) => parseInt(v, 10));
  const [hh, mm] = timeHHMM.split(":").map((v) => parseInt(v, 10));

  const naiveUtcMs = Date.UTC(y, (m || 1) - 1, d || 1, hh || 0, mm || 0, 0);
  const naiveUtcDate = new Date(naiveUtcMs);

  const tzParts = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(naiveUtcDate);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    tzParts.find((p) => p.type === type)?.value || "00";

  const tzYear = parseInt(get("year"), 10);
  const tzMonth = parseInt(get("month"), 10);
  const tzDay = parseInt(get("day"), 10);
  const tzHour = parseInt(get("hour"), 10);
  const tzMin = parseInt(get("minute"), 10);
  const tzSec = parseInt(get("second"), 10);

  const pretendUtcMs = Date.UTC(tzYear, tzMonth - 1, tzDay, tzHour, tzMin, tzSec, 0);
  const offsetMs = pretendUtcMs - naiveUtcMs;
  const trueUtcMs = naiveUtcMs - offsetMs;

  return new Date(trueUtcMs).toISOString();
}

/** Round “now” to the next 15-min slot in a given TZ -> {date, time} */
export function roundNowToNext15(tz: string): { date: string; time: string } {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now);

  const get = (t: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === t)?.value || "";

  const yyyy = parseInt(get("year"), 10);
  const mm = parseInt(get("month"), 10);
  const dd = parseInt(get("day"), 10);
  let hh = parseInt(get("hour"), 10);
  let mi = parseInt(get("minute"), 10);

  const rounded = Math.ceil(mi / 15) * 15;
  if (rounded === 60) {
    mi = 0;
    hh = (hh + 1) % 24;
  } else {
    mi = rounded;
  }
  const pad = (n: number) => String(n).padStart(2, "0");
  return { date: `${yyyy}-${pad(mm)}-${pad(dd)}`, time: `${pad(hh)}:${pad(mi)}` };
}

/** (Optional) quick test harness retained */
export function testTimeConversions() {
  console.log("Testing time conversions...");
  const testCases = [
    { time: "9pm", timezone: "America/New_York" },
    { time: "9:30 PM", timezone: "America/Los_Angeles" },
    { time: "21:00", timezone: "Europe/London" },
    { time: "9:30", timezone: "Asia/Tokyo" },
    { time: "12pm", timezone: "America/Chicago" },
    { time: "12am", timezone: "UTC" },
  ];
  testCases.forEach(({ time, timezone }) => {
    try {
      const utcTimestamp = convertUserTimeToUTC(time, timezone);
      const backToLocal = convertUTCToUserTime(utcTimestamp, timezone);
      console.log(
        `${time} in ${timezone} -> UTC: ${new Date(utcTimestamp).toISOString()} -> Back: ${backToLocal}`
      );
    } catch (error) {
      console.error(`Error with ${time} in ${timezone}:`, error);
    }
  });
}
