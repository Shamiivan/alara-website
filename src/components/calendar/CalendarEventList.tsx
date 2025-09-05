"use client";

import * as React from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { TOKENS as APP_TOKENS } from "@/components/tokens";
/*
  CalendarEventsList
  -------------------
  A small, production-ready component that fetches and lists Google Calendar events
  for a given calendarId within a user-selected time frame, powered by your
  Convex action `api.calendar.getCalendarEvents`.

  Props
  -----
  - calendarId: string (required) → e.g., "primary" or an email/calendar id
  - initialRange?: { start: Date; end: Date }
  - maxResults?: number (default 250)
  - singleEvents?: boolean (default true)
  - autoFetch?: boolean (default true) → auto fetch on mount when user is ready
  - className?: string → outer container className

  Notes
  -----
  - Handles all‑day and timed events. 
  - Converts local date inputs to RFC3339 Zulu (UTC) bounds for the Google API.
  - Graceful empty/errored/loading states. 
  - If you later add pageToken support to your backend action, you can extend
    this component (search for TODO: pagination) to wire up pagination.
*/

// Optional tokens (fallbacks in case your TOKENS object isn't available here)
const FALLBACK_TOKENS = {
  radius: 12,
  shadow: "0 1px 2px rgba(16,24,40,0.04), 0 8px 24px rgba(16,24,40,0.06)",
  bg: "#F8FAFC",
  cardBg: "#FFFFFF",
  text: "#0F172A",
  subtext: "#475569",
  border: "#E2E8F0",
  primary: "#4F46E5",
  primaryHover: "#4338CA",
  accent: "#E0E7FF",
  success: "#10B981",
  successBg: "rgba(16, 185, 129, 0.12)",
  warn: "#F59E0B",
};

// If your app exposes TOKENS globally, you can import it and prefer it:
// import { TOKENS as APP_TOKENS } from "@/components/tokens";
// const TOKENS = { ...FALLBACK_TOKENS, ...APP_TOKENS };
const TOKENS = FALLBACK_TOKENS;

// Try to use your shared buttons if you have them; otherwise fall back to inline buttons.
let PrimaryButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> =
  (props) => (
    <button
      {...props}
      className={[
        "inline-flex items-center justify-center",
        "px-3 py-2 text-sm font-medium",
        "rounded-[12px]",
        "transition-colors",
        props.className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        background: TOKENS.primary,
        color: "#FFFFFF",
        boxShadow: TOKENS.shadow,
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = TOKENS.primaryHover;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = TOKENS.primary;
      }}
    />
  );

try {
  // Use dynamic import instead of require
  import("@/components/ui/CustomButton").then(Buttons => {
    if (Buttons?.PrimaryButton) PrimaryButton = Buttons.PrimaryButton;
  }).catch(() => {
    // Silently continue with fallback button if import fails
  });
} catch { }

// Types that mirror your action's return shape
interface CalendarEventTime {
  date?: string; // all‑day
  dateTime?: string; // RFC3339 date-time
  timeZone?: string;
}

interface CalendarEventItem {
  id: string;
  summary: string;
  description?: string;
  location?: string;
  start: CalendarEventTime;
  end: CalendarEventTime;
  status: string;
  transparency: "opaque" | "transparent" | string;
  visibility: string;
  creator?: { email?: string; displayName?: string };
  organizer?: { email?: string; displayName?: string };
  attendees?: Array<{ email?: string; responseStatus?: string; displayName?: string }>;
  recurringEventId?: string;
  hangoutLink?: string;
  htmlLink?: string;
}

interface CalendarEventsPayload {
  calendarId: string;
  calendarSummary?: string;
  timeZone?: string;
  events: CalendarEventItem[];
  totalCount: number;
  nextPageToken?: string;
}

interface CalendarEventsActionResult {
  success: boolean;
  data: CalendarEventsPayload | null;
  error?: string | null;
}

export type CalendarEventsListProps = {
  calendarId: string;
  initialRange?: { start: Date; end: Date };
  maxResults?: number;
  singleEvents?: boolean;
  autoFetch?: boolean;
  className?: string;
};

export default function CalendarEventsList({
  calendarId,
  initialRange,
  maxResults = 250,
  singleEvents = true,
  autoFetch = true,
  className,
}: CalendarEventsListProps) {
  const user = useQuery(api.user.getCurrentUser, {});
  const getCalendarEvents = useAction(api.calendar.getCalendarEvents);

  const [startDate, setStartDate] = React.useState<string>(
    toInputDate(initialRange?.start ?? startOfToday())
  );
  const [endDate, setEndDate] = React.useState<string>(
    toInputDate(initialRange?.end ?? endOfToday())
  );

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [events, setEvents] = React.useState<CalendarEventItem[] | null>(null);
  const [meta, setMeta] = React.useState<{
    calendarSummary?: string;
    timeZone?: string;
    totalCount?: number;
    nextPageToken?: string; // TODO: pagination if backend supports
  }>({});

  const canQuery = Boolean(user?._id && calendarId);

  React.useEffect(() => {
    if (autoFetch && canQuery) {
      void fetchEvents();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoFetch, canQuery]);

  async function fetchEvents() {
    if (!user?._id) {
      setError("You need to be signed in.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { timeMin, timeMax } = buildRFC3339Bounds(startDate, endDate);

      const resp = (await getCalendarEvents({
        userId: user._id,
        calendarId,
        timeMin,
        timeMax,
        maxResults,
        singleEvents,
      })) as CalendarEventsActionResult;

      if (!resp?.success || !resp?.data) {
        throw new Error(resp?.error || "Failed to load events");
      }

      setEvents(resp.data.events || []);
      setMeta({
        calendarSummary: resp.data.calendarSummary,
        timeZone: resp.data.timeZone,
        totalCount: resp.data.totalCount,
        nextPageToken: resp.data.nextPageToken,
      });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
      setEvents(null);
      setMeta({});
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className={[
        "w-full max-w-3xl",
        "rounded-xl",
        "border",
        "p-4 md:p-6",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        background: TOKENS.cardBg,
        borderColor: TOKENS.border,
        color: TOKENS.text,
        boxShadow: TOKENS.shadow,
      }}
    >
      <header className="mb-4">
        <h2 className="text-lg font-semibold">
          Calendar Events{meta.calendarSummary ? ` · ${meta.calendarSummary}` : ""}
        </h2>
        <p className="text-sm" style={{ color: TOKENS.subtext }}>
          Pick a date range and fetch events for <span className="font-medium">{calendarId}</span>
          {meta.timeZone ? ` (TZ: ${meta.timeZone})` : ""}.
        </p>
      </header>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void fetchEvents();
        }}
        className="grid grid-cols-1 md:grid-cols-5 gap-3 md:gap-4 items-end"
      >
        <label className="flex flex-col gap-1 md:col-span-2">
          <span className="text-sm">Start date</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="rounded-lg border px-3 py-2 text-sm"
            style={{ borderColor: TOKENS.border, background: "#fff" }}
            required
          />
        </label>

        <label className="flex flex-col gap-1 md:col-span-2">
          <span className="text-sm">End date</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="rounded-lg border px-3 py-2 text-sm"
            style={{ borderColor: TOKENS.border, background: "#fff" }}
            required
          />
        </label>

        <div className="md:col-span-1 flex gap-2">
          <PrimaryButton type="submit" disabled={!canQuery || loading}>
            {loading ? "Fetching…" : "Fetch events"}
          </PrimaryButton>
        </div>
      </form>

      {/* Status */}
      {error && (
        <div
          className="mt-4 rounded-lg border px-3 py-2 text-sm"
          style={{ borderColor: TOKENS.warn }}
        >
          <strong className="mr-1">Error:</strong> {error}
        </div>
      )}

      {!error && loading && (
        <div className="mt-4 text-sm" style={{ color: TOKENS.subtext }}>
          Loading events…
        </div>
      )}

      {/* Results */}
      {!loading && !error && events && (
        <section className="mt-4">
          <div className="mb-2 text-sm" style={{ color: TOKENS.subtext }}>
            {typeof meta.totalCount === "number" ? `${meta.totalCount} event(s)` : null}
          </div>

          {events.length === 0 ? (
            <EmptyState />
          ) : (
            <ul className="flex flex-col gap-3">
              {events.map((ev) => (
                <li key={ev.id}>
                  <EventCard ev={ev} />
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {/* TODO: pagination controls if/when pageToken is supported by backend */}
    </div>
  );
}

function EmptyState() {
  return (
    <div
      className="rounded-lg border px-4 py-6 text-center"
      style={{ borderColor: TOKENS.border, background: TOKENS.bg }}
    >
      <div className="text-sm" style={{ color: TOKENS.subtext }}>
        No events in this range.
      </div>
    </div>
  );
}

function EventCard({ ev }: { ev: CalendarEventItem }) {
  const { startLabel, endLabel, isAllDay } = React.useMemo(() => formatEventTime(ev), [ev]);

  return (
    <article
      className="rounded-lg border p-4"
      style={{ borderColor: TOKENS.border, background: "#fff" }}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-medium">{ev.summary || "(No title)"}</h3>
          <div className="mt-1 text-sm" style={{ color: TOKENS.subtext }}>
            <TimeRange start={startLabel} end={endLabel} allDay={isAllDay} />
          </div>
          {ev.location && (
            <div className="mt-1 text-sm" style={{ color: TOKENS.subtext }}>
              📍 {ev.location}
            </div>
          )}
          {ev.description && (
            <p className="mt-2 text-sm leading-relaxed line-clamp-3 whitespace-pre-wrap">
              {ev.description}
            </p>
          )}
          {ev.attendees && ev.attendees.length > 0 && (
            <div className="mt-2 text-sm" style={{ color: TOKENS.subtext }}>
              Attendees: {ev.attendees.map((a) => a.displayName || a.email).filter(Boolean).join(", ")}
            </div>
          )}
        </div>
        {ev.htmlLink && (
          <a
            href={ev.htmlLink}
            target="_blank"
            rel="noreferrer"
            className="text-sm underline"
            style={{ color: TOKENS.primary }}
          >
            Open
          </a>
        )}
      </div>
    </article>
  );
}

function TimeRange({ start, end, allDay }: { start: string; end: string; allDay: boolean }) {
  return (
    <span>
      {allDay ? (
        <>
          All‑day · {start}
          {start !== end ? ` → ${end}` : ""}
        </>
      ) : (
        <>
          {start} → {end}
        </>
      )}
    </span>
  );
}

/* ---------------------------- Helpers ---------------------------- */

function toInputDate(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfToday(): Date {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
}

function buildRFC3339Bounds(startDateStr: string, endDateStr: string) {
  const start = new Date(startDateStr + "T00:00:00");
  const end = new Date(endDateStr + "T23:59:59");
  return { timeMin: toRFC3339Z(start), timeMax: toRFC3339Z(end) };
}

function toRFC3339Z(d: Date): string {
  // Ensures we always end with Z (UTC). Using toISOString is fine (it already uses UTC)
  return d.toISOString();
}

function formatEventTime(ev: CalendarEventItem) {
  const isAllDay = Boolean(ev.start?.date || ev.end?.date);
  if (isAllDay) {
    const start = ev.start.date!; // e.g., 2024-02-01
    const end = ev.end?.date || start;
    // Render as local human dates
    const startStr = humanDate(new Date(start + "T00:00:00"));
    // For all‑day events, Google encodes end as the day AFTER the last day (exclusive),
    // but many feeds already normalize this. We won't subtract a day unless you prefer.
    const endStr = humanDate(new Date(end + "T00:00:00"));
    return { startLabel: startStr, endLabel: endStr, isAllDay: true };
  }

  const startDT = ev.start.dateTime ? new Date(ev.start.dateTime) : null;
  const endDT = ev.end.dateTime ? new Date(ev.end.dateTime) : null;
  return {
    startLabel: startDT ? humanDateTime(startDT) : "",
    endLabel: endDT ? humanDateTime(endDT) : "",
    isAllDay: false,
  };
}

function humanDate(d: Date): string {
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function humanDateTime(d: Date): string {
  return (
    d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) +
    ", " +
    d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })
  );
}
