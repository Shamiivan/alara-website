"use client";

import TodoApp from "@/components/tasks/TodoApp";
import { Page } from "@/components/primitives/layouts";

export default function TasksPage() {
  return (
    <Page
      title="Tasks"
      subtitle="Track your progress, one small win at a time"
      maxWidth="xl"
    >
      <TodoApp />
    </Page>
  );
}