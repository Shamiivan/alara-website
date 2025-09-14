
import React, { useState } from "react";
import { Plus, Clock, CheckCircle2, Circle, Trash2, CheckSquare } from "lucide-react";
import { Task, CreateTaskData } from "@/hooks/useTasksData";
import { TaskForm } from "./TaskForm";
import { Id } from "../../../convex/_generated/dataModel";

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
  const [feedback, setFeedback] = useState<string | null>(null);

  // Calculate progress
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const progressPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Handle task completion with feedback
  const handleToggle = async (id: Id<"tasks">, completed: boolean, title: string) => {
    const success = await onToggleComplete(id, completed);
    if (success && completed) {
      const messages = [
        `Great job completing "${truncateTitle(title)}"!`,
        "One more task done!",
        "Progress made!",
        "Nice work!",
      ];
      setFeedback(messages[Math.floor(Math.random() * messages.length)]);
      setTimeout(() => setFeedback(null), 2000);
    }
  };

  // Handle form submission
  const handleFormSubmit = async (data: CreateTaskData) => {
    const success = await onCreate(data);
    if (success) {
      setShowForm(false);
      setFeedback("Task added successfully!");
      setTimeout(() => setFeedback(null), 2000);
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
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-800 font-medium">Unable to load tasks</div>
          <div className="text-red-600 text-sm mt-1">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header with progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
            <p className="text-gray-600">
              {completed > 0 ? `${completed} of ${total} completed` : "Let's get started"}
            </p>
          </div>

          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              <Plus size={16} />
              Add Task
            </button>
          )}
        </div>

        {/* Progress bar */}
        {total > 0 && (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        )}
      </div>

      {/* Feedback message */}
      {feedback && (
        <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3 text-center">
          <div className="text-green-700 text-sm">{feedback}</div>
        </div>
      )}

      {/* Task form */}
      {showForm && (
        <div className="mb-6">
          <TaskForm
            onSubmit={handleFormSubmit}
            isSubmitting={isCreating}
          />
          <button
            onClick={() => setShowForm(false)}
            className="mt-3 text-sm text-gray-500 hover:text-gray-700"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Empty state */}
      {tasks.length === 0 && !showForm && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckSquare size={24} className="text-blue-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks yet</h3>
          <p className="text-gray-600 mb-4">Add your first task to get started</p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
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
              className={`bg-white border rounded-lg p-4 transition-all duration-200 ${task.completed
                  ? 'border-gray-200 bg-gray-50'
                  : 'border-gray-200 hover:border-gray-300'
                }`}
            >
              <div className="flex items-start gap-3">
                {/* Completion toggle */}
                <button
                  onClick={() => handleToggle(task._id, !task.completed, task.title)}
                  className="mt-0.5 p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                  {task.completed ? (
                    <CheckCircle2 size={20} className="text-green-600" />
                  ) : (
                    <Circle size={20} className="text-gray-400" />
                  )}
                </button>

                {/* Task content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h3 className={`font-medium ${task.completed
                          ? 'text-gray-500 line-through'
                          : 'text-gray-900'
                        }`}>
                        {task.title}
                      </h3>

                      <div className="flex items-center gap-4 mt-1">
                        {/* Priority badge */}
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${task.priority === 'high'
                            ? 'bg-red-100 text-red-700'
                            : task.priority === 'low'
                              ? 'bg-gray-100 text-gray-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                          {task.priority}
                        </span>

                        {/* Due date */}
                        {task.due && (
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Clock size={14} />
                            {formatDueDate(task.due)}
                          </div>
                        )}

                        {/* Time ago */}
                        <div className="text-xs text-gray-400">
                          {getTimeAgo(task._creationTime)}
                        </div>
                      </div>
                    </div>

                    {/* Delete button */}
                    <button
                      onClick={() => onDelete(task._id)}
                      className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
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