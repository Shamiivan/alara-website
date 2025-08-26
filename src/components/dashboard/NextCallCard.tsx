"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
/**
 * NextCallCard — lightweight, insertable card
 * - Displays: "Your next call is scheduled at …"
 * - Editable: date, time, timezone
 * - Returns: UTC ISO string + timezone + local fields via onSave
 *
 * Props:
 *   initialUtc?: string            // e.g., "2025-08-26T18:30:00Z"
 *   initialTimeZone?: string       // e.g., "America/Toronto"
 *   onSave: (data: {
 *     utcISO: string;
 *     timeZone: string;
 *     local: { date: string; time: string };
 *   }) => Promise<void> | void
 *   onCancel?: () => void
 *   compact?: boolean              // smaller padding / tighter layout
 */

type Props = {
  initialUtc?: string | null;
  initialTimeZone?: string | null;
  onSave: (data: {
    utcISO: string;
    timeZone: string;
    local: { date: string; time: string };
  }) => Promise<void> | void;
  onCancel?: () => void;
  compact?: boolean;
};

export default function NextCallCard({
  initialUtc,
  initialTimeZone,
  onSave,
  onCancel,
  compact = false,
}: Props) {
  /* ---------- Design Tokens (inline, no external CSS) ---------- */
  const TOKENS = {
    bg: "#F8FAFC",
    cardBg: "#FFFFFF",
    text: "#0F172A",
    subtext: "#475569",
    border: "#E2E8F0",
    primary: "#4F46E5",
    primaryHover: "#4338CA",
    accent: "#E0E7FF",
    radius: 12,
    shadow:
      "0 1px 2px rgba(16,24,40,0.04), 0 8px 24px rgba(16,24,40,0.06)",
  };

  // get current user
  const user = useQuery(api.user.getCurrentUser);
  const updateCallTime = useMutation(api.user.updateCallTime);

  /* ---------- Timezone helpers ---------- */
  // Robustly get a default TZ
  const defaultTZ = useMemo(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    } catch {
      return "UTC";
    }
  }, []);

  const timezone = useMemo(() => user?.timezone || defaultTZ, [user, defaultTZ]);
  const allTimeZones = useMemo(() => {
    // Prefer modern API; fallback to a compact list if unavailable.
    // (Keeps bundle small while still offering common choices)
    // You can replace the fallback with a full list later if you like.
    // Check for browser support of Intl.supportedValuesOf
    if (Intl.supportedValuesOf) {
      const vals = Intl.supportedValuesOf("timeZone") as string[];
      return vals?.length ? vals : ["UTC", "America/Toronto", "America/New_York", "Europe/London"];
    }
    return ["UTC", "America/Toronto", "America/New_York", "Europe/London", "Europe/Paris", "Asia/Tokyo"];
  }, []);

  /* ---------- Local state ---------- */
  const [timeZone, setTimeZone] = useState<string>(initialTimeZone || defaultTZ);
  const [dateStr, setDateStr] = useState<string>("");  // yyyy-mm-dd
  const [timeStr, setTimeStr] = useState<string>("");  // HH:MM (24h)
  const [saving, setSaving] = useState(false);

  /* ---------- Formatting helpers (no libs) ---------- */

  // Given a UTC ISO string, return {date, time} strings rendered in a target timeZone.
  function utcToLocalFields(utcISO: string, tz: string) {
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
   * Convert a "wall clock" local time in a named IANA TZ to a UTC ISO string.
   *
   * Technique (no Temporal / no luxon):
   * 1) Build a UTC date from the provided local components.
   * 2) Compute the offset for that instant in the target TZ by taking the UTC
   *    instant and formatting it in the TZ, then rebuilding a "pretend UTC" date
   *    from those parts; the difference is the offset.
   * 3) Subtract offset from the UTC-built timestamp to get the true UTC instant.
   *
   * This handles DST correctly for modern browsers.
   */
  function localFieldsToUtcISO(dateYYYYMMDD: string, timeHHMM: string, tz: string) {
    if (!dateYYYYMMDD || !timeHHMM) return "";

    const [y, m, d] = dateYYYYMMDD.split("-").map((v) => parseInt(v, 10));
    const [hh, mm] = timeHHMM.split(":").map((v) => parseInt(v, 10));

    // Step 1: a naive "UTC container" for those local parts
    const naiveUtcMs = Date.UTC(y, (m || 1) - 1, d || 1, hh || 0, mm || 0, 0, 0);
    const naiveUtcDate = new Date(naiveUtcMs);

    // Step 2: get parts of that UTC instant as seen in the target TZ
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

    // "Pretend" UTC built from the TZ-rendered parts
    const pretendUtcMs = Date.UTC(tzYear, tzMonth - 1, tzDay, tzHour, tzMin, tzSec, 0);

    // The offset between how the UTC instant looks in TZ vs real UTC instant
    const offsetMs = pretendUtcMs - naiveUtcMs;

    // Step 3: true UTC for the intended local wall time = naiveUtcMs - offset
    const trueUtcMs = naiveUtcMs - offsetMs;

    return new Date(trueUtcMs).toISOString();
  }

  /* ---------- Initialize local editable fields from props ---------- */
  useEffect(() => {
    if (initialUtc) {
      const { date, time } = utcToLocalFields(initialUtc, timeZone);
      setDateStr(date);
      setTimeStr(time);
    } else {
      // Default: next full hour from "now" in selected TZ
      // We'll take "now" in selected TZ via formatting to parts
      const now = new Date();
      const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: timeZone,
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
      // round up to next hour
      hh = (hh + 1) % 24;

      const pad = (n: number) => String(n).padStart(2, "0");

      setDateStr(`${yyyy}-${pad(mm)}-${pad(dd)}`);
      setTimeStr(`${pad(hh)}:00`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialUtc]); // leave TZ out so switching TZ doesn't auto-clobber user edits

  /* ---------- Display string for the header ---------- */
  const displayLine = useMemo(() => {
    if (!dateStr || !timeStr) return "Not set yet";
    // Build a preview using the chosen TZ
    const iso = localFieldsToUtcISO(dateStr, timeStr, timeZone);
    if (!iso) return "Not set yet";
    const d = new Date(iso);

    const formatted = new Intl.DateTimeFormat(undefined, {
      timeZone,
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZoneName: "short",
    }).format(d);

    return formatted;
  }, [dateStr, timeStr, timeZone]);

  /* ---------- Styles ---------- */
  const cardStyle: React.CSSProperties = {
    backgroundColor: TOKENS.cardBg,
    border: `1px solid ${TOKENS.border}`,
    borderRadius: TOKENS.radius,
    padding: compact ? 16 : 24,
    boxShadow: TOKENS.shadow,
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 600,
    color: TOKENS.subtext,
    marginBottom: 6,
    display: "block",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    border: `1px solid ${TOKENS.border}`,
    borderRadius: 10,
    padding: "10px 12px",
    fontSize: 14,
    color: TOKENS.text,
    backgroundColor: "#FFFFFF",
  };

  const rowStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: 12,
  };

  if (typeof window !== "undefined" && window.innerWidth >= 640) {
    (rowStyle as React.CSSProperties).gridTemplateColumns = "1fr 1fr 1.2fr";
  }

  const h2Style: React.CSSProperties = {
    fontSize: 14,
    fontWeight: 700,
    color: TOKENS.text,
    marginBottom: 10,
    letterSpacing: "-0.01em",
  };

  const lineStyle: React.CSSProperties = {
    fontSize: 16,
    fontWeight: 600,
    color: TOKENS.text,
    marginBottom: 14,
  };

  const subStyle: React.CSSProperties = {
    fontSize: 12,
    color: TOKENS.subtext,
    marginBottom: 12,
  };

  const btnRow: React.CSSProperties = {
    display: "flex",
    gap: 8,
    marginTop: 14,
    flexWrap: "wrap",
  };

  const primaryBtn: React.CSSProperties = {
    backgroundColor: TOKENS.primary,
    color: "#FFFFFF",
    padding: "10px 14px",
    borderRadius: 10,
    border: `1px solid ${TOKENS.primary}`,
    fontWeight: 700,
    cursor: "pointer",
    transition: "background-color 150ms ease, transform 150ms ease",
  };

  const secondaryBtn: React.CSSProperties = {
    backgroundColor: "#FFFFFF",
    color: TOKENS.text,
    padding: "10px 14px",
    borderRadius: 10,
    border: `1px solid ${TOKENS.border}`,
    fontWeight: 600,
    cursor: "pointer",
    transition: "background-color 150ms ease, transform 150ms ease",
  };

  /* ---------- Handlers ---------- */
  async function handleSave() {
    if (!dateStr || !timeStr) return;
    const utcISO = localFieldsToUtcISO(dateStr, timeStr, timeZone);
    if (!utcISO) return;
    console.log("Saved new call time", { utcISO, timeZone, local: { date: dateStr, time: timeStr } });
    console.log("User", user);
    console.log("Timezone", timezone);
    setSaving(true);
    try {
      await updateCallTime({ callTime: utcISO });
      // Call the onSave prop with the saved data
      onSave?.({ utcISO, timeZone, local: { date: dateStr, time: timeStr } });
    } finally {
      setSaving(false);
    }
  }

  function handleNow() {
    // Snap fields to the next 15-min slot in selected TZ
    const now = new Date();
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: timeZone,
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

    // round up to nearest 15
    const rounded = Math.ceil(mi / 15) * 15;
    if (rounded === 60) {
      mi = 0;
      hh = (hh + 1) % 24;
    } else {
      mi = rounded;
    }

    const pad = (n: number) => String(n).padStart(2, "0");
    setDateStr(`${yyyy}-${pad(mm)}-${pad(dd)}`);
    setTimeStr(`${pad(hh)}:${pad(mi)}`);
  }

  /* ---------- Render ---------- */
  return (
    <div style={cardStyle} aria-live="polite">
      <style>{`
        .tap:hover { transform: translateY(-1px); }
        .tap:active { transform: translateY(0); }
      `}</style>

      <div style={h2Style}>Next Call</div>
      <div style={lineStyle}>
        Your next call is scheduled at{" "}
        <span style={{ background: TOKENS.accent, padding: "2px 6px", borderRadius: 6 }}>
          {displayLine}
        </span>
        .
      </div>
      <div style={subStyle}>
        Times are shown in{" "}
        <strong>{timeZone}</strong>. You can adjust the date, time, or timezone below.
      </div>

      <div style={rowStyle}>
        <div>
          <label htmlFor="nc-date" style={labelStyle}>Date</label>
          <input
            id="nc-date"
            type="date"
            value={dateStr}
            onChange={(e) => setDateStr(e.target.value)}
            style={inputStyle}
          />
        </div>
        <div>
          <label htmlFor="nc-time" style={labelStyle}>Time</label>
          <input
            id="nc-time"
            type="time"
            value={timeStr}
            onChange={(e) => setTimeStr(e.target.value)}
            style={inputStyle}
          />
        </div>
        <div>
          <label htmlFor="nc-tz" style={labelStyle}>Timezone</label>
          <select
            id="nc-tz"
            value={timeZone}
            onChange={(e) => setTimeZone(e.target.value)}
            style={{ ...inputStyle, height: 42 }}
          >
            {/* Keep the user's current/auto TZ near the top */}
            {[timeZone, defaultTZ, "UTC"]
              .filter((v, i, arr) => arr.indexOf(v) === i)
              .map((tz) => (
                <option key={`pinned-${tz}`} value={tz}>{tz}</option>
              ))}
            <optgroup label="All timezones">
              {allTimeZones.map((tz) => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </optgroup>
          </select>
        </div>
      </div>

      <div style={btnRow}>
        <button
          className="tap"
          onClick={handleSave}
          disabled={saving || !dateStr || !timeStr}
          style={{
            ...primaryBtn,
            opacity: saving ? 0.7 : 1,
            backgroundColor: saving ? TOKENS.primaryHover : TOKENS.primary,
          }}
        >
          {saving ? "Saving…" : "Save schedule"}
        </button>
        <button
          className="tap"
          onClick={handleNow}
          style={secondaryBtn}
        >
          Use current time (rounded)
        </button>
        {onCancel && (
          <button
            className="tap"
            onClick={onCancel}
            style={secondaryBtn}
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
