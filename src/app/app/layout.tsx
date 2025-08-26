"use client";

import { useState, useEffect, type ReactNode, type KeyboardEvent } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TOKENS } from "@/components/tokens";
import { cn } from "@/lib/utils";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { Home, CheckSquare, Phone, Settings, ChevronLeft, ChevronRight, Menu } from "lucide-react";
import { PrimaryButton, SecondaryButton, TertiaryButton } from "@/components/ui/CustomButton";
import { QuirkyButton, ZenQuirkyButton } from "@/components/ui/QuirkyButton";


interface NavItemProps {
  href: string;
  label: string;
  icon: ReactNode;
  isActive: boolean;
  isCollapsed: boolean;
}

interface SidebarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

function NavItem({ href, label, icon, isActive, isCollapsed }: NavItemProps) {
  // Use inline styles with TOKENS to avoid Tailwind arbitrary values at runtime
  const baseStyle: React.CSSProperties = {
    width: "100%",
    fontWeight: 600,
    color: TOKENS.text,
    borderColor: isActive ? TOKENS.primary : TOKENS.border,
    background: isActive ? TOKENS.accent : TOKENS.cardBg,
    boxShadow: isActive ? TOKENS.shadow : "none",
  };

  return (
    <div>
      <Link
        href={href}
        aria-current={isActive ? "page" : undefined}
        className={cn(
          "group/nav row flex items-center gap-3 rounded-[10px] border transition-all duration-300 ease-in-out focus:outline-none",
          "hover:-translate-y-[1px] active:translate-y-0",
          "focus-visible:ring-2 focus-visible:ring-offset-2",
        )}
        style={{
          ...baseStyle, // ring color via CSS var
          // ring offset uses default, ring color comes from custom property set on root
        }}
        title={isCollapsed ? label : undefined}
      >
        <span
          className={cn("shrink-0 text-[#CBD5E1]", isActive && "!text-inherit")}
          style={{ color: isActive ? TOKENS.primary : "#94A3B8" }}
          aria-hidden
        >
          {icon}
        </span>

        {!isCollapsed && (
          <span className="truncate" style={{ color: TOKENS.text }}>{label}</span>
        )}

        {isActive && !isCollapsed && (
          <span
            aria-hidden
            className="ml-auto inline-block w-1.5 h-5 rounded-full"
            style={{ background: TOKENS.primary }}
          />
        )}
      </Link>

    </div>
  );
}

function Sidebar({ isCollapsed, toggleSidebar }: SidebarProps) {
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    handler();
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  useEffect(() => {
    if (isMobile) setShowMobileMenu(false);
  }, [pathname, isMobile]);

  const toggleMobileMenu = () => setShowMobileMenu((s) => !s);

  const navItems = [
    { href: "/app/dashboard", label: "Dashboard", icon: <Home size={20} /> },
    { href: "/app/calls", label: "Calls", icon: <Phone size={20} /> },
    { href: "/app/tasks", label: "Tasks", icon: <CheckSquare size={20} /> },
    { href: "/app/settings", label: "Settings", icon: <Settings size={20} /> },
  ];

  const brandPill = (
    <div
      className={cn("flex items-center gap-2.5 p-2 rounded-[10px] border font-bold", isCollapsed && "justify-center")}
      style={{ background: TOKENS.accent, borderColor: TOKENS.border, color: TOKENS.text }}
    >
      <div aria-hidden className="w-5 h-5 rounded-md" style={{ background: TOKENS.primary }} />
      {!isCollapsed && <span>Alara</span>}
    </div>
  );

  const collapseBtn = (
    <button
      onClick={toggleSidebar}
      className="flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 ease-in-out"
      style={{ color: TOKENS.subtext, background: TOKENS.cardBg, border: `1px solid ${TOKENS.border}` }}
      aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
    >
      {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
    </button>
  );

  const sidebarContent = (
    <>
      <div className="flex items-center justify-between mb-6">
        {collapseBtn}
      </div>

      {!isCollapsed && (
        <div className="px-1.5 py-2.5 text-xs uppercase tracking-wider" style={{ color: TOKENS.subtext }}>
          Main
        </div>
      )}

      <div className="space-y-2">
        {navItems.slice(0, 3).map((item) => (
          <NavItem
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
            isActive={item.href === pathname || (pathname?.startsWith(item.href) && item.href !== "/app/dashboard")}
            isCollapsed={isCollapsed}
          />
        ))}
      </div>

      {!isCollapsed && (
        <div className="mt-4 px-1.5 py-2.5 text-xs uppercase tracking-wider" style={{ color: TOKENS.subtext }}>
          Account
        </div>
      )}

      <div className="space-y-2">
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

      {!isCollapsed && (
        <div
          className="mt-auto p-3 rounded-[10px] text-xs"
          style={{ border: `1px solid ${TOKENS.border}`, background: TOKENS.cardBg, color: TOKENS.subtext }}
          aria-live="polite"
        >
          <div className="font-semibold mb-1.5" style={{ color: TOKENS.text }}>Tip</div>
          Keep it simple: pick one clear step. We’ll check in later.
        </div>
      )}

      {isCollapsed && (
        <div className="absolute bottom-4 left-0 right-0 text-center select-none" aria-hidden>
          <div className="text-xs font-medium opacity-70 rotate-90 mt-8" style={{ color: TOKENS.subtext, transformOrigin: "center" }}>
            👋 Hover me
          </div>
        </div>
      )}
    </>
  );

  const sidebarContainerClass = cn(
    "flex flex-col h-screen sticky top-0 transition-all duration-300 ease-in-out",
    isCollapsed ? "w-[72px] items-center px-2 py-4" : "w-[240px] p-4 gap-3"
  );

  return (
    <>
      {/* Mobile Hamburger */}
      {isMobile && (
        <button
          onClick={toggleMobileMenu}
          className="fixed top-4 left-4 z-40 p-2 rounded-md shadow-sm"
          style={{ background: TOKENS.cardBg, border: `1px solid ${TOKENS.border}` }}
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
      )}

      {/* Mobile Drawer */}
      {isMobile && (
        <div className={cn("fixed inset-0 z-50 flex transition-transform duration-300 ease-in-out", showMobileMenu ? "translate-x-0" : "-translate-x-full")}
          role="dialog" aria-modal="true" aria-label="Navigation">
          <div className="w-[280px] h-full shadow-lg flex flex-col p-4" style={{ background: TOKENS.cardBg }}>
            {sidebarContent}
          </div>
          {showMobileMenu && (
            <button className="flex-1 bg-black/30 backdrop-blur-sm" onClick={toggleMobileMenu} aria-label="Close menu" />
          )}
        </div>
      )}

      {/* Desktop Sidebar */}
      {!isMobile && (
        <aside
          className={sidebarContainerClass}
          style={{ background: TOKENS.cardBg, borderRight: `1px solid ${TOKENS.border}` }}
        >
          {sidebarContent}
        </aside>
      )}
    </>
  );
}

export default function AppLayout({ children }: { children: ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("sidebarCollapsed");
    if (saved !== null) setIsCollapsed(saved === "true");
    setIsMounted(true);

    // Set a CSS custom property for focus ring color once on mount
    document.documentElement.style.setProperty("--focus-ring", TOKENS.primary);
  }, []);

  const toggleSidebar = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("sidebarCollapsed", String(next));
      return next;
    });
  };

  if (!isMounted) return null; // avoid hydration mismatch

  return (
    <div className="min-h-screen" style={{ background: TOKENS.bg }}>
      {/* Skip link for a11y */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:px-3 focus:py-2 focus:rounded"
        style={{ background: TOKENS.cardBg, border: `1px solid ${TOKENS.border}`, color: TOKENS.text }}
      >
        Skip to content
      </a>

      <style jsx global>{`
        :root { --ring: var(--focus-ring); }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(6px);} to { opacity: 1; transform: translateY(0);} }
        .fade-in { animation: fadeInUp 320ms ease forwards; }
        @media (prefers-reduced-motion: reduce) { .fade-in { animation: none; } }
      `}</style>

      <div className="flex min-h-screen">
        <Sidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />
        <main id="main" className={cn("flex-1 transition-all duration-300 ease-in-out fade-in p-6")}>{children}</main>
      </div>
    </div>
  );
}
