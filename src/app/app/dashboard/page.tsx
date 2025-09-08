"use client";

import { Page } from "@/components/primitives/layouts";
import { DashboardView } from "@/components/dashboard/DashboardView";

export default function DashboardPage() {
  return (
    <Page maxWidth="xl">
      <DashboardView />
    </Page>
  );
}