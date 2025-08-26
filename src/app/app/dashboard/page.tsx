"use client";

import NextCallCard from "@/components/dashboard/NextCallCard";
import { TOKENS } from "@/components/tokens";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-[#0F172A]">Dashboard</h1>
        <p className="text-[#475569]">Welcome to your Alara dashboard</p>
      </div>

      <div
        className="p-6 rounded-[12px] border border-[#E2E8F0] bg-white shadow-sm"
        style={{
          boxShadow: TOKENS.shadow,
          animation: "fadeInUp 350ms ease forwards"
        }}
      >
        <h2 className="text-lg font-semibold mb-4">Getting Started</h2>
        <p className="text-[#475569] mb-3">
          This dashboard is part of the new collapsible sidebar layout. Here's what you can do:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-[#475569]">
          <li>Toggle the sidebar using the button in the top corner</li>
          <li>Navigate between Dashboard, Calls, and Tasks</li>
          <li>The sidebar collapses to icons-only on desktop</li>
          <li>On mobile, it transforms into a full-screen overlay</li>
          <li>Your sidebar state is remembered between sessions</li>
        </ul>
        <NextCallCard
          onSave={() => { }}
          onCancel={() => { }}
          compact={true}
        />

      </div>
    </div>
  );
}
