"use client";

import React from "react";
import { useTasksData } from "@/hooks/useTasksData";
import { TasksView } from "./TasksView";

/**
 * TodoApp - Clean wrapper that coordinates data and UI
 * Follows the architecture: Page coordinates data, View handles UI
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