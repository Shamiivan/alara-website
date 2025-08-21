import { ReactNode } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-64 shrink-0">
          <Card className="p-4">
            <nav className="flex flex-col gap-2">
              <Link
                href="/admin/telemetry"
                className="py-2 px-3 hover:bg-slate-100 rounded-md transition-colors"
              >
                Telemetry
              </Link>
              {/* Add more admin links here as needed */}
            </nav>
          </Card>
        </div>

        <div className="flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}