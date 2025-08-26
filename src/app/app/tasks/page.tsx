"use client";

import { useState, useEffect } from "react";
import TodoApp from "@/components/tasks/TodoApp";
import { TOKENS } from "@/components/tokens";
import { CheckSquare, Sparkles } from "lucide-react";

export default function TasksPage() {
  // Track if component has mounted for animations
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Add entrance animations after mount
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-4 sm:space-y-6 max-w-3xl mx-auto">
      <div
        className="flex flex-col gap-2"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(10px)',
          transition: 'opacity 0.4s ease, transform 0.4s ease'
        }}
      >
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: TOKENS.text }}>Tasks</h1>
          <CheckSquare className="h-6 w-6 text-indigo-500" style={{ opacity: 0.9 }} />
        </div>
        <p className="text-base" style={{ color: TOKENS.subtext }}>
          Track your progress, one small win at a time
        </p>
      </div>

      <div
        className="p-4 sm:p-6 rounded-[16px] border bg-white shadow-sm"
        style={{
          borderColor: TOKENS.border,
          boxShadow: TOKENS.shadow,
          opacity: mounted ? 1 : 0,
          transition: 'opacity 0.5s ease 0.2s'
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-5 w-5 text-amber-500 wiggle-effect" />
          <h2 className="text-lg font-semibold" style={{ color: TOKENS.text }}>Your Tasks</h2>
        </div>

        <TodoApp />
      </div>
    </div>
  );
}