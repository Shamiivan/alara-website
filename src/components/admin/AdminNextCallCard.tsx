"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api"; // ⟵ Adjust the path if your api export differs
import { utcToLocalFields, localFieldsToUtcISO } from "@/lib/utils";

/**
 * AdminNextCallCard — schedule a user's next call by EMAIL
 *
 * What it does
 * - Lets an admin type an email + choose date, time, timezone
 * - Converts the chosen local time to a UTC ISO string
 * - Calls Convex mutation `calls.createCall({ email, callTime })`
 *   where `callTime` is UTC ISO (e.g. "2025-08-26T18:30:00.000Z")
 *
 * Props (all optional):
 *   defaultEmail?: string    // prefill the email field
 *   initialUtc?: string      // e.g., "2025-08-26T18:30:00Z" (used to prefill date/time display)
 *   initialTimeZone?: string // e.g., "America/Toronto"
 *   compact?: boolean        // smaller padding / tighter layout
 *   onSuccess?: (payload: { email: string; utcISO: string }) => void
 */

type Props = {
  defaultEmail?: string;
  initialUtc?: string | null;
  initialTimeZone?: string | null;
  compact?: boolean;
};

export default function AdminNextCallCard({
  defaultEmail = "",
  initialUtc,
  initialTimeZone,
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
    success: "#059669",
    danger: "#DC2626",
    radius: 12,
    shadow: "0 1px 2px rgba(16,24,40,0.04), 0 8px 24px rgba(16,24,40,0.06)",
  } as const;

  // Convex mutation: update with your actual namespace if different
  const createCall = useMutation(api.admin.schedule.createCall);

  /* ---------- Timezone helpers ---------- */
  const defaultTZ = useMemo(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    } catch {
      return "UTC";
    }
  }, []);

  const allTimeZones = useMemo(() => {
    // Check for browser support of Intl.supportedValuesOf
    if (Intl.supportedValuesOf) {
      const vals = Intl.supportedValuesOf("timeZone") as string[];
      return vals?.length
        ? vals
        : ["UTC", "America/Toronto", "America/New_York", "Europe/London"];
    }
    return [
      "UTC",
      "America/Toronto",
      "America/New_York",
      "Europe/London",
      "Europe/Paris",
      "Asia/Tokyo",
    ];
  }, []);

  /* ---------- Local state ---------- */
  const [email, setEmail] = useState<string>(defaultEmail);
  const [timeZone, setTimeZone] = useState<string>(initialTimeZone || defaultTZ);
  const [dateStr, setDateStr] = useState<string>(""); // yyyy-mm-dd
  const [timeStr, setTimeStr] = useState<string>(""); // HH:MM
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ kind: "success" | "error"; msg: string } | null>(null);

  /* ---------- Validation ---------- */
  const emailValid = useMemo(() => {
    if (!email) return false;
    // basic, pragmatic email check
    return /.+@.+\..+/.test(email);
  }, [email]);

  /* ---------- Formatting helpers (from utils) ---------- */

  /* ---------- Initialize date/time fields ---------- */
  useEffect(() => {
    if (initialUtc) {
      const { date, time } = utcToLocalFields(initialUtc, timeZone);
      setDateStr(date);
      setTimeStr(time);
    } else {
      // Default: next full hour in selected TZ
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

      const get = (t: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === t)?.value || "";

      const yyyy = parseInt(get("year"), 10);
      const mm = parseInt(get("month"), 10);
      const dd = parseInt(get("day"), 10);
      let hh = parseInt(get("hour"), 10);
      hh = (hh + 1) % 24;

      const pad = (n: number) => String(n).padStart(2, "0");
      setDateStr(`${yyyy}-${pad(mm)}-${pad(dd)}`);
      setTimeStr(`${pad(hh)}:00`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialUtc]);

  /* ---------- Display header string ---------- */
  const displayLine = useMemo(() => {
    if (!dateStr || !timeStr) return "Not set yet";
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
    (rowStyle as React.CSSProperties).gridTemplateColumns = "1.2fr 1fr 1fr 1.2fr"; // email, date, time, tz
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
    setToast(null);
    if (!emailValid) {
      setToast({ kind: "error", msg: "Please enter a valid email." });
      return;
    }
    if (!dateStr || !timeStr) {
      setToast({ kind: "error", msg: "Please choose a date and time." });
      return;
    }
    const utcISO = localFieldsToUtcISO(dateStr, timeStr, timeZone);
    if (!utcISO) {
      setToast({ kind: "error", msg: "Could not compute UTC time. Try again." });
      return;
    }
    setSaving(true);
    try {
      await createCall({ email, callTime: utcISO });
      setToast({ kind: "success", msg: `Scheduled call for ${email}` });
    } catch (err: unknown) {
      console.error("[AdminNextCallCard] createCall error:", err);
      setToast({
        kind: "error",
        msg: err instanceof Error ? err.message : "Failed to schedule call."
      });
    } finally {
      setSaving(false);
    }
  }

  function handleNow() {
    // Snap to nearest upcoming 15-min slot in selected TZ
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

    const get = (t: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === t)?.value || "";

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
    setDateStr(`${yyyy}-${pad(mm)}-${pad(dd)}`);
    setTimeStr(`${pad(hh)}:${pad(mi)}`);
  }

  /* ---------- Render ---------- */
  return (
    <div style={cardStyle} aria-live="polite">
      <style>{`
        .tap:hover { transform: translateY(-1px); }
        .tap:active { transform: translateY(0); }
        .toast { border-radius: 10px; padding: 10px 12px; font-size: 14px; }
      `}</style>

      <div style={h2Style}>Schedule Next Call (Admin)</div>
      <div style={lineStyle}>
        Selected time: {" "}
        <span style={{ background: TOKENS.accent, padding: "2px 6px", borderRadius: 6 }}>
          {displayLine}
        </span>
      </div>
      <div style={subStyle}>
        Choose a time in the user&apos;s local timezone (right column). We&apos;ll convert it to UTC.
      </div>

      <div style={rowStyle}>
        <div>
          <label htmlFor="nc-email" style={labelStyle}>User Email</label>
          <input
            id="nc-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="user@example.com"
            style={inputStyle}
          />
        </div>
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
          disabled={saving || !emailValid || !dateStr || !timeStr}
          style={{
            ...primaryBtn,
            opacity: saving ? 0.7 : 1,
            backgroundColor: saving ? TOKENS.primaryHover : TOKENS.primary,
          }}
        >
          {saving ? "Scheduling…" : "Schedule call"}
        </button>
        <button className="tap" onClick={handleNow} style={secondaryBtn}>
          Use current time (rounded)
        </button>
      </div>

      {toast && (
        <div
          className="toast"
          role="alert"
          style={{
            marginTop: 12,
            backgroundColor: toast.kind === "success" ? "#ECFDF5" : "#FEF2F2",
            border: `1px solid ${toast.kind === "success" ? "#D1FAE5" : "#FEE2E2"}`,
            color: toast.kind === "success" ? TOKENS.success : TOKENS.danger,
          }}
        >
          {toast.msg}
        </div>
      )}
    </div>
  );
}

/**
 * Usage:
 * <AdminNextCallCard
 *   defaultEmail="alice@example.com"
 *   initialTimeZone="America/Toronto"
 *   onSuccess={({ email, utcISO }) => console.log("Scheduled:", email, utcISO)}
 * />
 */
