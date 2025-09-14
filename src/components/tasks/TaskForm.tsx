"use client";

import React, { useState, useEffect, useId, useMemo } from "react";
import { Plus, Calendar, Clock, Sparkles } from "lucide-react";
import { CreateTaskData } from "@/hooks/useTasksData";

interface TaskFormProps {
  onSubmit: (data: CreateTaskData) => Promise<boolean>;
  isSubmitting?: boolean;
}

export function TaskForm({ onSubmit, isSubmitting }: TaskFormProps) {
  // Form state
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("");
  const [reminderMinutes, setReminderMinutes] = useState(10);
  const [errors, setErrors] = useState<{ title?: string; date?: string }>({});
  const [success, setSuccess] = useState(false);

  // IDs for accessibility
  const titleId = useId();
  const dateId = useId();
  const timeId = useId();

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
      });

      if (success) {
        setSuccess(true);
        setTitle("");
        setTimeout(() => setSuccess(false), 1000);
      }
    } catch (error) {
      setErrors({ title: "Failed to create task" });
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles size={18} className="text-blue-600" />
        <h3 className="font-semibold text-gray-900">Add New Task</h3>
      </div>

      {Object.keys(errors).length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <div className="text-sm text-red-700">
            {Object.values(errors).map((error, i) => (
              <div key={i}>{error}</div>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label htmlFor={titleId} className="block text-sm font-medium text-gray-700 mb-1">
            Task *
          </label>
          <input
            id={titleId}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="What needs to be done?"
            maxLength={200}
            autoFocus
          />
          <div className="flex justify-between mt-1">
            <span className="text-xs text-gray-500">
              Start with a verb for clarity
            </span>
            <span className={`text-xs ${titleTooLong ? 'text-red-500' : 'text-gray-500'}`}>
              {title.length}/140
            </span>
          </div>
        </div>

        {/* Date and Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor={dateId} className="block text-sm font-medium text-gray-700 mb-1">
              <Calendar size={14} className="inline mr-1" />
              Due Date *
            </label>
            <input
              id={dateId}
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={() => setQuickDate("today")}
                className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => setQuickDate("tomorrow")}
                className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              >
                Tomorrow
              </button>
              <button
                type="button"
                onClick={() => setQuickDate("monday")}
                className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              >
                Next Mon
              </button>
            </div>
          </div>

          <div>
            <label htmlFor={timeId} className="block text-sm font-medium text-gray-700 mb-1">
              <Clock size={14} className="inline mr-1" />
              Time
            </label>
            <input
              id={timeId}
              type="time"
              value={dueTime}
              onChange={(e) => setDueTime(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="text-xs text-gray-500 mt-1">
              Timezone: {timezone}
            </div>
          </div>
        </div>

        {/* Reminder */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reminder
          </label>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm text-gray-600">Notify me</span>
            <input
              type="number"
              min={1}
              max={1440}
              value={reminderMinutes}
              onChange={(e) => setReminderMinutes(parseInt(e.target.value) || 10)}
              className="w-20 px-2 py-1 border border-gray-300 rounded text-center text-sm"
            />
            <span className="text-sm text-gray-600">minutes before</span>
          </div>
          <div className="flex gap-2">
            {[5, 10, 30, 60].map((minutes) => (
              <button
                key={minutes}
                type="button"
                onClick={() => setReminderMinutes(minutes)}
                className={`text-xs px-3 py-1 rounded transition-colors ${reminderMinutes === minutes
                    ? 'bg-blue-100 text-blue-700 border border-blue-300'
                    : 'bg-gray-100 hover:bg-gray-200 border border-gray-300'
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
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg font-medium transition-colors"
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

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
            <div className="text-sm text-green-700">Task created successfully!</div>
          </div>
        )}
      </form>
    </div>
  );
}