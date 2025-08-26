"use client";

import * as React from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Plus, X, Calendar, Clock, CheckCircle2, Circle, Trash2, Sparkles, CheckSquare } from "lucide-react";
import { TOKENS } from "@/components/tokens";
import { PrimaryButton } from "@/components/ui/CustomButton";
import { cn } from "@/lib/utils";

/**
 * -------------------------------------------------------------
 *  Lightweight motion helpers (no deps): fade / slide / pop
 * -------------------------------------------------------------
 */
const Motion = {
  injectOnce() {
    if (document.querySelector("style[data-todo-motion]")) return;
    const css = `
      @media (prefers-reduced-motion: no-preference) {
        .fade-in { opacity: 0; transform: translateY(2px); animation: fade .22s ease forwards; }
        .slide-down { opacity: 0; transform: translateY(-6px); animation: slideDown .24s ease forwards; }
        .pop-in { opacity: 0; transform: scale(.98); animation: pop .18s ease forwards; }
        .highlight-in { animation: highlight .9s ease; }
        @keyframes fade { to { opacity: 1; transform: none; } }
        @keyframes slideDown { to { opacity: 1; transform: none; } }
        @keyframes pop { to { opacity: 1; transform: none; } }
        @keyframes highlight { 0% { box-shadow: 0 0 0 0 rgba(79,70,229,.24);} 100% { box-shadow: var(--shadow);} }
      }
    `;
    const tag = document.createElement("style");
    tag.setAttribute("data-todo-motion", "true");
    tag.appendChild(document.createTextNode(css));
    document.head.appendChild(tag);
  },
};

/**
 * -------------------------------------------------------------
 *  Style injector using your tokens (kept intentionally minimal)
 * -------------------------------------------------------------
 */
function StyleInjector() {
  React.useEffect(() => {
    if (document.querySelector('style[data-todo-ui]')) return;
    const T = {
      radius: TOKENS.radius ?? 12,
      shadow: TOKENS.shadow ?? "0 1px 2px rgba(16,24,40,0.04), 0 8px 24px rgba(16,24,40,0.06)",
      surface: TOKENS.cardBg ?? TOKENS.bg ?? "#FFFFFF",
      border: TOKENS.border ?? "#E2E8F0",
      text: TOKENS.text ?? "#0F172A",
      muted: TOKENS.subtext ?? "#64748B",
      primary: TOKENS.primary ?? "#4F46E5",
      primaryHover: TOKENS.primaryHover ?? "#4338CA",
      inputBg: TOKENS.inputBg ?? "#FFFFFF",
      focus: TOKENS.focus ?? "0 0 0 3px rgba(79,70,229,0.25)",
      rose50: "#FFF1F2",
    };

    const css = `
      :root{ --shadow:${T.shadow}; }
      .card{ background:${T.surface}; border:1px solid ${T.border}; border-radius:${T.radius + 2}px; box-shadow:var(--shadow); }
      .soft{ background: linear-gradient(180deg, rgba(238,242,255,.6), transparent); border:1px solid ${T.border}; border-radius:${T.radius + 6}px; }
      .muted{ color:${T.muted}; }
      .btn-ghost{ background:transparent; border:1px solid ${T.border}; border-radius:10px; padding:8px 10px; color:${T.muted}; }
      .icon-btn{ height:32px; width:32px; display:grid; place-items:center; background:${T.surface}; border:1px solid ${T.border}; border-radius:10px; color:#EF4444; }
      .icon-btn:hover{ background:${T.rose50}; }
      .chip{ display:inline-flex; align-items:center; gap:6px; padding:4px 8px; border-radius:999px; font-size:12px; border:1px solid ${T.border}; color:${T.muted}; background:#F8FAFC; }
      .chip--warn{ background:#FEF3C7; color:#92400E; border-color:#FDE68A; }
      .input{ background:${T.inputBg}; color:${T.text}; border:1px solid ${T.border}; border-radius:12px; padding:10px 12px; outline:none; }
      .input:focus{ box-shadow:${T.focus}; border-color:${T.primary}; }
      .progress{ height:8px; border-radius:999px; background:#F1F5F9; border:1px solid ${T.border}; overflow:hidden; }
      .progress__bar{ height:100%; background:linear-gradient(90deg, #22C55E, ${T.primary}); transition:width .3s ease; }
      .ring{ box-shadow:${T.focus}; }
      .title-line{ text-decoration:line-through; text-decoration-thickness:2px; text-decoration-color:#86EFAC; }
    `;
    const tag = document.createElement('style');
    tag.setAttribute('data-todo-ui', 'true');
    tag.appendChild(document.createTextNode(css));
    document.head.appendChild(tag);

    Motion.injectOnce();
  }, []);
  return null;
}

/**
 * -------------------------------------------------------------
 *  TaskForm — simplified UI, crisp transitions
 * -------------------------------------------------------------
 */
export function TaskForm({ onSuccess, onCancel }: { onSuccess?: () => void; onCancel?: () => void; }) {
  const createTask = useMutation(api.tasks.create_task);
  const user = useQuery(api.user.getCurrentUser);

  const [title, setTitle] = React.useState("");
  const [dueDate, setDueDate] = React.useState("");
  const [dueTime, setDueTime] = React.useState("");
  const [reminderMinutes, setReminderMinutes] = React.useState<number>(10);
  const [submitting, setSubmitting] = React.useState(false);
  const [ok, setOk] = React.useState(false);

  const tz = React.useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone, []);
  const inputId = React.useId(); const dateId = React.useId(); const timeId = React.useId();

  // sensible defaults: tomorrow 12:00
  React.useEffect(() => {
    const t = new Date(); t.setDate(t.getDate() + 1);
    setDueDate(t.toISOString().split("T")[0]);
    setDueTime("12:00");
  }, []);

  const setQuick = (which: "today" | "tomorrow") => {
    const d = new Date(); if (which === "tomorrow") d.setDate(d.getDate() + 1);
    setDueDate(d.toISOString().split("T")[0]);
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !dueDate) return;
    setSubmitting(true);
    try {
      if (!user) throw new Error("User not found");
      const dt = new Date(`${dueDate}T${(dueTime || "12:00")}:00`);
      await createTask({
        title: title.trim(),
        due: dt.toISOString(),
        timezone: tz,
        status: "scheduled",
        source: "manual",
        userId: user._id as Id<"users">,
        reminderMinutesBefore: reminderMinutes,
      });
      setOk(true);
      setTitle("");
      // keep date/time/reminder to quickly add siblings
      setTimeout(() => { setOk(false); onSuccess?.(); }, 700);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="card fade-in" role="region" aria-labelledby="tf-title" style={{ padding: 16 }}>
      <StyleInjector />
      <div className="slide-down" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <h3 id="tf-title" style={{ display: "inline-flex", gap: 8, margin: 0, fontSize: 16 }}>
          <Sparkles size={16} aria-hidden /> New task
        </h3>
        {onCancel && (
          <button className="btn-ghost" onClick={onCancel} aria-label="Close">
            <X size={16} />
          </button>
        )}
      </div>

      <form onSubmit={submit} className="pop-in" style={{ display: "grid", gap: 12 }}>
        <label htmlFor={inputId} style={{ display: "grid", gap: 6 }}>
          <span className="muted" style={{ fontSize: 12 }}>Task</span>
          <input id={inputId} className="input" placeholder="Email Alex the draft" value={title} onChange={e => setTitle(e.target.value)} maxLength={140} autoFocus />
        </label>

        <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
          <label htmlFor={dateId} style={{ display: "grid", gap: 6 }}>
            <span className="muted" style={{ fontSize: 12 }}><Calendar size={14} /> Due date</span>
            <input id={dateId} type="date" className="input" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            <div style={{ display: "flex", gap: 8 }}>
              <button type="button" className="btn-ghost" onClick={() => setQuick("today")}>Today</button>
              <button type="button" className="btn-ghost" onClick={() => setQuick("tomorrow")}>Tomorrow</button>
            </div>
          </label>
          <label htmlFor={timeId} style={{ display: "grid", gap: 6 }}>
            <span className="muted" style={{ fontSize: 12 }}><Clock size={14} /> Time</span>
            <input id={timeId} type="time" className="input" value={dueTime} onChange={(e) => setDueTime(e.target.value)} />
            <span className="muted" style={{ fontSize: 12 }}>Timezone: {tz}</span>
          </label>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span className="muted" style={{ fontSize: 12 }}>Reminder:</span>
          {[5, 10, 30, 60].map(m => (
            <button key={m} type="button" className="btn-ghost" onClick={() => setReminderMinutes(m)} aria-pressed={reminderMinutes === m}>
              {m}m
            </button>
          ))}
        </div>

        <PrimaryButton type="submit" disabled={submitting || !title.trim()} aria-live="polite" style={{ justifyContent: "center" }}>
          {submitting ? <span className="tf-spin" /> : <><Plus size={14} /> Add task</>}
        </PrimaryButton>
        {ok && <div className="soft" style={{ padding: 10, textAlign: "center" }}>Saved — future you says thanks ✨</div>}
      </form>

      {/* tiny spinner */}
      <style jsx>{`
        .tf-spin{ width:16px; height:16px; border:2px solid rgba(0,0,0,0.15); border-top-color:#111; border-radius:50%; display:inline-block; animation: spin .7s linear infinite; }
        @keyframes spin{ to{ transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

/**
 * -------------------------------------------------------------
 *  TodoApp — decluttered header, calmer list, better submit flow
 * -------------------------------------------------------------
 */
export default function TodoApp() {
  const tasks = useQuery(api.tasks.get_tasks) || [];
  const updateTask = useMutation(api.tasks.update_task);
  const deleteTask = useMutation(api.tasks.delete_task);

  const [showForm, setShowForm] = React.useState(false);
  const [nudge, setNudge] = React.useState<string | null>(null);
  // This state is used elsewhere for highlighting newly added tasks
  const [freshKey] = React.useState<Id<"tasks"> | null>(null);
  // Add missing state variables for animations
  const [completedAnimation, setCompletedAnimation] = React.useState<Id<"tasks"> | null>(null);
  const [deleteAnimation, setDeleteAnimation] = React.useState<Id<"tasks"> | null>(null);
  const [shouldAnimate, setShouldAnimate] = React.useState(false);

  type Priority = "low" | "medium" | "high";
  interface ConvexTask { _id: Id<"tasks">; _creationTime: number; title: string; due: string; timezone: string; status?: string; source?: string; }
  interface Todo { _id: Id<"tasks">; _creationTime: number; title: string; completed: boolean; due: string; timezone: string; priority: Priority; status?: string; }

  // Initialize animations and motion helpers
  React.useEffect(() => {
    Motion.injectOnce();
    // Allow animations after first render
    const timer = setTimeout(() => setShouldAnimate(true), 300);
    return () => clearTimeout(timer);
  }, []);

  // Store tasks in a stable reference for useMemo
  const tasksList = tasks as ConvexTask[];

  const todos: Todo[] = React.useMemo(() => {
    const list = tasksList.map(t => ({
      _id: t._id,
      _creationTime: t._creationTime,
      title: t.title,
      completed: t.status === "completed",
      due: t.due,
      timezone: t.timezone,
      priority: determinePriority(t.title),
      status: t.status,
    }));
    return list.sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      const ad = a.due ? new Date(a.due).getTime() : Number.POSITIVE_INFINITY;
      const bd = b.due ? new Date(b.due).getTime() : Number.POSITIVE_INFINITY;
      if (ad !== bd) return ad - bd; return b._creationTime - a._creationTime;
    });
  }, [tasksList]);

  const total = todos.length; const done = todos.filter(t => t.completed).length; const pct = total ? Math.round((done / total) * 100) : 0;

  async function toggle(id: Id<'tasks'>, next: boolean, title: string) {
    // Set animation state before API call for immediate feedback
    if (next) {
      setCompletedAnimation(id);
      // Haptic feedback if available
      if ('vibrate' in navigator) {
        navigator.vibrate(10);
      }
    }

    await updateTask({ id, status: next ? "completed" : "scheduled" });

    if (next) {
      const msg = celebrate(title);
      setNudge(msg);

      // Clear animations after a delay
      setTimeout(() => {
        setNudge(null);
        setCompletedAnimation(null);
      }, 1500);
    }
  }

  const remove = async (id: Id<'tasks'>) => {
    // Animate before actual deletion
    setDeleteAnimation(id);

    // Small delay for animation before actual deletion
    setTimeout(async () => {
      await deleteTask({ id });
      setDeleteAnimation(null);
    }, 300);
  };

  return (
    <div style={{ padding: "8px 4px" }}>
      <StyleInjector />

      {/* Header - Enhanced with animations and better mobile layout */}
      <header
        className="fade-in"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto",
          alignItems: "end",
          gap: 12,
          margin: "4px 0 16px",
          padding: "0 4px"
        }}
      >
        <div style={{ display: "grid", gap: 8 }}>
          <div
            className={`chip ${shouldAnimate ? "pulse-subtle" : ""}`}
            style={{
              fontWeight: 600,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              maxWidth: "fit-content"
            }}
          >
            <Sparkles size={16} className={shouldAnimate ? "wiggle-effect" : ""} />
            {done ? (
              <span className="flex items-center gap-1">
                <span className="font-bold">{done}</span> completed
              </span>
            ) : (
              "Let's capture one tiny win"
            )}
          </div>

          <div className="progress" aria-hidden style={{ overflow: "hidden", borderRadius: "999px" }}>
            <div
              className="progress__bar"
              style={{
                width: `${pct}%`,
                transition: "width 0.5s ease-out"
              }}
            />
          </div>
        </div>

        <div>
          {!showForm && (
            <button
              className="btn-ghost hover-lift"
              onClick={() => setShowForm(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "10px 14px", // Larger touch target for mobile
                borderRadius: "10px",
                transition: "all 0.2s ease"
              }}
            >
              <Plus size={16} />
              <span style={{ fontWeight: 500 }}>Add task</span>
            </button>
          )}
        </div>
      </header>

      {/* Inline form */}
      {showForm && (
        <div className="fade-in" style={{ margin: "0 4px 12px" }}>
          <TaskForm onSuccess={() => { setShowForm(false); setNudge("Nice! Added to your list."); setTimeout(() => setNudge(null), 900); }} onCancel={() => setShowForm(false)} />
        </div>
      )}

      {/* Nudge */}
      {nudge && (
        <div className="soft slide-down" style={{ margin: "0 4px 10px", padding: 10, textAlign: "center" }}>{nudge}</div>
      )}

      {/* Empty state - Enhanced with delightful animations */}
      {todos.length === 0 && !showForm && (
        <div
          className="card fade-in hover-lift"
          style={{
            borderStyle: "dashed",
            padding: "28px 20px",
            textAlign: "center",
            color: "#64748B",
            borderRadius: "14px",
            transition: "all 0.3s ease"
          }}
        >
          <div className={`${shouldAnimate ? "float-effect" : ""}`}>
            <div
              className="mx-auto mb-3 flex items-center justify-center rounded-full"
              style={{
                width: "48px",
                height: "48px",
                background: TOKENS.accent,
                boxShadow: "0 2px 10px rgba(79, 70, 229, 0.15)"
              }}
            >
              <CheckSquare size={22} style={{ color: TOKENS.primary }} />
            </div>
            <h3 style={{ margin: 0, fontSize: "18px", color: TOKENS.text }}>Ready when you are</h3>
            <p style={{ margin: "10px 0 0" }}>
              Tap <b style={{ color: TOKENS.primary }}>Add task</b> to get started.
              <br className="hidden sm:block" /> Tiny steps are welcome.
            </p>
          </div>
        </div>
      )}

      {/* List - Enhanced with animations and mobile-friendly design */}
      <ul style={{ listStyle: "none", margin: "12px 0 0", padding: 0, display: "grid", gap: 12 }}>
        {todos.map((t, index) => (
          <li
            key={t._id}
            className={cn(
              "card",
              shouldAnimate ? "hover-lift" : "",
              deleteAnimation === t._id ? "fade-out" : "",
              freshKey === t._id ? "highlight-in" : ""
            )}
            style={{
              display: "grid",
              gridTemplateColumns: "auto 1fr auto",
              gap: 12,
              alignItems: "start",
              padding: "14px 12px",
              borderRadius: "12px",
              opacity: deleteAnimation === t._id ? 0 : 1,
              transform: deleteAnimation === t._id ? 'translateX(-20px)' : 'none',
              transition: 'opacity 0.3s ease, transform 0.3s ease',
              // Staggered entrance animation
              animationDelay: shouldAnimate ? `${index * 50}ms` : '0ms',
            }}
          >
            <button
              className={cn(
                "btn-ghost",
                completedAnimation === t._id ? "scale-110" : ""
              )}
              aria-pressed={t.completed}
              aria-label={t.completed ? "Mark as not done" : "Mark as done"}
              onClick={() => toggle(t._id, !t.completed, t.title)}
              style={{
                height: 40, // Larger touch target
                width: 40, // Larger touch target
                display: "grid",
                placeItems: "center",
                borderRadius: "10px",
                transition: "all 0.2s ease",
                transform: completedAnimation === t._id ? 'scale(1.1)' : 'scale(1)'
              }}
            >
              {t.completed ? (
                <CheckCircle2
                  size={22}
                  color="#16A34A"
                  className={completedAnimation === t._id ? "pulse-subtle" : ""}
                />
              ) : (
                <Circle size={22} />
              )}
            </button>

            <div style={{ minWidth: 0 }}>
              {/* chips row - improved styling */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
                <span
                  className={`chip ${t.priority === 'high' ? 'chip--warn' : ''}`}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    padding: "4px 8px",
                    borderRadius: "999px",
                    fontSize: "12px"
                  }}
                >
                  <span aria-hidden>{priorityEmoji(t.priority)}</span> {t.priority}
                </span>

                {t.due && (
                  <span
                    className="chip"
                    title="Due"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4
                    }}
                  >
                    <Clock size={14} /> {formatDue(t.due)}
                  </span>
                )}
              </div>

              <p
                style={{
                  margin: "4px 0 8px",
                  fontSize: 15,
                  lineHeight: 1.4,
                  fontWeight: t.completed ? 400 : 500,
                  transition: "text-decoration 0.3s ease, opacity 0.3s ease",
                  opacity: t.completed ? 0.8 : 1
                }}
                className={t.completed ? "title-line" : undefined}
              >
                {t.title}
              </p>

              <div
                className="muted"
                style={{
                  fontSize: 12,
                  display: "flex",
                  alignItems: "center",
                  gap: 6
                }}
              >
                <span
                  className="inline-block w-2 h-2 rounded-full"
                  style={{
                    background: t.completed ? "#10B981" : "#94A3B8",
                    opacity: 0.7
                  }}
                />
                {getTimeAgo(t._creationTime)}
              </div>
            </div>

            <button
              className="icon-btn"
              onClick={() => remove(t._id)}
              aria-label="Delete task"
              style={{
                height: 36, // Larger touch target
                width: 36, // Larger touch target
                transition: "all 0.2s ease"
              }}
            >
              <Trash2 size={18} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Helpers (kept from your original but trimmed) */
function determinePriority(title: string): "low" | "medium" | "high" {
  const low = ["later", "sometime", "eventually", "when possible"]; const high = ["urgent", "important", "asap", "immediately", "critical"];
  const t = title.toLowerCase(); if (high.some(k => t.includes(k))) return "high"; if (low.some(k => t.includes(k))) return "low"; return "medium";
}
function priorityEmoji(p: "low" | "medium" | "high") { return p === "high" ? "⏫" : p === "low" ? "🌿" : "✨"; }
function formatDue(iso: string) { const d = new Date(iso); if (isNaN(d.getTime())) return "—"; const today = new Date(); const dd = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime(); const td = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime(); const diff = Math.round((dd - td) / 86400000); const time = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); if (diff === 0) return `Today · ${time}`; if (diff === 1) return `Tomorrow · ${time}`; if (diff === -1) return `Yesterday · ${time}`; if (diff < -1) return `Overdue · ${Math.abs(diff)}d`; if (diff <= 7) return `${d.toLocaleDateString([], { weekday: "short" })} · ${time}`; return d.toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }); }
function getTimeAgo(ts: number) { const diff = Math.max(0, Date.now() - ts); const m = Math.floor(diff / 60000); if (m < 1) return "Just now"; if (m < 60) return `${m}m ago`; const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`; return `${Math.floor(h / 24)}d ago`; }
function celebrate(title: string) {
  const msg = [
    `Sweet! “${truncate(title, 36)}” is done 🎉`,
    "Tiny win logged ✅",
    "Nice move — momentum building",
    "One less tab in your brain 🧠",
  ]; return msg[Math.floor(Math.random() * msg.length)];
}
const truncate = (s: string, n: number) => s.length > n ? s.slice(0, n - 1) + "…" : s;
