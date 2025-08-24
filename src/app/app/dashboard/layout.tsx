// app/(app)/layout.tsx
import type { ReactNode } from "react";
import { Sidebar } from "@/components/SideBar";
import { TOKENS } from "@/components/tokens";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pageStyle: React.CSSProperties = {
    minHeight: "100vh",
    backgroundColor: TOKENS.bg,
  };

  const shellStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "auto 1fr",
    minHeight: "100vh",
  };

  const contentColStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  };

  return (
    <html lang="en">
      <body style={pageStyle}>
        <style>{`
          @keyframes fadeInUp { 
            from { opacity: 0; transform: translateY(6px); } 
            to { opacity: 1; transform: translateY(0); } 
          }
          @keyframes sweep {
            0% { background-position: 100% 0; }
            100% { background-position: 0 0; }
          }
          .fade-in { animation: fadeInUp 320ms ease forwards; }
        `}</style>

        <div style={shellStyle}>
          <Sidebar />
          <div style={contentColStyle}>{children}</div>
        </div>
      </body>
    </html>
  );
}
