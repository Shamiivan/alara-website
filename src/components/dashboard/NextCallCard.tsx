"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
  getDefaultTimeZone,
  getAllTimeZones,
  utcToLocalFields,
  localFieldsToUtcISO,
  roundNowToNext15,
} from "@/lib/utils";
import { SecondaryButton, LinkButton } from "@/components/ui/CustomButton";
import { TOKENS } from "@/components/tokens";

/**
 * Recommended (optional) new TOKENS keys in tokens.ts:
 * badgeBg, badgeText, inputBg, focus, info, infoBg, warnBg, warn
 * Example:
 * badgeBg: "rgba(224,231,255,0.6)",
 * badgeText: "#111827",
 * inputBg: "#FFFFFF",
 * focus: "0 0 0 3px rgba(79,70,229,0.25)",
 * info: "#2563EB",
 * infoBg: "rgba(37,99,235,0.10)",
 * warn: "#B45309",
 * warnBg: "rgba(245,158,11,0.12)",
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
  const user = useQuery(api.user.getCurrentUser);
  const updateCallTime = useMutation(api.user.updateCallTime);

  const defaultTZ = useMemo(() => getDefaultTimeZone(), []);
  const pulledTZ = user?.timezone || initialTimeZone || defaultTZ;

  const [timeZone, setTimeZone] = useState<string>(pulledTZ);
  const [dateStr, setDateStr] = useState<string>(""); // yyyy-mm-dd
  const [timeStr, setTimeStr] = useState<string>(""); // HH:MM (24h)
  const [saving, setSaving] = useState(false);
  const [showTzPicker, setShowTzPicker] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allTimeZones = useMemo(() => getAllTimeZones(), []);

  // Initialize fields
  useEffect(() => {
    const utcSource = user?.callTimeUtc || initialUtc;
    const tzSource = user?.timezone || pulledTZ;

    if (utcSource) {
      const { date, time } = utcToLocalFields(utcSource, tzSource);
      setDateStr(date);
      setTimeStr(time);
      setTimeZone(tzSource);
    } else {
      // Friendly default: next round hour in user's tz
      const { date, time } = roundNowToNext15(tzSource);
      setDateStr(date);
      setTimeStr(time);
      setTimeZone(tzSource);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.callTimeUtc, user?.timezone, initialUtc, pulledTZ]);

  // Nicely formatted primary line
  const displayLine = useMemo(() => {
    if (!dateStr || !timeStr) return "Not set yet";
    const iso = localFieldsToUtcISO(dateStr, timeStr, timeZone);
    if (!iso) return "Not set yet";
    const d = new Date(iso);
    const long = new Intl.DateTimeFormat(undefined, {
      timeZone,
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZoneName: "short",
    }).format(d);
    return long;
  }, [dateStr, timeStr, timeZone]);

  // A small relative hint (e.g., “in 2h 15m”, “tomorrow”)
  const relativeHint = useMemo(() => {
    if (!dateStr || !timeStr) return "";
    const iso = localFieldsToUtcISO(dateStr, timeStr, timeZone);
    if (!iso) return "";
    const target = new Date(iso).getTime();
    const now = Date.now();
    const diff = target - now;

    const dayMs = 24 * 60 * 60 * 1000;
    const hourMs = 60 * 60 * 1000;
    const minMs = 60 * 1000;

    const abs = Math.abs(diff);
    const sign = diff >= 0 ? 1 : -1;

    // Day-level label
    const today = new Date();
    const targetLocal = new Date(iso);
    const sameDay =
      today.toLocaleDateString(undefined, { timeZone }) ===
      targetLocal.toLocaleDateString(undefined, { timeZone });

    const tomorrow = new Date(today.getTime() + dayMs);
    const isTomorrow =
      tomorrow.toLocaleDateString(undefined, { timeZone }) ===
      targetLocal.toLocaleDateString(undefined, { timeZone });

    if (sameDay && sign > 0) {
      // same day in future
      const h = Math.floor(abs / hourMs);
      const m = Math.round((abs % hourMs) / minMs);
      if (h === 0 && m <= 1) return "in ~1 minute";
      if (h === 0) return `in ${m} min`;
      if (m === 0) return `in ${h} hr`;
      return `in ${h} hr ${m} min`;
    }

    if (isTomorrow && sign > 0) return "tomorrow";

    if (sign < 0) {
      // Past
      const h = Math.floor(abs / hourMs);
      const m = Math.round((abs % hourMs) / minMs);
      if (h === 0 && m <= 1) return "about a minute ago";
      if (h === 0) return `${m} min ago`;
      if (m === 0) return `${h} hr ago`;
      return `${h} hr ${m} min ago`;
    }

    // Far future: just show days
    const days = Math.round(abs / dayMs);
    return days === 1 ? "in 1 day" : `in ${days} days`;
  }, [dateStr, timeStr, timeZone]);

  // ---- Styles (token-driven) ----
  const cardStyle: React.CSSProperties = {
    backgroundColor: TOKENS.cardBg,
    border: `1px solid ${TOKENS.border}`,
    borderRadius: TOKENS.radius,
    padding: compact ? 16 : 20,
    boxShadow: TOKENS.shadow,
  };

  const headerRow: React.CSSProperties = {
    display: "flex",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 8,
  };

  const titleStyle: React.CSSProperties = {
    fontSize: 14,
    fontWeight: 700,
    color: TOKENS.text,
    letterSpacing: "-0.01em",
    display: "flex",
    alignItems: "center",
    gap: 6,
  };

  const hintStyle: React.CSSProperties = {
    fontSize: 12,
    color: TOKENS.subtext,
    opacity: 0.9,
  };

  const badge: React.CSSProperties = {
    display: "inline-block",
    background: TOKENS.badgeBg || TOKENS.accent,
    color: TOKENS.badgeText || TOKENS.text,
    padding: "4px 8px",
    borderRadius: TOKENS.radius,
    fontWeight: 600,
  };

  const lineStyle: React.CSSProperties = {
    fontSize: 16,
    fontWeight: 600,
    color: TOKENS.text,
    marginBottom: 8,
  };

  const subStyle: React.CSSProperties = {
    fontSize: 12,
    color: TOKENS.subtext,
    marginBottom: 12,
  };

  const relativeStyle: React.CSSProperties = {
    fontSize: 12,
    color: TOKENS.subtext,
    background: TOKENS.infoBg || "transparent",
    borderRadius: TOKENS.radius / 2,
    padding: relativeHint ? "2px 6px" : 0,
    display: relativeHint ? "inline-block" : "none",
    marginLeft: 8,
  };

  const rowStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: 12,
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
    borderRadius: TOKENS.radius - 2,
    padding: "10px 12px",
    fontSize: 14,
    color: TOKENS.text,
    backgroundColor: TOKENS.inputBg || "#FFFFFF",
    outline: "none",
  };

  const inputWrap: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  };

  const tinyHelp: React.CSSProperties = {
    fontSize: 11,
    color: TOKENS.subtext,
  };

  const btnRow: React.CSSProperties = {
    display: "flex",
    gap: 8,
    marginTop: 12,
    flexWrap: "wrap",
    alignItems: "center",
  };

  const divider: React.CSSProperties = {
    height: 1,
    background: TOKENS.border,
    margin: "10px 0",
    opacity: 0.8,
  };

  const warnRow: React.CSSProperties = {
    display: error ? "flex" : "none",
    alignItems: "center",
    gap: 8,
    padding: "8px 10px",
    borderRadius: TOKENS.radius,
    background: TOKENS.warnBg || "rgba(245,158,11,0.12)",
    color: TOKENS.warn || "#B45309",
    fontSize: 12,
    marginTop: 8,
  };

  // Validation: avoid past times
  useEffect(() => {
    if (!dateStr || !timeStr) {
      setError(null);
      return;
    }
    const iso = localFieldsToUtcISO(dateStr, timeStr, timeZone);
    if (!iso) {
      setError("That time doesn’t look valid. Try another one?");
      return;
    }
    const target = new Date(iso).getTime();
    if (target < Date.now()) {
      setError("This time is in the past.");
    } else {
      setError(null);
    }
  }, [dateStr, timeStr, timeZone]);

  function nudgeToFuture() {
    // If past, auto-advance to next 15-min slot
    const { date, time } = roundNowToNext15(timeZone);
    setDateStr(date);
    setTimeStr(time);
  }

  async function handleSave() {
    if (!dateStr || !timeStr) return;
    const utcISO = localFieldsToUtcISO(dateStr, timeStr, timeZone);
    if (!utcISO) return;
    setSaving(true);
    try {
      await updateCallTime({ callTime: utcISO });
      onSave?.({ utcISO, timeZone, local: { date: dateStr, time: timeStr } });
    } finally {
      setSaving(false);
    }
  }

  function handleNow() {
    const { date, time } = roundNowToNext15(timeZone);
    setDateStr(date);
    setTimeStr(time);
  }

  return (
    <section
      style={cardStyle}
      aria-live="polite"
      aria-label="Next call scheduler"
    >
      {/* Header */}
      <div style={headerRow}>
        <div style={titleStyle}>
          <span aria-hidden>📞</span>
          <span>Next Call</span>
        </div>
        <span style={hintStyle} aria-label="You can change this anytime">
          you can change the next time we call
        </span>
      </div>

      {/* Primary line */}
      <div style={lineStyle}>
        Scheduled for <span style={badge}>{displayLine}</span>
        <span style={relativeStyle}>{relativeHint}</span>
      </div>
      <div style={subStyle}>
        Shown in <strong>{timeZone}</strong>. Adjust the date/time below.{" "}
        <button
          type="button"
          onClick={() => setShowTzPicker((s) => !s)}
          style={{
            border: "none",
            background: "transparent",
            color: TOKENS.primary,
            textDecoration: "underline",
            cursor: "pointer",
            padding: 0,
            fontSize: 12,
            fontWeight: 600,
            marginLeft: 4,
          }}
          aria-expanded={showTzPicker}
          aria-controls="tz-picker"
        >
          {showTzPicker ? "Hide timezone" : "Change timezone"}
        </button>
      </div>

      {/* Inputs */}
      <div style={rowStyle}>
        <div style={inputWrap}>
          <label htmlFor="nc-date" style={labelStyle}>
            Date
          </label>
          <input
            id="nc-date"
            type="date"
            value={dateStr}
            onChange={(e) => setDateStr(e.target.value)}
            style={inputStyle}
            onFocus={(e) => (e.currentTarget.style.boxShadow = TOKENS.focus || "")}
            onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
          />
          <span style={tinyHelp}>Tip: Today or tomorrow works great.</span>
        </div>

        <div style={inputWrap}>
          <label htmlFor="nc-time" style={labelStyle}>
            Time
          </label>
          <input
            id="nc-time"
            type="time"
            value={timeStr}
            onChange={(e) => setTimeStr(e.target.value)}
            style={inputStyle}
            onFocus={(e) => (e.currentTarget.style.boxShadow = TOKENS.focus || "")}
            onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
          />
          <span style={tinyHelp}>We’ll nudge you a little before the call.</span>
        </div>
      </div>

      {/* Timezone (collapsed by default) */}
      {showTzPicker && (
        <>
          <div style={divider} />
          <div id="tz-picker" style={rowStyle} aria-live="polite">
            <div style={inputWrap}>
              <label htmlFor="nc-tz" style={labelStyle}>
                Timezone
              </label>
              <select
                id="nc-tz"
                value={timeZone}
                onChange={(e) => setTimeZone(e.target.value)}
                style={{ ...inputStyle, height: 42 }}
                onFocus={(e) => (e.currentTarget.style.boxShadow = TOKENS.focus || "")}
                onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
              >
                {[timeZone, defaultTZ, "UTC"]
                  .filter((v, i, arr) => arr.indexOf(v) === i)
                  .map((tz) => (
                    <option key={`pinned-${tz}`} value={tz}>
                      {tz}
                    </option>
                  ))}
                <optgroup label="All timezones">
                  {allTimeZones.map((tz) => (
                    <option key={tz} value={tz}>
                      {tz}
                    </option>
                  ))}
                </optgroup>
              </select>
              <span style={tinyHelp}>
                If you travel, pop in here to keep times accurate.
              </span>
            </div>
          </div>
        </>
      )}

      {/* Warning / Fix-up */}
      <div style={warnRow} role="alert">
        <span aria-hidden>⚠️</span>
        <span>{error}</span>
        {error && (
          <LinkButton onClick={nudgeToFuture}>
            Use the next available slot
          </LinkButton>
        )}
      </div>

      {/* Actions */}
      <div style={btnRow}>
        <SecondaryButton
          onClick={handleSave}
          disabled={saving || !dateStr || !timeStr || !!error}
          hint={saving ? "Updating your schedule…" : undefined}
          aria-disabled={saving || !dateStr || !timeStr || !!error}
        >
          {saving ? "Saving…" : "Save schedule"}
        </SecondaryButton>

        <LinkButton onClick={handleNow}>Use current time (rounded)</LinkButton>
        {onCancel && <SecondaryButton onClick={onCancel}>Cancel</SecondaryButton>}
      </div>
    </section>
  );
}
