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

  const allTimeZones = useMemo(() => getAllTimeZones(), []);

  // Initialize
  useEffect(() => {
    const utcSource = user?.callTimeUtc || initialUtc;
    const tzSource = user?.timezone || timeZone || defaultTZ;

    if (utcSource) {
      const { date, time } = utcToLocalFields(utcSource, tzSource);
      setDateStr(date);
      setTimeStr(time);
      setTimeZone(tzSource);
    } else {
      const now = new Date();
      const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: tzSource,
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
      hh = (hh + 1) % 24;

      const pad = (n: number) => String(n).padStart(2, "0");
      setDateStr(`${yyyy}-${pad(mm)}-${pad(dd)}`);
      setTimeStr(`${pad(hh)}:00`);
      setTimeZone(tzSource);
    }
  }, [user, initialUtc, defaultTZ, timeZone]);

  const displayLine = useMemo(() => {
    if (!dateStr || !timeStr) return "Not set yet";
    const iso = localFieldsToUtcISO(dateStr, timeStr, timeZone);
    if (!iso) return "Not set yet";
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

  // ---- Styles using TOKENS ----
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
    borderRadius: TOKENS.radius - 2,
    padding: "10px 12px",
    fontSize: 14,
    color: TOKENS.text,
    backgroundColor: TOKENS.inputBg || "#FFFFFF",
  };

  const rowStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: 12,
    ...(typeof window !== "undefined" && window.innerWidth >= 640
      ? { gridTemplateColumns: "1fr 1fr 1.2fr" }
      : {}),
  };

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
    <div style={cardStyle} aria-live="polite">
      <div style={h2Style}>Next Call</div>
      <div style={lineStyle}>
        Your next call is scheduled at{" "}
        <span
          style={{
            background: TOKENS.accent,
            padding: "2px 6px",
            borderRadius: TOKENS.radius / 2,
          }}
        >
          {displayLine}
        </span>
        .
      </div>
      <div style={subStyle}>
        Times are shown in <strong>{timeZone}</strong>. You can adjust the date, time, or timezone below.
      </div>

      <div style={rowStyle}>
        <div>
          <label htmlFor="nc-date" style={labelStyle}>
            Date
          </label>
          <input
            id="nc-date"
            type="date"
            value={dateStr}
            onChange={(e) => setDateStr(e.target.value)}
            style={inputStyle}
          />
        </div>
        <div>
          <label htmlFor="nc-time" style={labelStyle}>
            Time
          </label>
          <input
            id="nc-time"
            type="time"
            value={timeStr}
            onChange={(e) => setTimeStr(e.target.value)}
            style={inputStyle}
          />
        </div>
        <div>
          <label htmlFor="nc-tz" style={labelStyle}>
            Timezone
          </label>
          <select
            id="nc-tz"
            value={timeZone}
            onChange={(e) => setTimeZone(e.target.value)}
            style={{ ...inputStyle, height: 42 }}
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
      </div>

      <div style={btnRow}>
        <SecondaryButton
          onClick={handleSave}
          disabled={saving || !dateStr || !timeStr}
          hint={saving ? "Updating your schedule…" : undefined}
        >
          {saving ? "Saving…" : "Save schedule"}
        </SecondaryButton>

        <LinkButton onClick={handleNow}>Use current time (rounded)</LinkButton>

        {onCancel && <SecondaryButton onClick={onCancel}>Cancel</SecondaryButton>}
      </div>
    </div>
  );
}
