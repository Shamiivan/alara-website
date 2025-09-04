"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
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
  const callNow = useAction(api.core.calls.actions.initiateCalendarCall)

  const defaultTZ = useMemo(() => getDefaultTimeZone(), []);
  const pulledTZ = user?.timezone || initialTimeZone || defaultTZ;

  const [timeZone, setTimeZone] = useState<string>(pulledTZ);
  const [dateStr, setDateStr] = useState<string>("");
  const [timeStr, setTimeStr] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [showTzPicker, setShowTzPicker] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allTimeZones = useMemo(() => getAllTimeZones(), []);

  useEffect(() => {
    const utcSource = user?.callTimeUtc || initialUtc;
    const tzSource = user?.timezone || pulledTZ;

    if (utcSource) {
      const { date, time } = utcToLocalFields(utcSource, tzSource);
      setDateStr(date);
      setTimeStr(time);
      setTimeZone(tzSource);
    } else {
      const { date, time } = roundNowToNext15(tzSource);
      setDateStr(date);
      setTimeStr(time);
      setTimeZone(tzSource);
    }
  }, [user?.callTimeUtc, user?.timezone, initialUtc, pulledTZ]);

  const displayLine = useMemo(() => {
    if (!dateStr || !timeStr) return "Not set";
    const iso = localFieldsToUtcISO(dateStr, timeStr, timeZone);
    if (!iso) return "Not set";
    const d = new Date(iso);
    return new Intl.DateTimeFormat(undefined, {
      timeZone,
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZoneName: "short",
    }).format(d);
  }, [dateStr, timeStr, timeZone]);

  const relativeHint = useMemo(() => {
    if (!dateStr || !timeStr) return "";
    const iso = localFieldsToUtcISO(dateStr, timeStr, timeZone);
    if (!iso) return "";
    const target = new Date(iso).getTime();
    const now = Date.now();
    const diff = target - now;

    const dayMs = 86400000;
    const hourMs = 3600000;
    const minMs = 60000;

    const abs = Math.abs(diff);
    const sign = diff >= 0 ? 1 : -1;

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
      const h = Math.floor(abs / hourMs);
      const m = Math.round((abs % hourMs) / minMs);
      if (h === 0 && m <= 1) return "~1m";
      if (h === 0) return `${m}m`;
      if (m === 0) return `${h}h`;
      return `${h}h ${m}m`;
    }

    if (isTomorrow && sign > 0) return "tomorrow";
    if (sign < 0) {
      const h = Math.floor(abs / hourMs);
      const m = Math.round((abs % hourMs) / minMs);
      if (h === 0 && m <= 1) return "1m ago";
      if (h === 0) return `${m}m ago`;
      if (m === 0) return `${h}h ago`;
      return `${h}h ${m}m ago`;
    }

    const days = Math.round(abs / dayMs);
    return days === 1 ? "in 1 day" : `in ${days} days`;
  }, [dateStr, timeStr, timeZone]);

  // ---- Styles ----
  const cardStyle: React.CSSProperties = {
    backgroundColor: TOKENS.cardBg,
    border: `1px solid ${TOKENS.border}`,
    borderRadius: TOKENS.radius,
    padding: compact ? 14 : 18,
    boxShadow: TOKENS.shadow,
  };

  const row: React.CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 };
  const label: React.CSSProperties = { fontSize: 11, fontWeight: 600, color: TOKENS.subtext };
  const input: React.CSSProperties = {
    width: "100%",
    border: `1px solid ${TOKENS.border}`,
    borderRadius: TOKENS.radius - 2,
    padding: "9px 10px",
    fontSize: 14,
    color: TOKENS.text,
    backgroundColor: TOKENS.inputBg || "#FFF",
    outline: "none",
  };

  const chip: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "2px 8px",
    borderRadius: TOKENS.radius,
    background: TOKENS.badgeBg || TOKENS.accent,
    color: TOKENS.badgeText || TOKENS.text,
    fontSize: 12,
    fontWeight: 600,
  };

  const tinyLink: React.CSSProperties = {
    border: "none",
    background: "transparent",
    color: TOKENS.primary,
    textDecoration: "underline",
    cursor: "pointer",
    padding: 0,
    fontSize: 12,
    fontWeight: 600,
  };

  const warn: React.CSSProperties = {
    display: error ? "flex" : "none",
    alignItems: "center",
    gap: 8,
    padding: "6px 8px",
    borderRadius: TOKENS.radius,
    background: TOKENS.warnBg || "rgba(245,158,11,0.12)",
    color: TOKENS.warn || "#B45309",
    fontSize: 12,
    marginTop: 8,
  };

  useEffect(() => {
    if (!dateStr || !timeStr) return setError(null);
    const iso = localFieldsToUtcISO(dateStr, timeStr, timeZone);
    if (!iso) return setError("Invalid time.");
    const target = new Date(iso).getTime();
    setError(target < Date.now() ? "In the past." : null);
  }, [dateStr, timeStr, timeZone]);

  function nudgeToFuture() {
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
    if (!user || !user._id) {
      console.error("No user available for call");
      return;
    }
    const res = callNow({ userId: user._id });
  }

  return (
    <section style={cardStyle} aria-live="polite" aria-label="Next call">
      {/* Title row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, color: TOKENS.text }}>
          <span aria-hidden>📞</span>
          <strong style={{ fontSize: 14 }}>Next call</strong>
        </div>
        <span style={{ fontSize: 12, color: TOKENS.subtext }}> Update your call time</span>
      </div>

      {/* When */}
      <div style={{ marginBottom: 8, color: TOKENS.text }}>
        <span style={{ fontWeight: 600 }}>Scheduled:</span>{" "}
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: TOKENS.badgeBg || TOKENS.accent,
            color: TOKENS.badgeText || TOKENS.text,
            padding: "4px 10px",
            borderRadius: TOKENS.radius,
            fontWeight: 600,
          }}
        >
          {displayLine}
          {relativeHint && (
            <span
              style={{
                fontSize: 12,
                color: TOKENS.subtext,
                background: TOKENS.infoBg || "transparent",
                borderRadius: TOKENS.radius / 2,
                padding: "0 6px",
              }}
              aria-label="relative time"
            >
              {relativeHint}
            </span>
          )}
        </span>
      </div>

      {/* TZ chip */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <span style={chip}>{timeZone}</span>
        <button type="button" onClick={() => setShowTzPicker((s) => !s)} style={tinyLink} aria-expanded={showTzPicker}>
          {showTzPicker ? "Hide" : "Change"}
        </button>
      </div>

      {/* Inputs */}
      <div style={row}>
        <div>
          <div style={label}>Date</div>
          <input
            id="nc-date"
            type="date"
            value={dateStr}
            onChange={(e) => setDateStr(e.target.value)}
            style={input}
            onFocus={(e) => (e.currentTarget.style.boxShadow = TOKENS.focus || "")}
            onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
          />
        </div>
        <div>
          <div style={label}>Time</div>
          <input
            id="nc-time"
            type="time"
            value={timeStr}
            onChange={(e) => setTimeStr(e.target.value)}
            style={input}
            onFocus={(e) => (e.currentTarget.style.boxShadow = TOKENS.focus || "")}
            onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
          />
        </div>
      </div>

      {/* Timezone picker */}
      {showTzPicker && (
        <div style={{ marginTop: 8 }}>
          <div style={label}>Timezone</div>
          <select
            id="nc-tz"
            value={timeZone}
            onChange={(e) => setTimeZone(e.target.value)}
            style={{ ...input, height: 42 }}
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
        </div>
      )}

      {/* Warning / fix */}
      <div style={warn} role="alert">
        <span aria-hidden>⚠️</span>
        <span>{error}</span>
        {error && <LinkButton onClick={nudgeToFuture}>Next available</LinkButton>}
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
        <SecondaryButton
          onClick={handleSave}
          disabled={saving || !dateStr || !timeStr || !!error}
          aria-disabled={saving || !dateStr || !timeStr || !!error}
        >
          {saving ? "Saving…" : "Update"}
        </SecondaryButton>
        <LinkButton onClick={handleNow}>Now</LinkButton>
        {onCancel && <LinkButton onClick={onCancel}>Cancel</LinkButton>}
      </div>
    </section>
  );
}
