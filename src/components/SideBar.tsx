"use client";

import { usePathname, useRouter } from "next/navigation";
import { TOKENS } from "./tokens";
import { LogoutButton } from "@/components/auth/LogoutButton";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const brandStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "6px 10px",
    borderRadius: 10,
    background: TOKENS.accent,
    border: `1px solid ${TOKENS.border}`,
    fontWeight: 700,
    color: TOKENS.text,
  };

  const navGroupLabel: React.CSSProperties = {
    fontSize: 12,
    color: TOKENS.subtext,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    padding: "10px 6px 4px",
  };

  const navItemBase: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 12px",
    borderRadius: 10,
    border: `1px solid ${TOKENS.border}`,
    background: "#FFFFFF",
    cursor: "pointer",
    fontWeight: 600,
    color: TOKENS.text,
    transition: "background-color 150ms ease, transform 150ms ease",
  };

  const navItemActive = (active: boolean): React.CSSProperties =>
    active
      ? {
        ...navItemBase,
        background: TOKENS.accent,
        borderColor: TOKENS.primary,
        boxShadow: TOKENS.shadow,
      }
      : navItemBase;

  const NavItem = ({
    label,
    href,
    active,
  }: {
    label: string;
    href: string;
    active: boolean;
  }) => (
    <button
      className="tap"
      onClick={() => router.push(href)}
      aria-current={active ? "page" : undefined}
      style={navItemActive(active)}
      onMouseEnter={(e) =>
      ((e.currentTarget as HTMLButtonElement).style.backgroundColor = active
        ? TOKENS.accent
        : "#F8FAFC")
      }
      onMouseLeave={(e) =>
      ((e.currentTarget as HTMLButtonElement).style.backgroundColor = active
        ? TOKENS.accent
        : "#FFFFFF")
      }
    >
      <span
        style={{
          display: "inline-block",
          width: 8,
          height: 8,
          borderRadius: 999,
          background: active ? TOKENS.primary : "#CBD5E1",
        }}
        aria-hidden
      />
      <span>{label}</span>
    </button>
  );

  const sidebarStyle: React.CSSProperties = {
    backgroundColor: "#FFFFFF",
    borderRight: `1px solid ${TOKENS.border}`,
    width: 240,
    position: "sticky",
    top: 0,
    alignSelf: "start",
    height: "100vh",
    padding: 16,
    display: "none", // hidden on mobile
  };
  if (typeof window !== "undefined" && window.innerWidth >= 768) {
    (sidebarStyle as React.CSSProperties).display = "flex";
    (sidebarStyle as React.CSSProperties).flexDirection = "column";
    (sidebarStyle as React.CSSProperties).gap = 12;
  }

  return (
    <aside style={sidebarStyle}>
      <style>{`
        .tap:hover { transform: translateY(-1px); }
        .tap:active { transform: translateY(0); }
      `}</style>

      <div style={brandStyle}>
        <div
          aria-hidden
          style={{ width: 20, height: 20, borderRadius: 6, background: TOKENS.primary }}
        />
        <span>Alara</span>
      </div>

      <div style={navGroupLabel}>Main</div>
      <NavItem label="Dashboard" href="/dashboard" active={pathname === "/dashboard"} />
      <NavItem label="Tasks" href="/tasks" active={pathname?.startsWith("/tasks") || false} />
      <NavItem label="Calls" href="/calls" active={pathname?.startsWith("/calls") || false} />

      <div style={navGroupLabel}>Account</div>
      <NavItem
        label="Settings"
        href="/settings"
        active={pathname?.startsWith("/settings") || false}
      />

      <div style={{ height: 8 }} />
      <LogoutButton variant="subtle" />

      <div
        style={{
          marginTop: "auto",
          padding: 12,
          borderRadius: 10,
          border: `1px solid ${TOKENS.border}`,
          background: "#FFFFFF",
          color: TOKENS.subtext,
          fontSize: 12,
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: 6, color: TOKENS.text }}>Tip</div>
        You can keep things simple: one clear step, scheduled check‑in later.
      </div>
    </aside>
  );
}
