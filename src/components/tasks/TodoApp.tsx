"use client";

import React from "react";
import { useTasksData } from "@/hooks/useTasksData";
import { TasksView } from "./TasksView";

/**
 * TodoApp - Simple wrapper that coordinates data and UI
 * Data logic is now handled by useTasksData hook
 * UI is handled by pure TasksView component
 */
export default function TodoApp() {
  const {
    allTasks,
    isLoading,
    error,
    isCreating,
    actions: { handleCreate, handleToggleComplete, handleDelete }
  } = useTasksData();

  return (
    <TasksView
      tasks={allTasks}
      isLoading={isLoading}
      error={error}
      isCreating={isCreating}
      onCreate={handleCreate}
      onToggleComplete={handleToggleComplete}
      onDelete={handleDelete}
    />
  );
}
