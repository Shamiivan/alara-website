"use client";

import TodoApp from "@/components/tasks/TodoApp";

export default function TasksPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-[#0F172A]">Tasks</h1>
        <p className="text-[#475569]">Manage your to-do list</p>
      </div>

      <div className="p-6 rounded-[12px] border border-[#E2E8F0] bg-white shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Your Tasks</h2>
        <p className="text-[#475569]">
        </p>
        <TodoApp />
      </div>
    </div>
  );
}