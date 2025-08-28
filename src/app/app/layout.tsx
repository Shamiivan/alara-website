"use client";

import React, { useState, useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { TOKENS } from "@/components/tokens";
import { cn } from "@/lib/utils";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { Home, CheckSquare, Phone, Settings, Menu, X, Sparkles } from "lucide-react";

interface NavItemProps {
  href: string;
  label: string;
  icon: ReactNode;
  isActive: boolean;
  onClick?: () => void;
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

// Mobile-first navigation item with improved touch targets and visual feedback
function NavItem({ href, label, icon, isActive, onClick }: NavItemProps) {
  const router = useRouter();
  const [isPressed, setIsPressed] = useState(false);

  const handleClick = () => {
    router.push(href);
    onClick?.(); // Close mobile sidebar after navigation
  };

  const baseClasses = cn(
    // Layout & sizing - mobile-first with 44px minimum touch target
    "flex items-center gap-3 w-full min-h-[44px] px-3 py-2.5",
    // Typography
    "text-sm font-medium transition-all duration-200",
    // Interactive states
    "hover:bg-accent/10 focus:bg-accent/10 focus:outline-none focus:ring-2 focus:ring-primary/20",
    // Active state styling
    isActive
      ? "bg-primary/10 text-primary border-r-2 border-primary"
      : "text-muted-foreground hover:text-foreground",
    // Press animation
    isPressed ? "scale-[0.98]" : "scale-100"
  );

  return (
    <button
      onClick={handleClick}
      className={baseClasses}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      aria-current={isActive ? "page" : undefined}
    >
      <span className={cn(
        "shrink-0 transition-transform duration-200",
        isActive ? "scale-110" : "scale-100"
      )}>
        {icon}
      </span>
      <span className="truncate">{label}</span>
    </button>
  );
}

// Brand header component
function SidebarHeader({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex items-center justify-between p-4 border-b border-border/50">
      <div className="flex items-center gap-2">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: TOKENS.primary }}
        >
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <h1 className="text-lg font-bold text-foreground">Alara</h1>
      </div>

      {/* Mobile close button */}
      <button
        onClick={onClose}
        className="md:hidden p-2 rounded-lg hover:bg-accent/10 transition-colors"
        aria-label="Close navigation"
      >
        <X size={20} />
      </button>
    </div>
  );
}

// Main sidebar component with proper responsive behavior
function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { href: "/app/dashboard", label: "Dashboard", icon: <Home size={20} /> },
    { href: "/app/calls", label: "Calls", icon: <Phone size={20} /> },
    { href: "/app/tasks", label: "Tasks", icon: <CheckSquare size={20} /> },
    { href: "/app/settings", label: "Settings", icon: <Settings size={20} /> },
  ];

  const sidebarClasses = cn(
    // Base positioning and sizing
    "fixed left-0 top-0 h-full bg-card border-r border-border/50 z-50",
    "flex flex-col transition-transform duration-300 ease-in-out",
    // Width: mobile full-screen overlay, desktop fixed sidebar
    "w-full sm:w-80",
    // Transform states for slide animation
    isOpen ? "translate-x-0" : "-translate-x-full"
  );

  return (
    <>
      {/* Mobile backdrop overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar panel */}
      <aside className={sidebarClasses} role="navigation" aria-label="Main navigation">
        <SidebarHeader onClose={onClose} />

        {/* Navigation section */}
        <div className="flex-1 py-4 overflow-y-auto">
          <div className="px-3 mb-2">
            <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Navigation
            </p>
          </div>

          <nav className="space-y-1 px-3">
            {navItems.map((item) => (
              <NavItem
                key={item.href}
                {...item}
                isActive={pathname === item.href || (pathname?.startsWith(item.href) && item.href !== "/app/dashboard")}
                onClick={onClose}
              />
            ))}
          </nav>
        </div>

        {/* Footer with logout */}
        <div className="p-4 border-t border-border/50">
          <LogoutButton variant="subtle" />
        </div>
      </aside>
    </>
  );
}

// Mobile menu toggle button
function MobileMenuButton({ onClick, isOpen }: { onClick: () => void; isOpen: boolean }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "fixed top-4 left-4 z-30 md:hidden",
        "w-11 h-11 rounded-xl bg-card border border-border/50 shadow-lg",
        "flex items-center justify-center transition-all duration-200",
        "hover:bg-accent/10 focus:bg-accent/10 focus:outline-none focus:ring-2 focus:ring-primary/20",
        isOpen ? "opacity-0 pointer-events-none" : "opacity-100"
      )}
      aria-label="Open navigation menu"
    >
      <Menu size={20} className="text-foreground" />
    </button>
  );
}

// Main layout component
export default function AppLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Handle responsive behavior and initial setup
  useEffect(() => {
    setIsMounted(true);

    // Close sidebar when clicking outside on desktop
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.querySelector('[role="navigation"]');
      const menuButton = document.querySelector('[aria-label="Open navigation menu"]');

      if (sidebar && !sidebar.contains(event.target as Node) &&
        menuButton && !menuButton.contains(event.target as Node) &&
        window.innerWidth >= 768) {
        setSidebarOpen(false);
      }
    };

    // Handle escape key
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [sidebarOpen]);

  // Prevent flash of unstyled content
  if (!isMounted) {
    return null;
  }

  const mainClasses = cn(
    "min-h-screen bg-background transition-all duration-300 ease-in-out",
    // Content area positioning with proper sidebar offset
    sidebarOpen ? "md:ml-80" : "ml-0"
  );

  return (
    <div className="relative">
      {/* Skip to main content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md"
      >
        Skip to main content
      </a>

      {/* Mobile menu button */}
      <MobileMenuButton
        onClick={() => setSidebarOpen(true)}
        isOpen={sidebarOpen}
      />

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content area */}
      <main
        id="main-content"
        className={mainClasses}
      >
        <div className="container mx-auto px-4 py-6 md:py-8 max-w-7xl">
          {/* Content wrapper with proper spacing for mobile menu button */}
          <div className="pt-16 md:pt-0">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}