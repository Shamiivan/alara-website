import React, { useState } from "react";
import { Plus, Clock, CheckCircle2, Circle, Trash2, CheckSquare, Timer } from "lucide-react";
import { Task, CreateTaskData } from "@/hooks/useTasksData";
import { TaskForm } from "./TaskForm";
import { Id } from "../../../convex/_generated/dataModel";
import { toast } from "sonner";

interface TasksViewProps {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  isCreating: boolean;
  onCreate: (data: CreateTaskData) => Promise<boolean>;
  onToggleComplete: (id: Id<"tasks">, completed: boolean) => Promise<boolean>;
  onDelete: (id: Id<"tasks">) => Promise<boolean>;
}

export function TasksView({
  tasks,
  isLoading,
  error,
  isCreating,
  onCreate,
  onToggleComplete,
  onDelete
}: TasksViewProps) {
  const [showForm, setShowForm] = useState(false);

  // Calculate progress
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const progressPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Handle task completion with feedback
  const handleToggle = async (id: Id<"tasks">, completed: boolean, title: string) => {
    const success = await onToggleComplete(id, completed);
    if (!success) {
      toast.error("Could not update task");
      return;
    }
    if (completed) {
      const messages = [
        `Completed: ${truncateTitle(title)}`,
        "One more done",
        "Progress made",
        "Nice work",
      ];
      toast.success(messages[Math.floor(Math.random() * messages.length)]);
    } else {
      toast("Marked as incomplete");
    }
  };

  // Handle form submission
  const handleFormSubmit = async (data: CreateTaskData) => {
    const success = await onCreate(data);
    if (success) {
      setShowForm(false);
      toast.success("Task created");
    } else {
      toast.error("Failed to create task");
    }
    return success;
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 sm:px-6 py-6">
        <div className="rounded-lg p-4 border bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]">
          <div className="font-medium">Unable to load tasks</div>
          <div className="text-sm opacity-80 mt-1">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 py-6 max-w-3xl mx-auto">
      {/* Header with progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">Tasks</h1>
            <p className="text-[hsl(var(--muted-foreground))]">
              {completed > 0 ? `${completed} of ${total} completed` : "Let's get started"}
            </p>
          </div>

          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary-dark))] active:scale-[0.99]"
            >
              <Plus size={16} />
              Add Task
            </button>
          )}
        </div>

        {/* Progress bar */}
        {total > 0 && (
          <div className="w-full bg-[hsl(var(--primary-light))] rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all duration-300 bg-[hsl(var(--primary))]"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        )}
      </div>

      {/* Task form */}
      {showForm && (
        <div className="mb-6 fade-in">
          <TaskForm
            onSubmit={handleFormSubmit}
            isSubmitting={isCreating}
          />
          <button
            onClick={() => setShowForm(false)}
            className="mt-3 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Empty state */}
      {tasks.length === 0 && !showForm && (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-[hsl(var(--primary-light))]">
            <CheckSquare size={24} className="text-[hsl(var(--primary))]" />
          </div>
          <h3 className="text-lg font-medium text-[hsl(var(--foreground))] mb-2">No tasks yet</h3>
          <p className="text-[hsl(var(--muted-foreground))] mb-4">Add your first task to get started</p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary-dark))]"
          >
            <Plus size={16} />
            Add Task
          </button>
        </div>
      )}

      {/* Task list */}
      {tasks.length > 0 && (
        <div className="space-y-3">
          {tasks.map((task) => (
            <div
              key={task._id}
              className={`rounded-lg p-4 transition-all duration-200 bg-[hsl(var(--card))] shadow-sm hover:shadow-md overflow-hidden ${task.completed
                ? 'opacity-85'
                : 'hover:translate-y-[-1px]'
                }`}
            >
              <div className="flex items-start gap-3">
                {/* Completion toggle */}
                <button
                  onClick={() => handleToggle(task._id, !task.completed, task.title)}
                  className="mt-0.5 p-1 rounded-full transition-colors hover:bg-[hsl(var(--muted))] active:scale-95"
                >
                  {task.completed ? (
                    <CheckCircle2 size={20} className="text-[hsl(var(--success))]" />
                  ) : (
                    <Circle size={20} className="text-[hsl(var(--muted-foreground))]" />
                  )}
                </button>

                {/* Task content (row-based layout) */}
                <div className="flex-1 min-w-0 flex flex-col gap-2">
                  <h3 className={`font-medium break-words ${task.completed
                    ? 'text-[hsl(var(--muted-foreground))] line-through'
                    : 'text-[hsl(var(--foreground))]'
                    }`}>
                    {task.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-3">
                    {/* Priority badge */}
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${task.priority === 'high'
                      ? 'bg-red-50 text-[hsl(var(--destructive))] border-red-200'
                      : task.priority === 'low'
                        ? 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] border-[hsl(var(--border))]'
                        : 'bg-[hsl(var(--primary-light))] text-[hsl(var(--primary-dark))] border-[hsl(var(--primary-light))]'
                      }`}>
                      {task.priority}
                    </span>

                    {/* Duration - Only show if exists */}
                    {task.duration && (
                      <div className="flex items-center gap-1 text-sm text-[hsl(var(--muted-foreground))]">
                        <Timer size={14} />
                        {formatDuration(task.duration)}
                      </div>
                    )}

                    {/* Due date */}
                    {task.due && (
                      <div className="flex items-center gap-1 text-sm text-[hsl(var(--muted-foreground))]">
                        <Clock size={14} />
                        {formatDueDate(task.due)}
                      </div>
                    )}

                    {/* Time ago */}
                    <div className="text-xs text-[hsl(var(--muted-foreground))] opacity-70">
                      {getTimeAgo(task._creationTime)}
                    </div>

                    {/* Delete button aligned to end of row */}
                    <button
                      onClick={async () => {
                        const ok = await onDelete(task._id);
                        if (ok) toast.success("Task deleted");
                        else toast.error("Failed to delete task");
                      }}
                      className="ml-auto p-1 rounded transition-colors text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--destructive))] hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Helper functions
function truncateTitle(title: string, maxLength = 30): string {
  return title.length > maxLength ? title.slice(0, maxLength) + '...' : title;
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) return `${hours}h`;
  return `${hours}h ${remainingMinutes}m`;
}

function formatDueDate(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dueDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const diffTime = dueDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const timeString = date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });

  if (diffDays === 0) return `Today at ${timeString}`;
  if (diffDays === 1) return `Tomorrow at ${timeString}`;
  if (diffDays === -1) return `Yesterday at ${timeString}`;
  if (diffDays < -1) return `${Math.abs(diffDays)} days ago`;
  if (diffDays <= 7) return `${date.toLocaleDateString([], { weekday: 'short' })} at ${timeString}`;

  return date.toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function getTimeAgo(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}