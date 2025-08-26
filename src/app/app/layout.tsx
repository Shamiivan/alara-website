"use client";

import React, { useState, useEffect, useMemo, type ReactNode } from "react";
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
  isCollapsed: boolean;
  style?: React.CSSProperties;
}

interface SidebarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

function NavItem({ href, label, icon, isActive, isCollapsed, style }: NavItemProps & { style?: React.CSSProperties }) {
  const router = useRouter();
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [node, setNode] = useState<HTMLButtonElement | null>(null);

  // Use inline styles with TOKENS to avoid Tailwind arbitrary values at runtime
  const baseStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 12,
    width: "100%",
    padding: "10px 14px",
    fontWeight: 600,
    color: TOKENS.text,
    borderRadius: TOKENS.radius,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: isActive ? TOKENS.primary : TOKENS.border,
    background: isActive ? TOKENS.accent : hovered ? `${TOKENS.accent}30` : TOKENS.cardBg,
    boxShadow: isActive ? TOKENS.shadow : "none",
    transition: "all 0.2s ease",
    position: "relative",
    overflow: "hidden",
    cursor: "pointer",
    transform: pressed ? "scale(0.98)" : hovered ? "translateY(-2px)" : "translateY(0)",
    ...style
  };

  // Interactive effects similar to CustomButton
  useEffect(() => {
    if (!node) return;

    const onFocus = () => {
      node.style.boxShadow = isActive ? TOKENS.shadow : TOKENS.focus;
    };

    const onBlur = () => {
      node.style.boxShadow = isActive ? TOKENS.shadow : "none";
    };

    node.addEventListener("focus", onFocus);
    node.addEventListener("blur", onBlur);

    return () => {
      node.removeEventListener("focus", onFocus);
      node.removeEventListener("blur", onBlur);
    };
  }, [node, isActive]);

  const handleClick = () => {
    router.push(href);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      router.push(href);
    }
  };

  return (
    <div>
      <button
        ref={setNode}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        aria-current={isActive ? "page" : undefined}
        className={cn(
          "btn-pressable",
          isActive ? "active-nav-item" : "nav-item"
        )}
        style={baseStyle}
        title={isCollapsed ? label : undefined}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onMouseDown={() => setPressed(true)}
        onMouseUp={() => setPressed(false)}
        onBlur={() => setPressed(false)}
      >
        {/* Navigation charm/effect */}
        {!isActive && (
          <span
            aria-hidden
            className="nav-ripple"
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              background: `radial-gradient(circle at 50% 50%, ${TOKENS.accent}80, transparent 70%)`,
              opacity: 0,
              transition: "opacity 300ms ease",
              transform: "scale(0.85)",
            }}
          />
        )}

        {/* Icon with animation */}
        <span
          className={cn(
            "shrink-0",
            isActive ? "text-primary" : "text-subtext",
            hovered && !isActive ? "nav-icon-hover" : ""
          )}
          style={{
            color: isActive ? TOKENS.primary : hovered ? TOKENS.primary : TOKENS.subtext,
            transition: "transform 0.2s ease, color 0.2s ease",
            transform: hovered ? "scale(1.1)" : "scale(1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1
          }}
          aria-hidden
        >
          {icon}
        </span>

        {/* Label with hover effect */}
        {!isCollapsed && (
          <span
            className="truncate"
            style={{
              color: TOKENS.text,
              transition: "transform 0.2s ease",
              transform: hovered ? "translateX(2px)" : "translateX(0)",
              position: "relative",
              zIndex: 1
            }}
          >
            {label}
          </span>
        )}

        {/* Active indicator */}
        {isActive && !isCollapsed && (
          <span
            aria-hidden
            className="ml-auto inline-block w-2 h-5 rounded-full"
            style={{
              background: TOKENS.primary,
              position: "relative",
              zIndex: 1,
              boxShadow: "0 0 8px rgba(79,70,229,0.4)"
            }}
          />
        )}
      </button>

      <style jsx>{`
        .nav-item:hover .nav-ripple {
          opacity: 1;
        }
        .active-nav-item {
          animation: gentle-pulse 2s infinite alternate;
        }
        @keyframes gentle-pulse {
          0% {
            box-shadow: 0 0 0 rgba(79,70,229,0.1);
          }
          100% {
            box-shadow: 0 0 8px rgba(79,70,229,0.2);
          }
        }
      `}</style>
    </div>
  );
}

function Sidebar({ isCollapsed, toggleSidebar }: SidebarProps) {
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showQuote, setShowQuote] = useState(false);
  const [quote, setQuote] = useState("");
  // Add haptic feedback support
  const [canVibrate, setCanVibrate] = useState(false);

  // Inspirational quotes for random display
  const quotes = [
    "Small steps every day lead to big changes.",
    "The best time to start was yesterday. The second best time is now.",
    "Progress over perfection.",
    "Every task completed is a win worth celebrating.",
    "Focus on one small thing at a time.",
    "You've got this! One step at a time.",
    "Remember to breathe and take breaks.",
    "Today's efforts build tomorrow's success."
  ];

  // Select a random quote
  useEffect(() => {
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    setQuote(randomQuote);
  }, []);

  useEffect(() => {
    // Check for vibration support
    if ('vibrate' in navigator) {
      setCanVibrate(true);
    }

    // Mobile detection with a slightly larger breakpoint for better experience
    const handler = () => setIsMobile(window.innerWidth < 800);
    handler();
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  useEffect(() => {
    if (isMobile) setShowSidebar(false);
  }, [pathname, isMobile]);

  // Show sidebar function
  const openSidebar = () => {
    setShowSidebar(true);
    // Add subtle haptic feedback if supported
    if (canVibrate) {
      navigator.vibrate(5);
    }
  };

  // Close sidebar function
  const closeSidebar = () => {
    setShowSidebar(false);
    // Add subtle haptic feedback if supported
    if (canVibrate) {
      navigator.vibrate(5);
    }
  };

  // Easter egg function - show a random quote
  const showRandomQuote = () => {
    setShowQuote(true);
    if (canVibrate) {
      navigator.vibrate([10, 30, 10]);
    }
    setTimeout(() => setShowQuote(false), 4000);
  };

  const navItems = [
    { href: "/app/dashboard", label: "Dashboard", icon: <Home size={20} /> },
    { href: "/app/calls", label: "Calls", icon: <Phone size={20} /> },
    { href: "/app/tasks", label: "Tasks", icon: <CheckSquare size={20} /> },
    { href: "/app/settings", label: "Settings", icon: <Settings size={20} /> },
  ];

  // Brand logo/pill with Easter egg
  const brandPill = (
    <div
      className="flex items-center gap-2.5 p-2 rounded-[10px] border font-bold hover-lift"
      style={{
        background: TOKENS.accent,
        borderColor: TOKENS.border,
        color: TOKENS.text,
        cursor: "pointer",
        transition: "all 0.2s ease"
      }}
      onClick={showRandomQuote}
    >
      <div
        aria-hidden
        className={cn("w-5 h-5 rounded-md", showQuote ? "wiggle-effect" : "")}
        style={{ background: TOKENS.primary }}
      />
      <span>Alara</span>

      {showQuote && (
        <div
          className="absolute left-12 top-12 z-50 p-3 rounded-lg shadow-lg bg-white border"
          style={{
            borderColor: TOKENS.border,
            animation: "fadeInUp 0.3s ease forwards",
            maxWidth: "220px"
          }}
        >
          <p className="text-sm">"{quote}"</p>
          <div
            className="absolute -top-2 left-4 h-2 w-4 rotate-45 bg-white border-t border-l"
            style={{ borderColor: TOKENS.border }}
          />
        </div>
      )}
    </div>
  );

  // Close button
  const closeBtn = (
    <button
      onClick={closeSidebar}
      className="flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 ease-in-out hover:bg-red-50"
      style={{
        color: TOKENS.error || "#EF4444",
        background: TOKENS.cardBg,
        border: `1px solid ${TOKENS.border}`
      }}
      aria-label="Close sidebar"
    >
      <X size={16} />
    </button>
  );

  const sidebarContent = (
    <>
      <div className="flex items-center justify-between mb-6">
        {brandPill}
        {closeBtn}
      </div>

      <div className="px-1.5 py-2.5 text-xs uppercase tracking-wider" style={{ color: TOKENS.subtext }}>
        Main
      </div>

      <div className="space-y-3">
        {navItems.slice(0, 3).map((item, index) => (
          <NavItem
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
            isActive={item.href === pathname || (pathname?.startsWith(item.href) && item.href !== "/app/dashboard")}
            isCollapsed={false}
            style={{
              opacity: 0,
              transform: 'translateX(-10px)',
              animation: `fadeInUp 0.3s ease forwards ${index * 0.1 + 0.1}s`
            }}
          />
        ))}
      </div>

      <div className="mt-4 px-1.5 py-2.5 text-xs uppercase tracking-wider" style={{ color: TOKENS.subtext }}>
        Account
      </div>

      <div className="space-y-2">
        <NavItem
          href="/app/settings"
          label="Settings"
          icon={<Settings size={20} />}
          isActive={pathname?.startsWith("/app/settings") || false}
          isCollapsed={false}
          style={{
            opacity: 0,
            transform: 'translateX(-10px)',
            animation: 'fadeInUp 0.3s ease forwards 0.4s'
          }}
        />
      </div>

      <div className="h-2" />
      <LogoutButton variant="subtle" />

      <div
        className="mt-auto p-3 rounded-[10px] text-xs hover-lift"
        style={{
          border: `1px solid ${TOKENS.border}`,
          background: TOKENS.cardBg,
          color: TOKENS.subtext,
          opacity: 0,
          transform: 'translateY(10px)',
          animation: 'fadeInUp 0.3s ease forwards 0.5s'
        }}
        aria-live="polite"
      >
        <div className="font-semibold mb-1.5 flex items-center gap-2" style={{ color: TOKENS.text }}>
          <Sparkles size={14} className="text-amber-500" /> Tip
        </div>
        Keep it simple: pick one clear step. We'll check in later.
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Hamburger - improved position and styling */}
      {isMobile && !showSidebar && (
        <button
          onClick={openSidebar}
          className="fixed top-4 left-4 z-40 p-3 rounded-full shadow-md transition-all duration-200 hover:scale-105 active:scale-95"
          style={{
            background: TOKENS.cardBg,
            border: `1px solid ${TOKENS.border}`,
            boxShadow: TOKENS.shadow
          }}
          aria-label="Open menu"
        >
          <Menu size={20} color={TOKENS.primary} />
        </button>
      )}

      {/* Sidebar - Full overlay on mobile, side panel on desktop */}
      <div
        className={cn(
          "fixed inset-0 z-50",
          "transition-all duration-300 ease-in-out",
          isMobile ? (showSidebar ? "opacity-100" : "opacity-0 pointer-events-none") : "pointer-events-none"
        )}
        role="dialog"
        aria-modal={isMobile ? "true" : "false"}
        aria-label="Navigation"
      >
        {/* Backdrop with blur effect (mobile only) */}
        {isMobile && (
          <div
            className={cn(
              "absolute inset-0 bg-black/30 backdrop-blur-sm",
              "transition-opacity duration-300",
              showSidebar ? "opacity-100" : "opacity-0"
            )}
            onClick={closeSidebar}
            aria-hidden="true"
          />
        )}

        {/* Sidebar panel with improved animation */}
        <div
          className={cn(
            "h-full shadow-lg flex flex-col p-5",
            "transition-all duration-300 ease-out",
            isMobile ?
              (showSidebar ? "translate-x-0" : "-translate-x-full") :
              (showSidebar ? "translate-x-0 pointer-events-auto" : "-translate-x-full")
          )}
          style={{
            background: TOKENS.cardBg,
            borderRight: `1px solid ${TOKENS.border}`,
            width: "280px",
            position: isMobile ? "absolute" : "fixed",
            left: 0,
            top: 0,
            bottom: 0
          }}
        >
          {sidebarContent}
        </div>
      </div>

      {/* Desktop version - adjusts main content to make room for sidebar when visible */}
      {!isMobile && showSidebar && (
        <div
          className="w-[280px] h-full invisible"
          aria-hidden="true"
        />
      )}
    </>
  );
}

export default function AppLayout({ children }: { children: ReactNode }) {
  const [showSidebar, setShowSidebar] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [showTip, setShowTip] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  // Cursor spotlight effect state
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showSpotlight, setShowSpotlight] = useState(false);
  const [sparklePosition, setSparklePosition] = useState({ x: 0, y: 0 });
  const [showSparkle, setShowSparkle] = useState(false);

  // Random tips for delight - moved inside useMemo to avoid recreation on each render
  const tips = useMemo(() => [
    "Try double-clicking any empty space for a surprise!",
    "Press &apos;T&apos; to quickly add a new task from anywhere.",
    "Feeling stressed? Take 3 deep breaths before your next call.",
    "One small win today is better than a perfect plan tomorrow.",
    "Need a break? Try the 20-20-20 rule: look at something 20 feet away for 20 seconds every 20 minutes."
  ], []);

  const [currentTip, setCurrentTip] = useState("");

  useEffect(() => {
    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    setCurrentTip(randomTip);

    // Check screen size
    const checkMobile = () => setIsMobile(window.innerWidth < 800);
    checkMobile();
    window.addEventListener("resize", checkMobile);

    // Show sidebar by default on desktop, keep hidden on mobile
    setShowSidebar(!window.matchMedia("(max-width: 800px)").matches);

    // Set mounted state
    setIsMounted(true);

    // Set a CSS custom property for focus ring color once on mount
    document.documentElement.style.setProperty("--focus-ring", TOKENS.primary);

    // Easter egg - double click to show tip
    const handleDoubleClick = (e: MouseEvent) => {
      setShowTip(true);
      setTimeout(() => setShowTip(false), 5000);

      // Show sparkle effect at click position
      setSparklePosition({ x: e.clientX, y: e.clientY });
      setShowSparkle(true);
      setTimeout(() => setShowSparkle(false), 1000);
    };

    document.addEventListener("dblclick", handleDoubleClick);

    // Keyboard shortcut for quick task
    const handleKeydown = (e: globalThis.KeyboardEvent) => {
      if (e.key === 't' && !e.ctrlKey && !e.metaKey &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement)) {
        // Show tip about keyboard shortcut
        setCurrentTip("Press 'T' to quickly add a new task! (Coming soon)");
        setShowTip(true);
        setTimeout(() => setShowTip(false), 3000);
      }
    };

    document.addEventListener("keydown", handleKeydown as EventListener);

    // Cursor spotlight effect
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX,
        y: e.clientY
      });
    };

    const handleMouseEnter = () => {
      setShowSpotlight(true);
    };

    const handleMouseLeave = () => {
      setShowSpotlight(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener("resize", checkMobile);
      document.removeEventListener("dblclick", handleDoubleClick);
      document.removeEventListener("keydown", handleKeydown as EventListener);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [tips]);

  if (!isMounted) return null; // avoid hydration mismatch

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: TOKENS.bg }}>
      {/* Cursor spotlight effect */}
      {showSpotlight && !isMobile && (
        <div
          aria-hidden="true"
          style={{
            position: 'fixed',
            top: mousePosition.y,
            left: mousePosition.x,
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background: `radial-gradient(circle at center, ${TOKENS.accent}20 0%, transparent 70%)`,
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
            zIndex: 1,
            opacity: 0.6,
            transition: 'opacity 0.3s ease',
          }}
        />
      )}

      {/* Sparkle effect on double click */}
      {showSparkle && (
        <div
          aria-hidden="true"
          style={{
            position: 'fixed',
            top: sparklePosition.y,
            left: sparklePosition.x,
            pointerEvents: 'none',
            zIndex: 2,
          }}
        >
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                width: '10px',
                height: '10px',
                backgroundColor: i % 2 === 0 ? TOKENS.primary : '#FFC107',
                borderRadius: '50%',
                transform: `rotate(${i * 72}deg) translate(0, -15px)`,
                transformOrigin: 'center center',
                animation: 'sparkleEffect 0.8s ease-out forwards',
                animationDelay: `${i * 0.08}s`,
              }}
            />
          ))}
        </div>
      )}
      {/* Skip link for a11y */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:px-3 focus:py-2 focus:rounded"
        style={{ background: TOKENS.cardBg, border: `1px solid ${TOKENS.border}`, color: TOKENS.text }}
      >
        Skip to content
      </a>

      {/* Random tip overlay */}
      {showTip && (
        <div
          className="fixed bottom-4 right-4 z-50 p-4 rounded-lg shadow-lg bg-white border"
          style={{
            borderColor: TOKENS.border,
            animation: "fadeInUp 0.3s ease forwards",
            maxWidth: "300px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)"
          }}
        >
          <div className="flex items-start gap-3">
            <Sparkles className="text-amber-500 mt-1 pulse-subtle" size={16} />
            <div>
              <p className="text-sm font-medium mb-1" style={{ color: TOKENS.text }}>Pro Tip</p>
              <p className="text-sm" style={{ color: TOKENS.subtext }}>{currentTip}</p>
            </div>
            <button
              onClick={() => setShowTip(false)}
              className="ml-auto -mt-1 -mr-1 p-1 rounded-full hover:bg-gray-100"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

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
        @keyframes fadeInLeft { from { opacity: 0; transform: translateX(-15px);} to { opacity: 1; transform: translateX(0);} }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
        @keyframes wiggle { 0%, 100% { transform: rotate(0deg); } 25% { transform: rotate(1deg); } 75% { transform: rotate(-1deg); } }
        @keyframes spotlight {
          0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
          30% { opacity: 0.6; }
          70% { opacity: 0.6; }
          100% { transform: translate(-50%, -50%) scale(3); opacity: 0; }
        }
        @keyframes sparkleEffect {
          0% { transform: scale(0) rotate(0deg); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: scale(1.5) rotate(45deg); opacity: 0; }
        }
        
        .fade-in { animation: fadeInUp 320ms ease forwards; }
        .fade-in-left { animation: fadeInLeft 320ms ease forwards; }
        .pulse-subtle { animation: pulse 2s ease-in-out infinite; }
        .float-effect { animation: float 3s ease-in-out infinite; }
        .wiggle-effect { animation: wiggle 2s ease-in-out infinite; }
        
        /* Enhanced mobile interaction styles */
        button, a { touch-action: manipulation; }
        
        @media (hover: hover) {
          .hover-lift { transition: transform 0.2s ease; }
          .hover-lift:hover { transform: translateY(-2px); }
        }
        
        @media (prefers-reduced-motion: reduce) {
          .fade-in, .fade-in-left, .pulse-subtle, .float-effect, .wiggle-effect { animation: none !important; }
        }
      `}</style>

      <div className="flex min-h-screen">
        <Sidebar isCollapsed={!showSidebar} toggleSidebar={() => setShowSidebar(!showSidebar)} />
        <main
          id="main"
          className={cn(
            "flex-1 transition-all duration-300 ease-in-out fade-in",
            "p-4 sm:p-5 md:p-6", // Mobile-first responsive padding
            !isMobile && showSidebar ? "ml-[280px]" : "ml-0"
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
