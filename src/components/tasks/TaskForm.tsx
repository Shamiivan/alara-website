"use client";

import React, { useState } from 'react';
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Calendar, Clock, Plus, X } from 'lucide-react';

interface TaskFormProps {
  userId?: Id<"users">;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ userId, onSuccess, onCancel }) => {
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [reminderMinutes, setReminderMinutes] = useState(5);
  const [errors, setErrors] = useState<{ title?: string; date?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const createTask = useMutation(api.tasks.create_task);

  // Set default date to tomorrow
  React.useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setDueDate(tomorrow.toISOString().split('T')[0]);
    setDueTime('12:00');
  }, []);

  const validateForm = (): boolean => {
    const newErrors: { title?: string; date?: string } = {};

    if (!title.trim()) {
      newErrors.title = 'Task name is required';
    }

    if (!dueDate) {
      newErrors.date = 'Due date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Combine date and time
      const dateTimeString = `${dueDate}T${dueTime}:00`;
      const dueDateTime = new Date(dateTimeString);

      await createTask({
        title: title.trim(),
        due: dueDateTime.toISOString(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        status: 'scheduled',
        source: 'manual',
        userId: userId,
        reminderMinutesBefore: reminderMinutes
      });

      // Show success message
      setShowSuccess(true);

      // Reset form
      setTitle('');

      // Call success callback after a short delay
      setTimeout(() => {
        setShowSuccess(false);
        if (onSuccess) {
          onSuccess();
        }
      }, 1500);
    } catch (error) {
      console.error('Error creating task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-6 shadow-task">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Add New Task</h3>
        {onCancel && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onCancel}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          {/* Task Title */}
          <div>
            <label htmlFor="task-title" className="block text-sm font-medium text-muted-foreground mb-1">
              Task Name*
            </label>
            <Input
              id="task-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              className={errors.title ? "border-destructive" : ""}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-destructive">{errors.title}</p>
            )}
          </div>

          {/* Due Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="due-date" className="block text-sm font-medium text-muted-foreground mb-1">
                <Calendar className="inline-block w-4 h-4 mr-1" />
                Due Date*
              </label>
              <Input
                id="due-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className={errors.date ? "border-destructive" : ""}
              />
              {errors.date && (
                <p className="mt-1 text-sm text-destructive">{errors.date}</p>
              )}
            </div>

            <div>
              <label htmlFor="due-time" className="block text-sm font-medium text-muted-foreground mb-1">
                <Clock className="inline-block w-4 h-4 mr-1" />
                Time
              </label>
              <Input
                id="due-time"
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
              />
            </div>
          </div>

          {/* Reminder Time */}
          <div>
            <label htmlFor="reminder-minutes" className="block text-sm font-medium text-muted-foreground mb-1">
              Reminder (minutes before due time)
            </label>
            <div className="flex items-center gap-2">
              <Input
                id="reminder-minutes"
                type="number"
                min="1"
                max="1440"
                value={reminderMinutes}
                onChange={(e) => setReminderMinutes(parseInt(e.target.value) || 5)}
                className="w-24"
              />
              <span className="text-sm text-muted-foreground">minutes before</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              You&apos;ll receive a reminder {reminderMinutes} {reminderMinutes === 1 ? 'minute' : 'minutes'} before the task is due
            </p>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </span>
              ) : (
                <span className="flex items-center">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Task
                </span>
              )}
            </Button>
          </div>
        </div>
      </form>

      {/* Success Message */}
      {showSuccess && (
        <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-md text-center animate-fade-in">
          Task created successfully!
        </div>
      )}
    </Card>
  );
};

export default TaskForm;