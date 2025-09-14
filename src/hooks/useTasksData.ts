import { useCallback, useMemo, useState } from "react";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

export interface Task {
  _id: Id<"tasks">;
  _creationTime: number;
  title: string;
  completed: boolean;
  due: string;
  timezone: string;
  priority: "low" | "medium" | "high";
  status?: string;
}

export interface CreateTaskData {
  title: string;
  due: string;
  timezone: string;
  reminderMinutesBefore?: number;
}

export interface UpdateTaskData {
  status?: string;
  title?: string;
  due?: string;
  timezone?: string;
}

/**
 * Business data hook for tasks
 * Handles all task-related data fetching and actions
 */
export function useTasksData() {
  // Data fetching
  const tasksQuery = useQuery(api.core.tasks.queries.getTaskForUser);
  const user = useQuery(api.user.getCurrentUser);

  // Actions and mutations
  const createTaskAction = useAction(api.core.tasks.actions.createTask);
  const updateTaskMutation = useMutation(api.core.tasks.mutations.updateTask);
  const deleteTaskMutation = useMutation(api.core.tasks.mutations.deleteTask);

  // Loading states for actions
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Helper to determine priority from title
  const determinePriority = useCallback((title: string): "low" | "medium" | "high" => {
    const low = ["later", "sometime", "eventually", "when possible"];
    const high = ["urgent", "important", "asap", "immediately", "critical"];
    const t = title.toLowerCase();
    if (high.some(k => t.includes(k))) return "high";
    if (low.some(k => t.includes(k))) return "low";
    return "medium";
  }, []);

  // Transform and sort tasks
  const tasks: Task[] = useMemo(() => {
    if (!tasksQuery || !Array.isArray(tasksQuery)) {
      return [];
    }

    const transformedTasks = tasksQuery.map(t => ({
      _id: t._id,
      _creationTime: t._creationTime,
      title: t.title,
      completed: t.status === "completed",
      due: t.due,
      timezone: t.timezone,
      priority: determinePriority(t.title),
      status: t.status,
    }));

    return transformedTasks.sort((a, b) => {
      // Completed tasks go to bottom
      if (a.completed !== b.completed) return a.completed ? 1 : -1;

      // Sort by due date, then creation time
      const aDue = a.due ? new Date(a.due).getTime() : Number.POSITIVE_INFINITY;
      const bDue = b.due ? new Date(b.due).getTime() : Number.POSITIVE_INFINITY;
      if (aDue !== bDue) return aDue - bDue;
      return b._creationTime - a._creationTime;
    });
  }, [tasksQuery, determinePriority]);

  // Derived data
  const todayTasks = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return tasks.filter(t => t.due && t.due.startsWith(today));
  }, [tasks]);

  const completedTasks = useMemo(() => tasks.filter(t => t.completed), [tasks]);
  const pendingTasks = useMemo(() => tasks.filter(t => !t.completed), [tasks]);

  // Action handlers
  const handleCreate = useCallback(async (data: CreateTaskData): Promise<boolean> => {
    if (!user) {
      console.error("User not found");
      return false;
    }

    setIsCreating(true);
    try {
      const result = await createTaskAction({
        title: data.title,
        due: data.due,
        timezone: data.timezone,
        status: "scheduled",
        source: "manual",
        userId: user._id as Id<"users">,
        reminderMinutesBefore: data.reminderMinutesBefore,
      });

      if (result.success) {
        return true;
      } else {
        console.error("Failed to create task:", result.error);
        return false;
      }
    } catch (error) {
      console.error("Error creating task:", error);
      return false;
    } finally {
      setIsCreating(false);
    }
  }, [createTaskAction, user]);

  const handleUpdate = useCallback(async (id: Id<"tasks">, data: UpdateTaskData): Promise<boolean> => {
    setIsUpdating(true);
    try {
      await updateTaskMutation({ taskId: id, ...data });
      return true;
    } catch (error) {
      console.error("Error updating task:", error);
      return false;
    } finally {
      setIsUpdating(false);
    }
  }, [updateTaskMutation]);

  const handleDelete = useCallback(async (id: Id<"tasks">): Promise<boolean> => {
    setIsDeleting(true);
    try {
      await deleteTaskMutation({ taskId: id });
      return true;
    } catch (error) {
      console.error("Error deleting task:", error);
      return false;
    } finally {
      setIsDeleting(false);
    }
  }, [deleteTaskMutation]);

  const handleToggleComplete = useCallback(async (id: Id<"tasks">, completed: boolean): Promise<boolean> => {
    return handleUpdate(id, { status: completed ? "completed" : "scheduled" });
  }, [handleUpdate]);

  return {
    // Data
    allTasks: tasks,
    todayTasks,
    completedTasks,
    pendingTasks,

    // Loading states
    isLoading: tasksQuery === undefined,
    isCreating,
    isUpdating,
    isDeleting,

    // Error state
    error: null,

    // Actions
    actions: {
      handleCreate,
      handleUpdate,
      handleDelete,
      handleToggleComplete,
    },
  };
}