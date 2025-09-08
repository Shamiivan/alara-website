import { useCallback, useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Task, CreateTaskData, UpdateTaskData, ConvexTask, Priority } from "../types/tasks";

/**
 * Custom hook for tasks data management
 * Follows the architecture guidelines: data fetching, actions, and derived state in one place
 */
export function useTasksData() {
  // Data fetching
  const tasksQuery = useQuery(api.tasks.get_tasks) || [];
  const user = useQuery(api.user.getCurrentUser);

  // Mutations
  const createTaskMutation = useMutation(api.tasks.create_task);
  const updateTaskMutation = useMutation(api.tasks.update_task);
  const deleteTaskMutation = useMutation(api.tasks.delete_task);

  // Local state for actions
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Helper functions
  const determinePriority = useCallback((title: string): Priority => {
    const low = ["later", "sometime", "eventually", "when possible"];
    const high = ["urgent", "important", "asap", "immediately", "critical"];
    const t = title.toLowerCase();
    if (high.some(k => t.includes(k))) return "high";
    if (low.some(k => t.includes(k))) return "low";
    return "medium";
  }, []);

  // Transform Convex tasks to our Task interface
  const tasks: Task[] = useMemo(() => {
    const list = (tasksQuery as ConvexTask[]).map(t => ({
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
      // Completed tasks go to the bottom
      if (a.completed !== b.completed) return a.completed ? 1 : -1;

      // Sort by due date, then by creation time
      const ad = a.due ? new Date(a.due).getTime() : Number.POSITIVE_INFINITY;
      const bd = b.due ? new Date(b.due).getTime() : Number.POSITIVE_INFINITY;
      if (ad !== bd) return ad - bd;
      return b._creationTime - a._creationTime;
    });
  }, [tasksQuery, determinePriority]);

  // Derived data
  const todayTasks = useMemo(() => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    return tasks.filter(t => t.due && t.due.startsWith(todayStr));
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
      await createTaskMutation({
        title: data.title,
        due: data.due,
        timezone: data.timezone,
        status: "scheduled",
        source: "manual",
        userId: user._id as Id<"users">,
        reminderMinutesBefore: data.reminderMinutesBefore,
      });

      console.log("Task created successfully");
      return true;
    } catch (error) {
      console.error("Error creating task:", error);
      return false;
    } finally {
      setIsCreating(false);
    }
  }, [createTaskMutation, user]);

  const handleUpdate = useCallback(async (id: Id<"tasks">, data: UpdateTaskData): Promise<boolean> => {
    setIsUpdating(true);
    try {
      await updateTaskMutation({ id, ...data });
      console.log("Task updated successfully");
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
      await deleteTaskMutation({ id });
      console.log("Task deleted successfully");
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

  // Return standardized interface
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

    // Error state (could be expanded based on Convex error handling)
    error: null,

    // Actions
    actions: {
      handleCreate,
      handleUpdate,
      handleDelete,
      handleToggleComplete,
    },

    // Refetch (Convex handles this automatically, but keeping for interface consistency)
    refetch: () => { },
  };
}