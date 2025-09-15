"use client";

import React, { useState, useEffect, useId, useMemo } from "react";
import { Plus, Calendar, Clock, Sparkles, Timer } from "lucide-react";
import { CreateTaskData } from "@/hooks/useTasksData";
import { toast } from "sonner";

interface TaskFormProps {
  onSubmit: (data: CreateTaskData) => Promise<boolean>;
  isSubmitting?: boolean;
}

export function TaskForm({ onSubmit, isSubmitting }: TaskFormProps) {
  // Form state
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("");
  const [duration, setDuration] = useState(30); // Duration in minutes
  const [reminderMinutes, setReminderMinutes] = useState(10);
  const [errors, setErrors] = useState<{ title?: string; date?: string }>({});

  // IDs for accessibility
  const titleId = useId();
  const dateId = useId();
  const timeId = useId();
  const durationId = useId();

  // Get user's timezone
  const timezone = useMemo(() =>
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    []
  );

  // Validation
  const titleTooLong = title.trim().length > 140;
  const isValid = title.trim() && dueDate && !titleTooLong;

  // Set defaults
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setDueDate(tomorrow.toISOString().split("T")[0]);
    setDueTime("12:00");
  }, []);

  // Quick date setters
  const setQuickDate = (type: "today" | "tomorrow" | "monday") => {
    const date = new Date();
    if (type === "tomorrow") date.setDate(date.getDate() + 1);
    if (type === "monday") {
      const day = date.getDay();
      const diff = (1 + 7 - day) % 7 || 7;
      date.setDate(date.getDate() + diff);
    }
    setDueDate(date.toISOString().split("T")[0]);
  };

  // Quick duration setters
  const setQuickDuration = (minutes: number) => {
    setDuration(minutes);
  };

  // Format duration for display
  const formatDuration = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) return `${hours}h`;
    return `${hours}h ${remainingMinutes}m`;
  };

  // Validation
  const validate = () => {
    const newErrors: { title?: string; date?: string } = {};
    if (!title.trim()) newErrors.title = "Task title is required";
    if (titleTooLong) newErrors.title = "Keep title under 140 characters";
    if (!dueDate) newErrors.date = "Due date is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const dateTime = new Date(`${dueDate}T${dueTime || "12:00"}:00`);
      const success = await onSubmit({
        title: title.trim(),
        due: dateTime.toISOString(),
        timezone,
        reminderMinutesBefore: reminderMinutes,
        duration: duration, // Add duration to the submission
      });

      if (success) {
        toast.success("Task created");
        setTitle("");
      }
    } catch (error) {
      toast.error("Failed to create task");
    }
  };

  return (
    <div className="rounded-xl p-6 shadow-sm border bg-[hsl(var(--card))]">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles size={18} className="text-[hsl(var(--primary))]" />
        <h3 className="font-semibold text-[hsl(var(--foreground))]">Add New Task</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label htmlFor={titleId} className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">
            Task *
          </label>
          <input
            id={titleId}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] focus:ring-offset-1 border-[hsl(var(--border))]"
            placeholder="What needs to be done?"
            maxLength={200}
            autoFocus
          />
          <div className="flex justify-between mt-1">
            <span className="text-xs text-[hsl(var(--muted-foreground))]">
              Start with a verb for clarity
            </span>
            <span className={`text-xs ${titleTooLong ? 'text-[hsl(var(--destructive))]' : 'text-[hsl(var(--muted-foreground))]'}`}>
              {title.length}/140
            </span>
          </div>
          {errors.title && (
            <div className="mt-1 text-xs text-[hsl(var(--destructive))]">{errors.title}</div>
          )}
        </div>

        {/* Date and Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor={dateId} className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">
              <Calendar size={14} className="inline mr-1" />
              Due Date *
            </label>
            <input
              id={dateId}
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] focus:ring-offset-1 border-[hsl(var(--border))]"
            />
            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={() => setQuickDate("today")}
                className="text-xs px-2 py-1 rounded transition-colors bg-[hsl(var(--muted))] hover:opacity-80"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => setQuickDate("tomorrow")}
                className="text-xs px-2 py-1 rounded transition-colors bg-[hsl(var(--muted))] hover:opacity-80"
              >
                Tomorrow
              </button>
              <button
                type="button"
                onClick={() => setQuickDate("monday")}
                className="text-xs px-2 py-1 rounded transition-colors bg-[hsl(var(--muted))] hover:opacity-80"
              >
                Next Mon
              </button>
            </div>
            {errors.date && (
              <div className="mt-1 text-xs text-[hsl(var(--destructive))]">{errors.date}</div>
            )}
          </div>

          <div>
            <label htmlFor={timeId} className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">
              <Clock size={14} className="inline mr-1" />
              Time
            </label>
            <input
              id={timeId}
              type="time"
              value={dueTime}
              onChange={(e) => setDueTime(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] focus:ring-offset-1 border-[hsl(var(--border))]"
            />
            <div className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
              Timezone: {timezone}
            </div>
          </div>
        </div>

        {/* Duration */}
        <div>
          <label htmlFor={durationId} className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
            <Timer size={14} className="inline mr-1" />
            Duration
          </label>
          <div className="flex items-center gap-2 mb-2">
            <input
              id={durationId}
              type="number"
              min={5}
              max={480}
              step={5}
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value) || 30)}
              className="w-20 px-2 py-1 border rounded text-center text-sm border-[hsl(var(--border))]"
            />
            <span className="text-sm text-[hsl(var(--muted-foreground))]">
              minutes ({formatDuration(duration)})
            </span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {[15, 30, 60, 90, 120, 240].map((minutes) => (
              <button
                key={minutes}
                type="button"
                onClick={() => setQuickDuration(minutes)}
                className={`text-xs px-3 py-1 rounded border transition-colors ${duration === minutes
                  ? 'bg-[hsl(var(--primary-light))] text-[hsl(var(--primary-dark))] border-[hsl(var(--primary-light))]'
                  : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] border-[hsl(var(--border))] hover:opacity-80'
                  }`}
              >
                {formatDuration(minutes)}
              </button>
            ))}
          </div>
          <div className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
            How long do you expect this task to take?
          </div>
        </div>

        {/* Reminder */}
        <div>
          <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
            Reminder
          </label>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm text-[hsl(var(--muted-foreground))]">Notify me</span>
            <input
              type="number"
              min={1}
              max={1440}
              value={reminderMinutes}
              onChange={(e) => setReminderMinutes(parseInt(e.target.value) || 10)}
              className="w-20 px-2 py-1 border rounded text-center text-sm border-[hsl(var(--border))]"
            />
            <span className="text-sm text-[hsl(var(--muted-foreground))]">minutes before</span>
          </div>
          <div className="flex gap-2">
            {[5, 10, 30, 60].map((minutes) => (
              <button
                key={minutes}
                type="button"
                onClick={() => setReminderMinutes(minutes)}
                className={`text-xs px-3 py-1 rounded border transition-colors ${reminderMinutes === minutes
                  ? 'bg-[hsl(var(--primary-light))] text-[hsl(var(--primary-dark))] border-[hsl(var(--primary-light))]'
                  : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] border-[hsl(var(--border))] hover:opacity-80'
                  }`}
              >
                {minutes}m
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={!isValid || isSubmitting}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary-dark))] disabled:opacity-60"
        >
          {isSubmitting ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Plus size={16} />
              Add Task
            </>
          )}
        </button>
      </form>
    </div>
  );
}