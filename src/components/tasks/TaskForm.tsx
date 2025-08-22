"use client";

import React from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Plus, X, Calendar, Clock } from "lucide-react";

interface TaskFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function TaskForm({ onSuccess, onCancel }: TaskFormProps) {
  const createTask = useMutation(api.tasks.create_task);
  const user = useQuery(api.user.getCurrentUser);

  const [title, setTitle] = React.useState("");
  const [dueDate, setDueDate] = React.useState("");
  const [dueTime, setDueTime] = React.useState("");
  const [reminderMinutes, setReminderMinutes] = React.useState(5);
  const [errors, setErrors] = React.useState<{ title?: string; date?: string }>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [ok, setOk] = React.useState(false);

  React.useEffect(() => {
    const t = new Date();
    t.setDate(t.getDate() + 1);
    setDueDate(t.toISOString().split("T")[0]);
    setDueTime("12:00");
  }, []);

  const validate = () => {
    const e: { title?: string; date?: string } = {};
    if (!title.trim()) e.title = "Task name is required";
    if (!dueDate) e.date = "Due date is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      const dt = new Date(`${dueDate}T${dueTime || "12:00"}:00`);
      if (!user) throw new Error("User not found");
      await createTask({
        title: title.trim(),
        due: dt.toISOString(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        status: "scheduled",
        source: "manual",
        userId: user._id,
        reminderMinutesBefore: reminderMinutes,
      });
      setOk(true);
      setTitle("");
      setTimeout(() => {
        setOk(false);
        onSuccess?.();
      }, 1200);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="form">
      <div className="form__head">
        <h3>Add a new task</h3>
        {onCancel && (
          <button className="icon" onClick={onCancel} title="Close">
            <X size={16} />
          </button>
        )}
      </div>

      <form onSubmit={submit} className="grid">
        <label className="field">
          <span className="label">Task name*</span>
          <input
            className={`input ${errors.title ? "input--err" : ""}`}
            placeholder="What needs to be done?"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
          {errors.title && <span className="hint hint--err">{errors.title}</span>}
        </label>

        <div className="row">
          <label className="field">
            <span className="label"><Calendar size={14} /> Due date*</span>
            <input
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className={`input ${errors.date ? "input--err" : ""}`}
            />
            {errors.date && <span className="hint hint--err">{errors.date}</span>}
          </label>

          <label className="field">
            <span className="label"><Clock size={14} /> Time</span>
            <input
              type="time"
              value={dueTime}
              onChange={e => setDueTime(e.target.value)}
              className="input"
            />
          </label>
        </div>

        <label className="field">
          <span className="label">Reminder (minutes before)</span>
          <div className="inline">
            <input
              type="number"
              min={1}
              max={1440}
              value={reminderMinutes}
              onChange={e => setReminderMinutes(parseInt(e.target.value) || 5)}
              className="input input--num"
            />
            <span className="note">You’ll get a gentle nudge {reminderMinutes} min before.</span>
          </div>
        </label>

        <button className="btn" disabled={isSubmitting}>
          {isSubmitting ? (
            <span className="spin" />
          ) : (
            <>
              <Plus size={16} /> Add Task
            </>
          )}
        </button>

        {ok && <div className="ok">Task created — nice move! 🌱</div>}
      </form>

      <style jsx>{`
        :root {
          --indigo: #4f46e5;
          --lavender: #e0e7ff;
          --purple: #a78bfa;
          --teal: #14b8a6;
          --success: #10b981;
          --error: #ef4444;

          --bg-elev: #121225;
          --text: #eef0ff;
          --muted: #9aa0c3;
          --divider: #232347;
        }

        .form {
          background: rgba(18,18,37,0.92);
          border: 1px solid var(--divider);
          border-radius: 14px;
          padding: 16px;
        }
        .form__head {
          display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;
        }
        h3 { margin: 0; font-size: 16px; }
        .icon { background: transparent; border: 1px solid var(--divider); color: var(--muted); border-radius: 10px; width: 32px; height: 32px; display: grid; place-items: center; cursor: pointer; }

        .grid { display: grid; gap: 12px; }
        .row { display: grid; gap: 12px; grid-template-columns: 1fr 1fr; }
        @media (max-width: 640px){ .row { grid-template-columns: 1fr; } }

        .field { display: grid; gap: 6px; }
        .label { font-size: 12px; color: var(--muted); display: inline-flex; align-items: center; gap: 6px; }
        .input {
          background: #0f0f20;
          color: var(--text);
          border: 1px solid #26264a;
          border-radius: 12px;
          padding: 10px 12px;
          outline: none;
          transition: box-shadow 180ms ease, border-color 180ms ease;
        }
        .input:focus { box-shadow: 0 0 0 3px rgba(79,70,229,0.35); border-color: var(--indigo); }
        .input--err { border-color: var(--error); }
        .input--num { width: 96px; }
        .inline { display: flex; align-items: center; gap: 10px; }
        .note { font-size: 12px; color: var(--muted); }

        .hint { font-size: 12px; }
        .hint--err { color: #ff9d9d; }

        .btn {
          margin-top: 4px;
          appearance: none;
          border: none;
          border-radius: 12px;
          padding: 10px 14px;
          font-weight: 700;
          color: white;
          background: linear-gradient(180deg, #4f46e5, #3b35d9);
          box-shadow: 0 8px 20px rgba(79,70,229,0.35), inset 0 -1px 0 rgba(255,255,255,0.08);
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .btn:disabled { opacity: 0.7; cursor: default; }

        .ok {
          margin-top: 10px;
          background: rgba(16,185,129,0.12);
          color: #d1ffe9;
          border: 1px solid rgba(16,185,129,0.45);
          border-radius: 10px;
          padding: 8px 10px;
          text-align: center;
          animation: pop 300ms ease;
        }

        .spin {
          width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white; border-radius: 50%; display: inline-block;
          animation: spin 700ms linear infinite;
        }

        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pop { from { transform: scale(0.98); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      `}</style>
    </div>
  );
}
