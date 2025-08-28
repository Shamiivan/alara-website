// app/dev/InitiateCallWithCalendarTest.tsx
"use client";

import * as React from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";

type Props = {
  /** Optional: default values to speed up testing */
  defaults?: Partial<{
    userId: Id<"users">;
    calendarId: string;
    toNumber: string; // E.164 recommended e.g. +15145551234
    userName: string;
    timezone: string;
  }>;
};

/**
 * Minimal, safe test harness for the Convex action:
 * initiateCallWithCalendarData
 *
 * - Validates required fields
 * - Pre-fills timezone from browser
 * - Shows request/response JSON
 * - Clear success/error states
 */
export default function InitiateCallWithCalendarTest({ defaults }: Props) {
  // If you have an API to get the current user, you can fetch it here.
  // Otherwise you can pass userId via props.defaults.
  const me = useQuery(api.user.getCurrentUser); // Optional: remove if not available

  const initiateCall = useAction(api.calls_node.initiateCallWithCalendarData);

  const [userId, setUserId] = React.useState<Id<"users"> | "">(
    (defaults?.userId as Id<"users">) ?? (me?._id ?? "")
  );
  const [calendarId, setCalendarId] = React.useState<string>(defaults?.calendarId ?? "");
  const [toNumber, setToNumber] = React.useState<string>(defaults?.toNumber ?? "");
  const [userName, setUserName] = React.useState<string>(defaults?.userName ?? me?.name ?? "");
  const [timezone, setTimezone] = React.useState<string>(
    defaults?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone ?? "America/Toronto"
  );

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [message, setMessage] = React.useState<{ type: "success" | "error"; text: string } | null>(
    null
  );
  const [lastRequest, setLastRequest] = React.useState<any>(null);
  const [lastResponse, setLastResponse] = React.useState<any>(null);

  const validate = React.useCallback(() => {
    const errs: string[] = [];
    if (!userId) errs.push("userId is required.");
    if (!calendarId) errs.push("calendarId is required.");
    if (!toNumber) errs.push("toNumber is required (use E.164, e.g., +15145551234).");
    if (!timezone) errs.push("timezone is required (e.g., America/Toronto).");
    return errs;
  }, [userId, calendarId, toNumber, timezone]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setLastRequest(null);
    setLastResponse(null);

    const errs = validate();
    if (errs.length) {
      setMessage({ type: "error", text: errs.join(" ") });
      return;
    }

    const requestPayload = {
      userId: userId as Id<"users">,
      toNumber,
      calendarId,
      userName: userName || undefined,
      timezone: timezone || undefined,
    };

    setIsSubmitting(true);
    setLastRequest(requestPayload);

    try {
      const res = await initiateCall(requestPayload);
      setLastResponse(res);
      if (res?.success) {
        setMessage({
          type: "success",
          text:
            res.message ||
            `Success! callId=${res.callId ?? "(n/a)"} elevenLabsCallId=${res.elevenLabsCallId ?? "(n/a)"}`,
        });
      } else {
        setMessage({
          type: "error",
          text: res?.message || "Action returned success=false.",
        });
      }
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err?.message ?? String(err),
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  function autofillForDemo() {
    // Helper to quickly load some demo-ish values
    if (!toNumber) setToNumber("+15555550123");
    if (!calendarId) setCalendarId("primary"); // or a real calendarId
    if (!userName && me?.name) setUserName(me.name);
  }

  return (
    <div className="mx-auto max-w-2xl p-4 sm:p-6 rounded-2xl border bg-[hsl(var(--background))]">
      <h1 className="text-xl font-semibold mb-2">Initiate Call (with Calendar Data) — Test</h1>
      <p className="text-sm opacity-80 mb-4">
        This form calls <code>api.calls.initiateCallWithCalendarData</code> and displays the raw
        response below.
      </p>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <label className="grid gap-1">
            <span className="text-sm font-medium">User ID (Convex Id&lt;"users"&gt;)</span>
            <input
              className="rounded-lg border px-3 py-2"
              value={userId ?? ""}
              onChange={(e) => setUserId(e.target.value as Id<"users">)}
              placeholder="e.g. kj3n2x1y2z0abcd1efg2hi3j"
            />
          </label>

          <label className="grid gap-1">
            <span className="text-sm font-medium">Calendar ID</span>
            <input
              className="rounded-lg border px-3 py-2"
              value={calendarId}
              onChange={(e) => setCalendarId(e.target.value)}
              placeholder="e.g. primary or long@group.calendar.google.com"
            />
          </label>

          <div className="grid sm:grid-cols-2 gap-4">
            <label className="grid gap-1">
              <span className="text-sm font-medium">To Number (E.164)</span>
              <input
                className="rounded-lg border px-3 py-2"
                value={toNumber}
                onChange={(e) => setToNumber(e.target.value)}
                placeholder="+15145551234"
              />
            </label>

            <label className="grid gap-1">
              <span className="text-sm font-medium">User Name (optional)</span>
              <input
                className="rounded-lg border px-3 py-2"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="There"
              />
            </label>
          </div>

          <label className="grid gap-1">
            <span className="text-sm font-medium">Timezone (IANA)</span>
            <input
              className="rounded-lg border px-3 py-2"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              placeholder="America/Toronto"
            />
          </label>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg px-4 py-2 border font-medium hover:opacity-90 disabled:opacity-60"
          >
            {isSubmitting ? "Calling…" : "Initiate Call"}
          </button>

          <button
            type="button"
            onClick={autofillForDemo}
            disabled={isSubmitting}
            className="rounded-lg px-3 py-2 text-sm border hover:opacity-90"
          >
            Autofill demo values
          </button>
        </div>
      </form>

      {message && (
        <div
          className={`mt-4 rounded-lg border p-3 text-sm ${message.type === "success" ? "border-green-400" : "border-red-400"
            }`}
        >
          {message.text}
        </div>
      )}

      <div className="mt-6 grid gap-3">
        <section className="rounded-lg border p-3">
          <h2 className="font-medium mb-2">Last Request</h2>
          <pre className="text-xs overflow-auto">
            {lastRequest ? JSON.stringify(lastRequest, null, 2) : "—"}
          </pre>
        </section>

        <section className="rounded-lg border p-3">
          <h2 className="font-medium mb-2">Last Response</h2>
          <pre className="text-xs overflow-auto">
            {lastResponse ? JSON.stringify(lastResponse, null, 2) : "—"}
          </pre>
        </section>
      </div>
    </div>
  );
}
