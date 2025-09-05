
"use client";

import React, { useState, useEffect, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Home, CheckSquare, Phone, Settings, X, Sparkles } from "lucide-react";
import { LogoutButton } from "@/components/auth/LogoutButton";

interface NavItemProps {
  href: string;
  label: string;
  icon: ReactNode;
  isActive: boolean;
  onNavigate?: () => void;
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const COLORS = {
  indigo: "#4F46E5",
  lavender: "#E0E7FF",
  slate: "#334155",
  border: "#E5E7EB",
  white: "#FFFFFF",
  ink: "#0F172A",
};

function NavItem({ href, label, icon, isActive, onNavigate }: NavItemProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(href);
    // Call navigation callback if provided
    if (onNavigate) {
      onNavigate();
    }
  };

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium rounded-lg transition-all hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
      style={{
        color: isActive ? COLORS.indigo : COLORS.slate,
        backgroundColor: isActive ? COLORS.lavender : 'transparent',
        borderRight: isActive ? `2px solid ${COLORS.indigo}` : 'none',
      }}
      aria-current={isActive ? "page" : undefined}
    >
      <span className="shrink-0" style={{
        transform: isActive ? 'scale(1.1)' : 'scale(1)',
        transition: 'transform 0.2s ease'
      }}>
        {icon}
      </span>
      <span className="truncate">{label}</span>
    </button>
  );
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(true); // Start with mobile assumption

  useEffect(() => {
    // Only check screen size, don't trigger any state changes
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  const navItems = [
    { href: "/app/dashboard", label: "Dashboard", icon: <Home size={20} /> },
    { href: "/app/calls", label: "Calls", icon: <Phone size={20} /> },
    { href: "/app/tasks", label: "Tasks", icon: <CheckSquare size={20} /> },
    { href: "/app/settings", label: "Settings", icon: <Settings size={20} /> },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={`fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen && isMobile ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full z-50 flex flex-col w-full sm:w-80 max-w-80 transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        style={{
          backgroundColor: COLORS.white,
          borderRight: `1px solid ${COLORS.border}`,
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
        }}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-4"
          style={{ borderBottom: `1px solid ${COLORS.border}` }}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: COLORS.indigo }}
            >
              <Sparkles size={16} color="white" />
            </div>
            <h1 className="text-lg font-bold" style={{ color: COLORS.ink }}>
              Alara
            </h1>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Close navigation"
            style={{ display: isMobile ? 'flex' : 'none' }}
          >
            <X size={20} style={{ color: COLORS.slate }} />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 py-4 overflow-y-auto">
          <div
            className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider"
            style={{ color: COLORS.slate }}
          >
            Navigation
          </div>

          <nav className="px-3 space-y-1">
            {navItems.map((item) => (
              <NavItem
                key={item.href}
                {...item}
                isActive={pathname === item.href || (pathname?.startsWith(item.href) && item.href !== "/app/dashboard")}
                onNavigate={isMobile ? onClose : undefined}
              />
            ))}
          </nav>
        </div>

        {/* Footer */}
        <div
          className="p-4"
          style={{ borderTop: `1px solid ${COLORS.border}` }}
        >
          <LogoutButton variant="subtle" />
        </div>
      </aside>
    </>
  );
}