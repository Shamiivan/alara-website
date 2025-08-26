"use client";

import { useState, useEffect, type ReactNode } from "react";
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
  Menu
} from "lucide-react";

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
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 p-3 rounded-[10px] border transition-all duration-300 ease-in-out",
        "hover:transform hover:-translate-y-[1px]",
        "active:transform active:translate-y-0",
        isActive
          ? `bg-[${TOKENS.accent}] border-[${TOKENS.primary}] shadow-sm`
          : `bg-white border-[${TOKENS.border}] hover:bg-[#F8FAFC]`
      )}
      style={{
        width: "100%",
        fontWeight: 600,
        color: TOKENS.text,
      }}
    >
      <span
        className={cn(
          "text-[#CBD5E1]",
          isActive && `text-[${TOKENS.primary}]`
        )}
      >
        {icon}
      </span>

      {!isCollapsed && (
        <>
          <span>{label}</span>
          {isActive && (
            <span
              className="ml-auto w-1.5 h-5 rounded-full bg-indigo-500"
              aria-hidden="true"
            />
          )}
        </>
      )}
    </Link>
  );
}

function Sidebar({ isCollapsed, toggleSidebar }: SidebarProps) {
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    checkScreenSize();

    // Add resize listener
    window.addEventListener("resize", checkScreenSize);

    // Cleanup
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Close mobile menu on navigation
  useEffect(() => {
    if (isMobile) {
      setShowMobileMenu(false);
    }
  }, [pathname, isMobile]);

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  const navItems = [
    { href: "/app/dashboard", label: "Dashboard", icon: <Home size={20} /> },
    { href: "/app/calls", label: "Calls", icon: <Phone size={20} /> },
    { href: "/app/tasks", label: "Tasks", icon: <CheckSquare size={20} /> },
    { href: "/app/settings", label: "Settings", icon: <Settings size={20} /> },
  ];

  // Desktop sidebar
  const sidebarContent = (
    <>
      <div className="flex items-center justify-between mb-6">
        <div
          className={cn(
            "flex items-center gap-2.5 p-2 rounded-[10px] bg-[#E0E7FF] border border-[#E2E8F0] font-bold",
            isCollapsed && "justify-center"
          )}
        >
          <div
            aria-hidden
            className="w-5 h-5 rounded-md bg-[#4F46E5]"
          />
          {!isCollapsed && <span>Alara</span>}
        </div>

        <button
          onClick={toggleSidebar}
          className={cn(
            "flex items-center justify-center w-8 h-8 rounded-full",
            "text-[#475569] hover:text-[#0F172A] bg-white border border-[#E2E8F0]",
            "transition-all duration-300 ease-in-out hover:shadow-sm",
            "hover:animate-[wiggle_500ms_ease-in-out]",
            isCollapsed && "mx-auto mt-2"
          )}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {!isCollapsed && (
        <div className="text-xs text-[#475569] uppercase tracking-wider px-1.5 py-2.5">
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
            isActive={
              item.href === pathname ||
              (pathname?.startsWith(item.href) && item.href !== "/app/dashboard")
            }
            isCollapsed={isCollapsed}
          />
        ))}
      </div>

      {!isCollapsed && (
        <div className="text-xs text-[#475569] uppercase tracking-wider px-1.5 py-2.5 mt-4">
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
          className="mt-auto p-3 rounded-[10px] border border-[#E2E8F0] bg-white text-[#475569] text-xs"
        >
          <div className="font-semibold mb-1.5 text-[#0F172A]">Tip</div>
          You can keep things simple: one clear step, scheduled check‑in later.
        </div>
      )}

      {isCollapsed && (
        <div className="absolute bottom-4 left-0 right-0 text-center">
          <div
            className="text-xs font-medium text-[#475569] opacity-70 rotate-90 mt-8"
            style={{ transformOrigin: "center" }}
          >
            👋 Hover me!
          </div>
        </div>
      )}
    </>
  );

  // Styles
  const sidebarContainerClass = cn(
    "flex flex-col bg-white border-r border-[#E2E8F0] h-screen sticky top-0 transition-all duration-300 ease-in-out",
    isCollapsed ? "w-[72px] items-center px-2 py-4" : "w-[240px] p-4 gap-3"
  );

  const mobileMenuClass = cn(
    "fixed inset-0 z-50 flex transform transition-transform duration-300 ease-in-out",
    showMobileMenu ? "translate-x-0" : "-translate-x-full"
  );

  return (
    <>
      {/* Mobile Hamburger Button */}
      {isMobile && (
        <button
          onClick={toggleMobileMenu}
          className="fixed top-4 left-4 z-40 p-2 rounded-md bg-white border border-[#E2E8F0] shadow-sm"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
      )}

      {/* Mobile Menu Overlay */}
      {isMobile && (
        <div className={mobileMenuClass}>
          <div className="w-[280px] bg-white shadow-lg flex flex-col p-4 h-full">
            {sidebarContent}
          </div>
          {/* Backdrop */}
          {showMobileMenu && (
            <div
              className="flex-1 bg-black/30 backdrop-blur-sm"
              onClick={toggleMobileMenu}
              aria-hidden="true"
            ></div>
          )}
        </div>
      )}

      {/* Desktop Sidebar */}
      {!isMobile && (
        <aside className={sidebarContainerClass}>
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
    // Check for saved sidebar state
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState !== null) {
      setIsCollapsed(savedState === 'true');
    }
    setIsMounted(true);
  }, []);

  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    // Save to localStorage
    localStorage.setItem('sidebarCollapsed', String(newState));
  };

  // Don't render sidebar state until mounted to prevent hydration mismatch
  if (!isMounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <style jsx global>{`
        @keyframes fadeInUp { 
          from { opacity: 0; transform: translateY(6px); } 
          to { opacity: 1; transform: translateY(0); } 
        }
        
        @keyframes wiggle {
          0% { transform: rotate(0deg); }
          25% { transform: rotate(-5deg); }
          50% { transform: rotate(0deg); }
          75% { transform: rotate(5deg); }
          100% { transform: rotate(0deg); }
        }
        
        .fade-in { animation: fadeInUp 320ms ease forwards; }
      `}</style>

      <div className="flex min-h-screen">
        <Sidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />

        <main
          className={cn(
            "flex-1 transition-all duration-300 ease-in-out",
            "fade-in p-6"
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}