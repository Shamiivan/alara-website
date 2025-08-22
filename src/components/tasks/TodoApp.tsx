"use client";

import React from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { CheckCircle2, Circle, Clock, Calendar, Mic, Trash2 } from "lucide-react";

interface ConvexTask {
  _id: Id<"tasks">;
  _creationTime: number;
  title: string;
  due: string;
  timezone: string;
  status?: string;
  source?: string;
  userId?: Id<"users">;
  callId?: Id<"calls">;
  reminderMinutesBefore?: number;
  [key: string]: unknown;
}

type Priority = "low" | "medium" | "high";

interface Todo {
  _id?: Id<"tasks">;
  _creationTime?: number;
  title: string;
  completed?: boolean;
  due: string;
  timezone: string;
  priority?: Priority;
  createdBy?: "voice" | "manual";
  status?: string;
}

export default function TodoApp() {
  const tasks = useQuery(api.tasks.get_tasks) || [];
  const updateTask = useMutation(api.tasks.update_task);
  const deleteTask = useMutation(api.tasks.delete_task);

  const todos: Todo[] = tasks.map((task: ConvexTask) => ({
    _id: task._id,
    _creationTime: task._creationTime,
    title: task.title,
    completed: task.status === "completed",
    due: task.due,
    timezone: task.timezone,
    priority: determinePriority(task.title),
    createdBy: task.source === "elevenlabs" ? "voice" : "manual",
    status: task.status,
  }));

  function determinePriority(title: string): Priority {
    const low = ["later", "sometime", "eventually", "when possible"];
    const high = ["urgent", "important", "asap", "immediately", "critical"];
    const t = title.toLowerCase();
    if (high.some(k => t.includes(k))) return "high";
    if (low.some(k => t.includes(k))) return "low";
    return "medium";
  }

  const toggleTodo = (id: Id<"tasks">, completed: boolean) =>
    updateTask({ id, status: completed ? "completed" : "scheduled" });

  const removeTodo = (id: Id<"tasks">) => deleteTask({ id });

  const completedCount = todos.filter(t => t.completed).length;
  const totalCount = todos.length;

  return (
    <div className="list-wrap">
      <div className="stats">
        <div className="stat">
          <div className="stat__num">{totalCount}</div>
          <div className="stat__label">Total</div>
        </div>
        <div className="stat">
          <div className="stat__num stat__num--accent">{completedCount}</div>
          <div className="stat__label">Completed</div>
        </div>
      </div>

      {todos.length === 0 && (
        <div className="empty">
          <div className="empty__icon">
            <Mic size={28} />
          </div>
          <h3>Ready when you are</h3>
          <p>Speak your mind or tap “Add a task” to begin.</p>
        </div>
      )}

      <ul className="list">
        {todos.map(todo => (
          <li key={todo._id as string} className={`card ${todo.completed ? "card--done" : ""}`}>
            <button
              className="check"
              onClick={() => todo._id && toggleTodo(todo._id, !todo.completed)}
              aria-label={todo.completed ? "Mark as not done" : "Mark as done"}
              title={todo.completed ? "Undo complete" : "Mark complete"}
            >
              {todo.completed ? <CheckCircle2 size={22} /> : <Circle size={22} />}
            </button>

            <div className="content">
              <div className="chips">
                <span className={`chip chip--${todo.priority}`}>{todo.priority}</span>
                {todo.createdBy === "voice" && <span className="chip chip--voice"> <Mic size={14} /> Voice</span>}
                {todo.due && (
                  <span className="chip chip--outline">
                    <Clock size={14} /> {getDueTime(todo.due)}
                  </span>
                )}
              </div>

              <p className={`title ${todo.completed ? "title--line" : ""}`}>{todo.title}</p>

              <div className="meta">
                <span className="meta__row">
                  <Calendar size={14} />
                  {todo._creationTime ? getTimeAgo(todo._creationTime) : "Just now"}
                </span>
              </div>
            </div>

            <button className="icon-btn" onClick={() => todo._id && removeTodo(todo._id)} title="Delete">
              <Trash2 size={18} />
            </button>
          </li>
        ))}
      </ul>

      <style jsx>{`
        :root {
          --indigo: #4f46e5;
          --lavender: #e0e7ff;
          --purple: #a78bfa;
          --teal: #14b8a6;
          --success: #10b981;
          --warning: #f59e0b;
          --error: #ef4444;

          --bg-elev: #121225;
          --text: #eef0ff;
          --muted: #9aa0c3;
          --divider: #232347;
        }

        .list-wrap { padding: 4px; }
        .stats {
          display: flex; gap: 16px; margin: 4px 4px 14px;
        }
        .stat { background: rgba(79,70,229,0.08); border:1px solid var(--divider); border-radius: 12px; padding: 10px 14px; }
        .stat__num { font-weight: 700; font-size: 20px; }
        .stat__num--accent { color: var(--teal); }
        .stat__label { font-size: 12px; color: var(--muted); }

        .empty {
          border: 1px dashed var(--divider);
          border-radius: 14px;
          padding: 28px 16px;
          text-align: center;
          color: var(--muted);
          background: linear-gradient(180deg, rgba(224,231,255,0.04), transparent);
        }
        .empty__icon {
          display: inline-flex; padding: 10px; border-radius: 50%;
          background: rgba(20,184,166,0.12); color: var(--teal); margin-bottom: 10px;
          animation: subtle 1800ms ease-in-out infinite;
        }

        .list { list-style: none; margin: 12px 0 0; padding: 0; display: grid; gap: 10px; }
        .card {
          display: grid; grid-template-columns: auto 1fr auto; align-items: start; gap: 12px;
          background: rgba(18,18,37,0.9);
          border: 1px solid var(--divider);
          border-radius: 14px;
          padding: 12px;
          box-shadow: 0 8px 28px rgba(79,70,229,0.18);
          transition: transform 150ms ease, box-shadow 200ms ease, opacity 150ms ease;
        }
        .card:hover { transform: translateY(-1px); box-shadow: 0 12px 36px rgba(79,70,229,0.28); }
        .card--done { opacity: 0.72; }

        .check {
          margin-top: 2px;
          background: transparent; border: none; color: var(--teal); cursor: pointer;
          border-radius: 999px; padding: 4px;
          transition: transform 120ms ease, background 150ms ease;
        }
        .check:hover { transform: scale(1.06); background: rgba(20,184,166,0.12); }

        .content { min-width: 0; }
        .chips { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 6px; }
        .chip {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 4px 8px; border-radius: 999px; font-size: 12px; font-weight: 600;
        }
        .chip--high { background: rgba(239,68,68,0.15); color: #ffd3d3; border: 1px solid rgba(239,68,68,0.35); }
        .chip--medium { background: rgba(79,70,229,0.16); color: #dfe4ff; border: 1px solid rgba(79,70,229,0.4); }
        .chip--low { background: rgba(20,184,166,0.12); color: #c8fff3; border: 1px solid rgba(20,184,166,0.35); }
        .chip--voice { background: rgba(167,139,250,0.14); color: #efe9ff; border: 1px solid rgba(167,139,250,0.4); }
        .chip--outline { background: transparent; color: var(--muted); border: 1px dashed var(--divider); }

        .title { margin: 2px 0 8px; font-size: 15px; line-height: 1.35; }
        .title--line { text-decoration: line-through; text-decoration-thickness: 2px; text-decoration-color: rgba(239,68,68,0.65); }

        .meta { display: flex; gap: 10px; color: var(--muted); font-size: 12px; }
        .meta__row { display: inline-flex; gap: 6px; align-items: center; }

        .icon-btn {
          background: transparent; border: 1px solid var(--divider);
          color: #ffb4b4; border-radius: 10px; padding: 6px; height: 32px; width: 32px;
          display: inline-grid; place-items: center; cursor: pointer;
          transition: background 150ms ease, transform 120ms ease;
        }
        .icon-btn:hover { background: rgba(239,68,68,0.12); transform: translateY(-1px); }

        @keyframes subtle { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-2px); } }
      `}</style>
    </div>
  );
}

function getTimeAgo(date: number) {
  const now = new Date();
  const diff = now.getTime() - date;
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function getDueTime(dueDate: string) {
  const date = new Date(dueDate);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
