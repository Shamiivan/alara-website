import { AppShell } from "@/components/primitives/layouts";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}