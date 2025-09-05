"use client";

import * as React from "react";
import { useAction } from "convex/react";
import { api } from "../../../../convex/_generated/api"; // adjust path if needed
import { Id } from "../../../../convex/_generated/dataModel";

type AvailabilityData = {
  calendarId: string;
  calendarSummary?: string;
  timeZone?: string;
  queryRange: { start: string; end: string };
  events: Array<{
    id: string;
    summary: string;
    description?: string;
    start: { date?: string; dateTime?: string; timeZone?: string };
    end: { date?: string; dateTime?: string; timeZone?: string };
    status?: string;
    [key: string]: unknown;
  }>;
  busyPeriods: Array<{
    eventId: string;
    summary: string;
    start: string;
    end: string;
    isAllDay: boolean;
    location?: string;
  }>;
  freeSlots: Array<{
    start: string;
    end: string;
    durationMinutes: number;
    isBusinessHours?: boolean;
  }>;
  availability: {
    totalEvents: number;
    totalBusyPeriods: number;
    totalFreeSlots: number;
    longestFreeSlot: number;
  };
  nextPageToken?: string;
};

type GetAvailabilityResp =
  | { success: true; data: AvailabilityData }
  | { success: false; error: string; data: null };

type CheckSlotResp =
  | {
    success: true;
    data: {
      isAvailable: boolean;
      requestedSlot: { start: string; end: string; durationMinutes: number };
      conflicts: Array<{ summary: string; start: string; end: string }>;
      alternativeSlots: Array<{ start: string; end: string; durationMinutes: number }>;
      calendarSummary: string;
    };
  }
  | { success: false; error: string };

function isoNow(): string {
  return new Date().toISOString();
}
function isoPlusDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

export default function CalendarAvailabilityTester() {
  const getCalendarEventsWithAvailability = useAction(
    api.calendar.getCalendarEventsWithAvailability
  );
  const checkTimeSlotAvailability = useAction(api.calendar.checkTimeSlotAvailability);

  // Simple inputs
  const [userId, setUserId] = React.useState<string>("");
  const [calendarId, setCalendarId] = React.useState<string>("");
  const [timeMin, setTimeMin] = React.useState<string>(isoNow());
  const [timeMax, setTimeMax] = React.useState<string>(isoPlusDays(7));
  const [timezone, setTimezone] = React.useState<string>("America/Toronto");

  // Slot check inputs
  const [reqStart, setReqStart] = React.useState<string>(isoPlusDays(1));
  const [reqEnd, setReqEnd] = React.useState<string>(isoPlusDays(1));

  // Results
  const [avail, setAvail] = React.useState<AvailabilityData | null>(null);
  const [availErr, setAvailErr] = React.useState<string | null>(null);
  const [checking, setChecking] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState<boolean>(false);

  const [slotResult, setSlotResult] = React.useState<CheckSlotResp | null>(null);

  async function handleLoadAvailability() {
    setLoading(true);
    setAvail(null);
    setAvailErr(null);
    setSlotResult(null);
    try {
      const resp = (await getCalendarEventsWithAvailability({
        userId: userId as Id<"users">, // Convex Id<"users"> in your app — paste a valid value here while testing
        calendarId,
        timeMin,
        timeMax,
        singleEvents: true,
        maxResults: 250,
        timezone,
      })) as GetAvailabilityResp;

      if (!resp.success) {
        setAvailErr(resp.error);
      } else {
        setAvail(resp.data);
      }
    } catch (e: unknown) {
      setAvailErr(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  async function handleCheckSlot() {
    setChecking(true);
    setSlotResult(null);
    try {
      const resp = (await checkTimeSlotAvailability({
        userId: userId as Id<"users">, // Convex Id<"users"> again
        calendarId,
        requestedStart: reqStart,
        requestedEnd: reqEnd,
        timezone,
      })) as CheckSlotResp;
      setSlotResult(resp);
    } catch (e: unknown) {
      setSlotResult({ success: false, error: e instanceof Error ? e.message : String(e) });
    } finally {
      setChecking(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl p-6 space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Calendar Availability — Lightweight Tester</h1>
        <p className="text-sm opacity-80">
          Enter a valid Convex <code>userId</code> and Google <code>calendarId</code>, pick a
          range, and load availability. Then test a specific time slot.
        </p>
      </header>

      {/* Inputs */}
      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border p-4 space-y-3">
          <h2 className="font-medium">Calendar Inputs</h2>

          <label className="block text-sm">
            User ID (Convex Id&lt;&quot;users&quot;&gt;)
            <input
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
              placeholder="e.g., jf2k3h2k1l0m9n..."
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            />
          </label>

          <label className="block text-sm">
            Calendar ID
            <input
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
              placeholder="primary or <calendarId>@group.calendar.google.com"
              value={calendarId}
              onChange={(e) => setCalendarId(e.target.value)}
            />
          </label>

          <label className="block text-sm">
            Time Min (RFC3339/ISO 8601)
            <input
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
              value={timeMin}
              onChange={(e) => setTimeMin(e.target.value)}
            />
          </label>

          <label className="block text-sm">
            Time Max (RFC3339/ISO 8601)
            <input
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
              value={timeMax}
              onChange={(e) => setTimeMax(e.target.value)}
            />
          </label>

          <label className="block text-sm">
            Timezone (for business-hours trim)
            <input
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              placeholder="America/Toronto"
            />
          </label>

          <button
            onClick={handleLoadAvailability}
            disabled={loading || !userId || !calendarId}
            className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-white text-sm font-medium disabled:opacity-50"
          >
            {loading ? "Loading…" : "Load Availability"}
          </button>

          {availErr && (
            <p className="text-sm text-red-600">Error loading availability: {availErr}</p>
          )}
        </div>

        <div className="rounded-xl border p-4 space-y-3">
          <h2 className="font-medium">Check a Specific Slot</h2>

          <label className="block text-sm">
            Requested Start (ISO)
            <input
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
              value={reqStart}
              onChange={(e) => setReqStart(e.target.value)}
            />
          </label>

          <label className="block text-sm">
            Requested End (ISO)
            <input
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
              value={reqEnd}
              onChange={(e) => setReqEnd(e.target.value)}
            />
          </label>

          <button
            onClick={handleCheckSlot}
            disabled={checking || !userId || !calendarId}
            className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-white text-sm font-medium disabled:opacity-50"
          >
            {checking ? "Checking…" : "Check Slot Availability"}
          </button>

          {slotResult && (
            <div className="mt-2 rounded-md border p-3 text-sm">
              {!slotResult.success ? (
                <p className="text-red-600">Error: {slotResult.error}</p>
              ) : (
                <>
                  <p className="font-medium">
                    Result: {slotResult.data.isAvailable ? "✅ Available" : "❌ Conflict"}
                  </p>
                  <p className="opacity-80">
                    {slotResult.data.calendarSummary} — duration {Math.round(
                      slotResult.data.requestedSlot.durationMinutes
                    )}{" "}
                    min
                  </p>

                  {!slotResult.data.isAvailable && slotResult.data.conflicts.length > 0 && (
                    <>
                      <p className="mt-2 font-medium">Conflicts</p>
                      <ul className="list-disc pl-5">
                        {slotResult.data.conflicts.map((c, i) => (
                          <li key={i} className="break-all">
                            {c.summary || "(No title)"} — {c.start} → {c.end}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}

                  {slotResult.data.alternativeSlots.length > 0 && (
                    <>
                      <p className="mt-2 font-medium">Suggested Alternatives</p>
                      <ul className="list-disc pl-5">
                        {slotResult.data.alternativeSlots.map((s, i) => (
                          <li key={i} className="break-all">
                            {s.start} → {s.end} ({Math.round(s.durationMinutes)} min)
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Results */}
      {avail && (
        <section className="rounded-xl border p-4 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-medium">Availability Loaded</h2>
              <p className="text-sm opacity-80">
                Calendar: <span className="font-mono">{avail.calendarId}</span>
                {avail.calendarSummary ? ` — ${avail.calendarSummary}` : ""} | API TZ:{" "}
                {avail.timeZone ?? "n/a"}
              </p>
              <p className="text-sm opacity-80">
                Query: {avail.queryRange.start} → {avail.queryRange.end}
              </p>
            </div>
            <div className="text-sm">
              <span className="mr-3">
                Events: <strong>{avail.availability.totalEvents}</strong>
              </span>
              <span className="mr-3">
                Busy: <strong>{avail.availability.totalBusyPeriods}</strong>
              </span>
              <span className="mr-3">
                Free slots: <strong>{avail.availability.totalFreeSlots}</strong>
              </span>
              <span>
                Longest free: <strong>{Math.round(avail.availability.longestFreeSlot)}m</strong>
              </span>
            </div>
          </div>

          <details className="rounded-lg border p-3">
            <summary className="cursor-pointer font-medium">Busy Periods</summary>
            {avail.busyPeriods.length === 0 ? (
              <p className="text-sm opacity-80 mt-2">None</p>
            ) : (
              <ul className="mt-2 space-y-2 text-sm">
                {avail.busyPeriods.map((b) => (
                  <li key={b.eventId} className="rounded-md border p-2 break-all">
                    <div className="font-medium">{b.summary || "(No title)"}</div>
                    <div className="opacity-80">{b.start} → {b.end}</div>
                    {b.isAllDay && <div className="text-xs italic">All-day</div>}
                    {b.location && <div className="text-xs">📍 {b.location}</div>}
                  </li>
                ))}
              </ul>
            )}
          </details>

          <details className="rounded-lg border p-3">
            <summary className="cursor-pointer font-medium">Free Slots</summary>
            {avail.freeSlots.length === 0 ? (
              <p className="text-sm opacity-80 mt-2">None</p>
            ) : (
              <ul className="mt-2 space-y-2 text-sm">
                {avail.freeSlots.map((f, idx) => (
                  <li key={idx} className="rounded-md border p-2 break-all">
                    <div className="opacity-80">{f.start} → {f.end}</div>
                    <div className="text-xs">~ {Math.round(f.durationMinutes)} minutes</div>
                    {f.isBusinessHours && <div className="text-xs italic">Within business hours</div>}
                  </li>
                ))}
              </ul>
            )}
          </details>

          <details className="rounded-lg border p-3">
            <summary className="cursor-pointer font-medium">Raw JSON</summary>
            <pre className="mt-2 overflow-auto rounded bg-gray-950 p-3 text-xs text-gray-100">
              {JSON.stringify(avail, null, 2)}
            </pre>
          </details>
        </section>
      )}
    </div>
  );
}
