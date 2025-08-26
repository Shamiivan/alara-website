"use client";

import { useState, useEffect, type ReactNode, useRef } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { TOKENS } from "@/components/tokens";
import { cn } from "@/lib/utils";
import { LogoutButton } from "@/components/auth/LogoutButton";
import {
  Home,
  CheckSquare,
  Phone,
  Settings,
  ChevronLeft,
  ChevronRight,
  Menu,
} from "lucide-react";

/* ---------------- UX helpers ---------------- */
function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(mq.matches);
    onChange();
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);
  return reduced;
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isMobile;
}

/* ---------------- Types ---------------- */
interface NavItemProps {
  href: string;
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  isCollapsed: boolean;
}

/* ---------------- Nav items ---------------- */
const NAV_ITEMS = [
  { href: "/app/dashboard", label: "Dashboard", icon: <Home size={20} /> },
  { href: "/app/calls", label: "Calls", icon: <Phone size={20} /> },
  { href: "/app/tasks", label: "Tasks", icon: <CheckSquare size={20} /> },
];

function NavItem({ href, label, icon, isActive, isCollapsed }: NavItemProps) {
  return (
    <Link
      href={href}
      title={isCollapsed ? label : undefined} // native tooltip when collapsed
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "group relative flex items-center gap-3 p-3 rounded-[10px] border transition-all duration-300 ease-in-out focus:outline-none",
        "hover:-translate-y-[1px] active:translate-y-0",
        "focus-visible:ring-2 focus-visible:ring-offset-2",
      )}
      style={{
        width: "100%",
        fontWeight: 600,
        color: TOKENS.text,
        background: isActive ? TOKENS.accent : "#FFFFFF",
        borderColor: isActive ? TOKENS.primary : TOKENS.border,
        boxShadow: isActive ? TOKENS.shadow : "none",
      }}
    >
      <span
        className="grid place-items-center"
        style={{ color: isActive ? TOKENS.primary : "#94A3B8" }}
      >
        {icon}
      </span>

      {!isCollapsed && (
        <>
          <span className="truncate">{label}</span>
          {isActive && (
            <span
              className="ml-auto w-1.5 h-5 rounded-full"
              aria-hidden="true"
              style={{ background: TOKENS.primary }}
            />
          )}
        </>
      )}
    </Link>
  );
}

/* ---------------- Sidebar ---------------- */
interface SidebarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
  announce: (msg: string) => void;
}

export function Sidebar({ isCollapsed, toggleSidebar, announce }: SidebarProps) {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  // Diagnostic logs to track prop values
  useEffect(() => {
    console.log("SideBar props received:", {
      isCollapsed,
      hasToggleFunction: typeof toggleSidebar === 'function',
      hasAnnounceFunction: typeof announce === 'function'
    });
  }, [isCollapsed, toggleSidebar, announce]);

  // close mobile menu on nav
  useEffect(() => {
    if (isMobile) setShowMobileMenu(false);
  }, [pathname, isMobile]);

  const toggleMobileMenu = () => setShowMobileMenu((s) => !s);

  // desktop content
  const sidebarContent = (
    <>
      {/* brand + collapse */}
      <div className="flex items-center justify-between mb-6 w-full">
        <button
          className={cn(
            "flex items-center gap-2.5 p-2 rounded-[10px] border font-bold",
            isCollapsed ? "justify-center w-9" : "px-3",
          )}
          style={{
            background: TOKENS.accent,
            borderColor: TOKENS.border,
            color: TOKENS.text,
          }}
          aria-label="Alara home"
        >
          <span
            aria-hidden
            className="w-5 h-5 rounded-md"
            style={{ background: TOKENS.primary }}
          />
          {!isCollapsed && <span className="select-none">Alara</span>}
        </button>

        <button
          onClick={() => {
            toggleSidebar();
            announce(isCollapsed ? "Sidebar expanded" : "Sidebar collapsed");
          }}
          className={cn(
            "flex items-center justify-center w-8 h-8 rounded-full border transition-all",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          )}
          style={{
            color: "#475569",
            background: "#FFFFFF",
            borderColor: TOKENS.border,
            boxShadow: "0 0 0 0 rgba(0,0,0,0)",
          }}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-pressed={isCollapsed ? "true" : "false"}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {!isCollapsed && (
        <div
          className="text-xs uppercase tracking-wider px-1.5 py-2.5"
          style={{ color: "#475569" }}
          aria-hidden="true"
        >
          Main
        </div>
      )}

      <nav aria-label="Primary" className="space-y-2 w-full">
        {NAV_ITEMS.map((item) => (
          <NavItem
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
            isActive={
              item.href === pathname ||
              (pathname?.startsWith(item.href) && item.href !== "/app/dashboard")
            }
            isCollapsed={isCollapsed}
          />
        ))}
      </nav>

      {!isCollapsed && (
        <div
          className="text-xs uppercase tracking-wider px-1.5 py-2.5 mt-4"
          style={{ color: "#475569" }}
          aria-hidden="true"
        >
          Account
        </div>
      )}

      <div className="space-y-2 w-full">
        <NavItem
          href="/app/settings"
          label="Settings"
          icon={<Settings size={20} />}
          isActive={pathname?.startsWith("/app/settings") || false}
          isCollapsed={isCollapsed}
        />
      </div>

      <div className="h-2" />

      <LogoutButton variant="subtle" />

      {/* small, kind hint */}
      {!isCollapsed && (
        <div
          className="mt-auto p-3 rounded-[10px] border text-xs"
          style={{ borderColor: TOKENS.border, background: "#FFFFFF", color: "#475569" }}
        >
          <div className="font-semibold mb-1.5" style={{ color: TOKENS.text }}>
            Gentle nudge
          </div>
          You can change your call time any moment. One clear step is enough for today.
        </div>
      )}

      {isCollapsed && (
        <div className="absolute bottom-4 left-0 right-0 text-center">
          <div
            className="text-xs font-medium opacity-70 rotate-90 mt-8"
            style={{ color: "#475569", transformOrigin: "center" }}
            aria-hidden="true"
          >
            👋 hover me
          </div>
        </div>
      )}
    </>
  );

  // containers
  const sidebarContainerClass = cn(
    "flex flex-col bg-white border-r h-screen sticky top-0",
    "transition-all ease-in-out",
    isCollapsed ? "w-[72px] items-center px-2 py-4" : "w-[240px] p-4 gap-3",
  );

  const sidebarStyle: React.CSSProperties = {
    borderColor: TOKENS.border,
  };

  const mobileMenuClass = cn(
    "fixed inset-0 z-50 flex",
    reducedMotion ? "" : "transform transition-transform duration-300 ease-in-out",
    showMobileMenu ? "translate-x-0" : "-translate-x-full",
  );

  return (
    <>
      {/* Mobile trigger */}
      {isMobile && (
        <button
          onClick={toggleMobileMenu}
          className="fixed top-4 left-4 z-40 p-2 rounded-md border shadow-sm bg-white"
          style={{ borderColor: TOKENS.border }}
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
      )}

      {/* Mobile drawer */}
      {isMobile && (
        <div className={mobileMenuClass}>
          <div
            className="w-[280px] bg-white shadow-lg flex flex-col p-4 h-full"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation"
          >
            {sidebarContent}
          </div>
          {showMobileMenu && (
            <button
              className="flex-1 bg-black/30 backdrop-blur-sm"
              onClick={toggleMobileMenu}
              aria-label="Close menu"
            />
          )}
        </div>
      )}

      {/* Desktop sidebar */}
      {!isMobile && (
        <aside className={sidebarContainerClass} style={sidebarStyle} aria-label="Sidebar">
          {sidebarContent}
        </aside>
      )}
    </>
  );
}

/* ---------------- Layout ---------------- */
export default function AppLayout({ children }: { children: ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const liveRef = useRef<HTMLDivElement>(null); // polite announcements
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const saved = localStorage.getItem("sidebarCollapsed");
    if (saved !== null) setIsCollapsed(saved === "true");
    setIsMounted(true);
  }, []);

  function toggleSidebar() {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("sidebarCollapsed", String(next));
      return next;
    });
  }

  function announce(msg: string) {
    if (liveRef.current) liveRef.current.textContent = msg;
  }

  if (!isMounted) return null;

  return (
    <div className="min-h-screen" style={{ background: TOKENS.bg }}>
      {/* Accessible skip link */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 px-3 py-2 rounded-md border bg-white"
        style={{ borderColor: TOKENS.border, boxShadow: TOKENS.shadow }}
      >
        Skip to content
      </a>

      {/* polite live region for small status updates */}
      <div
        ref={liveRef}
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />

      <style jsx global>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-in {
          ${reducedMotion ? "" : "animation: fadeInUp 320ms ease forwards;"}
        }
      `}</style>

      <div className="flex min-h-screen">
        <Sidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} announce={announce} />

        <main
          id="main"
          className={cn("flex-1 p-6 fade-in outline-none")}
          tabIndex={-1}
        >
          {/* friendly microcopy on first paint */}
          <div
            className="mb-4 text-sm"
            style={{ color: TOKENS.subtext }}
            aria-live="polite"
          >
            You’re doing better than you think. What’s one step you can finish now?
          </div>

          {children}
        </main>
      </div>
    </div>
  );
}