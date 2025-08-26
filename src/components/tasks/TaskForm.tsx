"use client";

import * as React from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Plus, X, Calendar, Clock, Sparkles, Info } from "lucide-react";

// Use your shared tokens + buttons
import { TOKENS } from "@/components/tokens";
import { PrimaryButton } from "@/components/ui/CustomButton"; // your ReusableButton exports

/* ---------- One-time CSS injector (pulls from TOKENS) ---------- */
let injected = false;
function FormStyleInjector() {
  React.useEffect(() => {
    if (injected) return;
    injected = true;

    // Safe fallbacks in case some keys are missing in TOKENS
    const T = {
      radius: TOKENS.radius ?? 12,
      cardBg: TOKENS.cardBg ?? "#FFFFFF",
      cardText: TOKENS.cardText ?? "#0F172A",
      cardBorder: TOKENS.cardBorder ?? (TOKENS.border ?? "#E2E8F0"),
      shadow: TOKENS.shadow ?? "0 1px 2px rgba(16,24,40,0.04), 0 8px 24px rgba(16,24,40,0.06)",
      text: TOKENS.text ?? "#0F172A",
      subtext: TOKENS.subtext ?? "#475569",
      primary: TOKENS.primary ?? "#4F46E5",
      primaryHover: TOKENS.primaryHover ?? "#4338CA",
      inputBg: TOKENS.inputBg ?? "#FFFFFF",
      focus: TOKENS.focus ?? "0 0 0 3px rgba(79,70,229,0.25)",
      error: TOKENS.error ?? "#EF4444",
      errorBg: TOKENS.errorBg ?? "rgba(239,68,68,0.12)",
      info: TOKENS.info ?? "#2563EB",
      infoBg: TOKENS.infoBg ?? "rgba(37,99,235,0.10)",
      successBg: TOKENS.successBg ?? "rgba(16,185,129,0.12)",
      // light chip accents
      accent: TOKENS.accent ?? "rgba(224,231,255,0.60)",
      border: TOKENS.border ?? "#E2E8F0",
    };

    const css = `
      @keyframes spin { to { transform: rotate(360deg); } }
      @keyframes pop { from { transform: scale(.98); opacity: 0; } to { transform: scale(1); opacity: 1; } }

      .tf-card {
        background: ${T.cardBg};
        color: ${T.cardText};
        border: 1px solid ${T.cardBorder};
        border-radius: ${T.radius}px;
        padding: 16px;
        box-shadow: ${T.shadow};
      }
      .tf-head { display:flex; align-items:center; justify-content:space-between; margin-bottom:8px; }
      .tf-title { margin:0; font-size:16px; display:inline-flex; gap:8px; align-items:center; }
      .tf-micro { margin:6px 0 12px; color:${T.subtext}; font-size:12px; }

      .tf-icon {
        background: transparent;
        border: 1px solid ${T.cardBorder};
        color: ${T.subtext};
        border-radius: 10px;
        width: 32px; height: 32px; display: grid; place-items: center; cursor: pointer;
        transition: transform 140ms ease, border-color 140ms ease;
      }
      .tf-icon:hover { transform: translateY(-1px); border-color: ${T.border}; }

      .tf-grid { display:grid; gap:12px; }
      .tf-row { display:grid; gap:12px; grid-template-columns:1fr 1fr; align-items:start; }
      @media (max-width: 640px){ .tf-row { grid-template-columns:1fr; } }

      .tf-label { font-size:12px; color:${T.subtext}; display:inline-flex; align-items:center; gap:6px; }
      .tf-stack { display:grid; gap:6px; }
      .tf-row-between { display:flex; align-items:center; justify-content:space-between; }

      .tf-input {
        background: ${T.inputBg};
        color: ${T.text};
        border: 1px solid ${T.cardBorder};
        border-radius: 12px;
        padding: 10px 12px;
        outline: none;
        transition: box-shadow 180ms ease, border-color 180ms ease, transform 90ms ease;
      }
      .tf-input:focus { box-shadow: ${T.focus}; border-color: ${T.primary}; }
      .tf-input-err { border-color: ${T.error}; }
      .tf-input-num { width: 96px; }

      .tf-hint, .tf-note, .tf-count { font-size:12px; color:${T.subtext}; }
      .tf-hint-err { color: ${T.error}; }
      .tf-count-warn { color:#B45309; } /* subtle warn */

      .tf-chips { display:flex; flex-wrap:wrap; gap:8px; }
      .tf-chip {
        background: ${T.accent};
        color: ${T.text};
        border: 1px solid ${T.cardBorder};
        border-radius: 999px;
        padding: 6px 10px;
        font-size: 12px;
        cursor: pointer;
        transition: border-color 160ms ease, transform 80ms ease, background 160ms ease;
      }
      .tf-chip:hover { border-color: ${T.border}; transform: translateY(-1px); }
      .tf-chip-active { background: rgba(79,70,229,0.12); border-color: ${T.primary}; }

      .tf-error {
        background: ${T.errorBg};
        color: ${T.text};
        border: 1px solid ${T.error};
        border-radius: 10px;
        padding: 8px 10px;
        margin-bottom: 10px;
        font-size: 12px;
        display: grid;
        grid-template-columns: 16px 1fr;
        gap: 8px;
      }
      .tf-error ul { margin: 4px 0 0 16px; padding: 0; }

      .tf-ok {
        margin-top: 10px;
        background: ${T.successBg};
        color: ${T.text};
        border: 1px solid rgba(16,185,129,0.35);
        border-radius: 10px;
        padding: 8px 10px;
        text-align: center;
        animation: pop 220ms ease;
      }

      .tf-spin {
        width: 16px; height: 16px; border: 2px solid rgba(0,0,0,0.15);
        border-top-color: ${T.text}; border-radius: 50%; display: inline-block;
        animation: spin 700ms linear infinite;
      }
    `;

    const tag = document.createElement("style");
    tag.setAttribute("data-alara-taskform", "true");
    tag.appendChild(document.createTextNode(css));
    document.head.appendChild(tag);
  }, []);
  return null;
}

/* ---------- Component ---------- */
interface TaskFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  compact?: boolean;
}

export default function TaskForm({ onSuccess, onCancel, compact }: TaskFormProps) {
  const createTask = useMutation(api.tasks.create_task);
  const user = useQuery(api.user.getCurrentUser);

  const [title, setTitle] = React.useState("");
  const [dueDate, setDueDate] = React.useState("");
  const [dueTime, setDueTime] = React.useState("");
  const [reminderMinutes, setReminderMinutes] = React.useState<number>(10);
  const [errors, setErrors] = React.useState<{ title?: string; date?: string }>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [ok, setOk] = React.useState(false);
  const [touched, setTouched] = React.useState<{ title?: boolean; date?: boolean }>({});

  const inputId = React.useId();
  const dateId = React.useId();
  const timeId = React.useId();
  const remindId = React.useId();

  const tz = React.useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone, []);
  const charCount = title.trim().length;
  const titleTooLong = charCount > 140;

  // Quick picks
  const setPreset = (which: "today" | "tmrw" | "monday") => {
    const now = new Date();
    const d = new Date();
    if (which === "tmrw") d.setDate(now.getDate() + 1);
    if (which === "monday") {
      const day = d.getDay();
      const diff = (1 + 7 - day) % 7 || 7;
      d.setDate(d.getDate() + diff);
    }
    const yyyyMmDd = d.toISOString().split("T")[0];
    setDueDate(yyyyMmDd);
    if (which === "today") {
      const t = new Date();
      const nextBlock = Math.ceil(t.getHours() / 2) * 2;
      const hh = String(Math.min(nextBlock, 23)).padStart(2, "0");
      setDueTime(`${hh}:00`);
    }
  };

  const validate = () => {
    const e: { title?: string; date?: string } = {};
    if (!title.trim()) e.title = "Give your task a name.";
    if (titleTooLong) e.title = "Keep it under 140 characters to stay crisp.";
    if (!dueDate) e.date = "Pick a day so we can cheer you on.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // defaults: tomorrow at 12:00
  React.useEffect(() => {
    const t = new Date();
    t.setDate(t.getDate() + 1);
    setDueDate(t.toISOString().split("T")[0]);
    setDueTime("12:00");
  }, []);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && onCancel) onCancel();
      if (e.key === "Enter" && (e.target as HTMLElement)?.tagName === "INPUT") {
        const form = document.getElementById("task-form") as HTMLFormElement | null;
        if (form) form.requestSubmit();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      const dt = new Date(`${dueDate}T${(dueTime || "12:00")}:00`);
      if (!user) throw new Error("User not found");
      await createTask({
        title: title.trim(),
        due: dt.toISOString(),
        timezone: tz,
        status: "scheduled",
        source: "manual",
        userId: (user as any)._id,
        reminderMinutesBefore: reminderMinutes,
      });
      setOk(true);
      setTitle("");
      // keep date/time/reminder so users can add multiple tasks for same slot
      setTimeout(() => {
        setOk(false);
        onSuccess?.();
      }, 850);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`tf-card${compact ? " tf-compact" : ""}`} role="region" aria-labelledby="tf-title">
      <FormStyleInjector />

      <div className="tf-head">
        <h3 className="tf-title" id="tf-title">
          <Sparkles size={16} aria-hidden /> Add a new task
        </h3>
        {onCancel && (
          <button className="tf-icon" onClick={onCancel} title="Close (Esc)" aria-label="Close form">
            <X size={16} />
          </button>
        )}
      </div>

      <p className="tf-micro">Small step, big momentum. Name it — we’ll nudge you at the right time.</p>

      {(errors.title || errors.date) && (
        <div className="tf-error" role="alert">
          <Info size={14} aria-hidden /> Let’s fix what’s missing:
          <ul>
            {errors.title && <li>{errors.title}</li>}
            {errors.date && <li>{errors.date}</li>}
          </ul>
        </div>
      )}

      <form id="task-form" onSubmit={submit} className="tf-grid" noValidate>
        {/* Task name */}
        <label htmlFor={inputId}>
          <span className="tf-label">Task name*</span>
          <div className="tf-stack">
            <input
              id={inputId}
              className={`tf-input ${errors.title && touched.title ? "tf-input-err" : ""}`}
              placeholder="What’s the next tiny step?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, title: true }))}
              maxLength={240}
              aria-describedby={`${inputId}-hint ${errors.title ? inputId + "-err" : ""}`.trim()}
              autoFocus
            />
            <div className="tf-row-between">
              <span id={`${inputId}-hint`} className="tf-hint">
                Tip: start with a verb — “Email Alex the draft”.
              </span>
              <span className={`tf-count ${titleTooLong ? "tf-count-warn" : ""}`}>{charCount}/140</span>
            </div>
            {errors.title && touched.title && (
              <span id={`${inputId}-err`} className="tf-hint tf-hint-err">
                {errors.title}
              </span>
            )}
          </div>
        </label>

        {/* Date & Time */}
        <div className="tf-row">
          <label htmlFor={dateId}>
            <span className="tf-label">
              <Calendar size={14} /> Due date*
            </span>
            <div className="tf-stack">
              <input
                id={dateId}
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, date: true }))}
                className={`tf-input ${errors.date && touched.date ? "tf-input-err" : ""}`}
                aria-describedby={errors.date ? dateId + "-err" : undefined}
              />
              <div className="tf-chips" role="group" aria-label="Quick date picks">
                <button type="button" onClick={() => setPreset("today")} className="tf-chip">
                  Today
                </button>
                <button type="button" onClick={() => setPreset("tmrw")} className="tf-chip">
                  Tomorrow
                </button>
                <button type="button" onClick={() => setPreset("monday")} className="tf-chip">
                  Next Mon
                </button>
              </div>
              {errors.date && touched.date && (
                <span id={`${dateId}-err`} className="tf-hint tf-hint-err">
                  {errors.date}
                </span>
              )}
            </div>
          </label>

          <label htmlFor={timeId}>
            <span className="tf-label">
              <Clock size={14} /> Time
            </span>
            <div className="tf-stack">
              <input
                id={timeId}
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="tf-input"
              />
              <div className="tf-chips" role="group" aria-label="Quick time picks">
                <button type="button" className="tf-chip" onClick={() => setDueTime("09:00")}>
                  9:00
                </button>
                <button type="button" className="tf-chip" onClick={() => setDueTime("13:00")}>
                  1:00p
                </button>
                <button type="button" className="tf-chip" onClick={() => setDueTime("17:00")}>
                  5:00p
                </button>
              </div>
              <span className="tf-note">Timezone: {tz}</span>
            </div>
          </label>
        </div>

        {/* Reminder */}
        <label htmlFor={remindId}>
          <span className="tf-label">Reminder</span>
          <div className="tf-stack">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <input
                id={remindId}
                type="number"
                min={1}
                max={1440}
                value={reminderMinutes}
                onChange={(e) => setReminderMinutes(parseInt(e.target.value) || 10)}
                className="tf-input tf-input-num"
                aria-describedby={`${remindId}-hint`}
              />
              <span className="tf-note" id={`${remindId}-hint`}>
                You’ll get a gentle nudge {reminderMinutes} min before.
              </span>
            </div>
            <div className="tf-chips" role="group" aria-label="Quick reminder picks">
              {[5, 10, 30, 60].map((m) => (
                <button
                  type="button"
                  key={m}
                  className={`tf-chip ${reminderMinutes === m ? "tf-chip-active" : ""}`}
                  onClick={() => setReminderMinutes(m)}
                >
                  {m}m
                </button>
              ))}
            </div>
          </div>
        </label>

        {/* Submit (uses your PrimaryButton; stretches by default) */}
        <PrimaryButton type="submit" disabled={isSubmitting || !title.trim() || titleTooLong} aria-live="polite">
          {isSubmitting ? <span className="tf-spin" /> : (<><Plus size={12} /> Add Task</>)}
        </PrimaryButton>

        {ok && <div className="tf-ok">Task saved — future you says thanks ✨</div>}
      </form>
    </div>
  );
}
