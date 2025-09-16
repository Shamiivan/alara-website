"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PrimaryButton } from "@/components/ui/CustomButton";
import { useRouter } from "next/navigation";

/**
 * Alara Navbar — Kevin Hale philosophy + Alara design guidelines
 * - Friendly, trustworthy, minimal. (No surprise UI; clear next step.)
 * - Support is visible. (Support-driven design.)
 * - Tiny delight: soft shadow, micro‑animation on CTA, focus rings.
 * - Hardcoded color palette (hex) from design-guidelines.md.
 */

const COLORS = {
  indigo: "#4F46E5", // Deep Indigo — primary
  lavender: "#E0E7FF", // Soft Lavender — background wash
  purple: "#A78BFA", // Warm Purple — secondary
  teal: "#14B8A6", // Voice accent
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
  ink: "#0F172A", // headlines/foreground
  slate: "#334155", // secondary foreground
  border: "#E5E7EB",
  white: "#FFFFFF",
};

const NAV_LINKS = [
  { href: "/auth/login", label: "Login" },
  { href: "/faq", label: "FAQ" },
  { href: "/pricing", label: "Pricing" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = React.useState(false);

  // Close on route change
  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (

    <div>
      {/* Support strip (visible on md+) — reinforces reliability */}
      <div
        className="hidden md:flex items-center justify-center text-sm"
        style={{
          backgroundColor: COLORS.lavender,
          color: COLORS.slate,
        }}
      >
        <div className="container mx-auto px-4 py-1.5 flex items-center gap-2">
          <span className="font-medium">We’re here.</span>
          <a
            className="underline decoration-1 underline-offset-2 hover:opacity-80 focus:outline-none focus-visible:ring-2 rounded-sm"
            style={{ color: COLORS.indigo, boxShadow: `0 0 0 0 ${COLORS.indigo}` }}
            href="mailto:support@tryalara.stream"
          >
            support@tryalara.stream
          </a>
        </div>
      </div>
      <header
        className="sticky top-0 z-40"
        style={{
          backgroundColor: COLORS.white,
          borderBottom: `1px solid ${COLORS.border}`,
          backdropFilter: "saturate(180%) blur(6px)",
        }}
        role="banner"
      >

        {/* Support strip (visible on md+) — reinforces reliability */}

        {/* Main bar */}
        <div className="container mx-auto px-4">
          <nav className="h-16 flex items-center justify-between" aria-label="Primary">
            {/* Brand */}
            <Brand />

            {/* Desktop nav */}
            <ul className="hidden md:flex items-center gap-6" aria-label="Sections">
              {NAV_LINKS.map((item) => (
                <li key={item.href}>
                  <NavLink href={item.href} active={pathname === item.href}>
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>

            {/* Right cluster: Help + CTA (desktop) */}
            <div className="hidden md:flex items-center gap-3">
              <HelpLink />
              <PrimaryButton onClick={() => router.push("/app/dashboard")}>
                Start 30‑day pilot
              </PrimaryButton>
            </div>

            {/* Mobile menu button */}
            <button
              type="button"
              className="md:hidden inline-flex items-center justify-center rounded-lg border px-3 py-2 text-sm"
              onClick={() => setOpen((v) => !v)}
              aria-controls="mobile-nav"
              aria-expanded={open}
              style={{
                borderColor: COLORS.border,
                color: COLORS.slate,
                backgroundColor: COLORS.white,
              }}
            >
              <span className="sr-only">Toggle menu</span>
              <span className={`transition-transform ${open ? "rotate-90" : "rotate-0"}`}>☰</span>
            </button>
          </nav>
        </div>

        {/* Mobile drawer */}
        <div
          id="mobile-nav"
          className={`md:hidden overflow-hidden transition-[max-height] duration-300 ease-out`}
          style={{ maxHeight: open ? 320 : 0, borderTop: `1px solid ${COLORS.border}` }}
        >
          <div className="px-4 py-3">
            <ul className="flex flex-col gap-2">
              {NAV_LINKS.map((item) => (
                <li key={item.href}>
                  <NavLink href={item.href} active={pathname === item.href} mobile>
                    {item.label}
                  </NavLink>
                </li>
              ))}
              <li className="pt-1">
                <HelpLink mobile />
              </li>
              <li className="pt-1">
                <PrimaryButton
                  onClick={() => router.push("/dashboard")}
                  className="w-full text-left"
                >
                  Start 30‑day pilot
                </PrimaryButton>
              </li>
            </ul>
          </div>
        </div>
      </header>
    </div>
  );
}

function Brand() {
  return (
    <Link href="/" className="flex items-center gap-2 focus:outline-none focus-visible:ring-2 rounded-lg">
      {/* Minimal logo mark */}
      <span
        aria-hidden
        className="inline-block size-6 rounded-xl"
        style={{
          background: `linear-gradient(135deg, ${COLORS.indigo}, ${COLORS.purple})`,
          boxShadow: `0 2px 8px rgba(79,70,229,0.35)`,
        }}
      />
      <span className="text-base font-semibold tracking-tight" style={{ color: COLORS.ink }}>
        Alara
      </span>
      <span className="sr-only">Go to alara.stream</span>
    </Link>
  );
}

function NavLink({
  href,
  children,
  active,
  mobile = false,
}: {
  href: string;
  children: React.ReactNode;
  active?: boolean;
  mobile?: boolean;
}) {
  const base = "inline-flex items-center rounded-md focus:outline-none focus-visible:ring-2";
  const sizing = mobile ? "px-2 py-2 text-base" : "px-2 py-1 text-sm";
  const color = active
    ? {
      color: COLORS.indigo,
      backgroundColor: hexWithAlpha(COLORS.lavender, 0.6),
      border: `1px solid ${hexWithAlpha(COLORS.indigo, 0.2)}`,
    }
    : {
      color: COLORS.slate,
      backgroundColor: "transparent",
      border: `1px solid transparent`,
    };

  return (
    <Link
      href={href}
      className={`${base} ${sizing}`}
      style={color}
    >
      <span className="transition-opacity hover:opacity-80">{children}</span>
    </Link>
  );
}

function HelpLink({ mobile = false }: { mobile?: boolean }) {
  const sizing = mobile ? "px-2 py-2 text-base" : "px-2 py-1 text-sm";
  return (
    <a
      href="mailto:support@tryalara.stream"
      className={`inline-flex items-center rounded-md underline decoration-1 underline-offset-4 ${sizing} focus:outline-none focus-visible:ring-2`}
      style={{ color: COLORS.slate }}
    >
      Help
    </a>
  );
}


// ---- utils ----
function hexWithAlpha(hex: string, alpha: number) {
  // Accepts #RRGGBB, returns rgba(r,g,b,a)
  const n = hex.replace('#', '');
  const r = parseInt(n.substring(0, 2), 16);
  const g = parseInt(n.substring(2, 4), 16);
  const b = parseInt(n.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
