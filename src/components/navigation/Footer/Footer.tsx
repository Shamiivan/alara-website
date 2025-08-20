"use client"
import React from "react";
import Link from "next/link";
import { Mail, HeartHandshake, ArrowUpRight } from "lucide-react";

/**
 * Color palette (explicit hex, no CSS vars):
 * Background: #FFFFFF
 * Surface:    #F9FAFB
 * Border:     #E5E7EB
 * Text:       #111827
 * Muted text: #6B7280
 * Primary:    #4F46E5   (hover: #4338CA)
 * Focus ring: #6366F1
 */

export function Footer() {
  const year = new Date().getFullYear();

  const linkBase =
    "text-sm text-[#6B7280] hover:text-[#111827] transition-colors underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366F1] focus-visible:ring-offset-2 focus-visible:ring-offset-white rounded";

  return (
    <footer className="border-t" style={{ backgroundColor: "#FFFFFF", borderColor: "#E5E7EB" }}>
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
        {/* Top */}
        <div className="grid grid-cols-1 gap-10 py-10 md:grid-cols-4">
          {/* Brand */}
          <div className="space-y-3">
            <Link href="/" className="inline-flex items-center gap-2">
              {/* Minimal inline logo */}
              <span
                aria-hidden
                className="grid size-8 place-items-center rounded-xl"
                style={{ backgroundColor: "rgba(79,70,229,0.12)" }} // primary @ 12%
              >
                <span className="h-4 w-4 rounded-sm" style={{ backgroundColor: "#4F46E5" }} />
              </span>
              <span className="text-lg font-semibold tracking-tight" style={{ color: "#111827" }}>
                Alara
              </span>
            </Link>
            <p className="text-sm" style={{ color: "#6B7280" }}>
              Conversations, not lists. One clear step at a time.
            </p>

            {/* Support cue */}
            <div
              className="inline-flex items-center gap-2 rounded-lg border px-3 py-2"
              style={{ borderColor: "#E5E7EB", backgroundColor: "#F9FAFB" }}
            >
              <HeartHandshake className="size-4" aria-hidden color="#4F46E5" />
              <span className="text-xs" style={{ color: "#6B7280" }}>
                We read every message.{" "}
                <a
                  href="mailto:support@tryalara.stream"
                  className="underline underline-offset-4 hover:no-underline focus-visible:outline-none focus-visible:ring-2 rounded"
                  style={{ color: "#4F46E5" }}
                >
                  support@tryalara.stream
                </a>
              </span>
            </div>
          </div>

          {/* Product */}
          <nav aria-label="Product" className="space-y-3 md:place-self-center">
            <h3 className="text-sm font-medium" style={{ color: "#1F2937" }}>
              Product
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/how-it-works" className={linkBase}>
                  How it works
                </Link>
              </li>
              <li>
                <Link href="/faq" className={linkBase}>
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/pilot" className={linkBase}>
                  Join the pilot
                </Link>
              </li>
            </ul>
          </nav>

          {/* Help & Policies */}
          <nav aria-label="Help" className="space-y-3">
            <h3 className="text-sm font-medium" style={{ color: "#1F2937" }}>
              Help
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="mailto:support@tryalara.stream"
                  className={linkBase}
                  aria-label="Email support at support@tryalara.stream"
                >
                  <span className="inline-flex items-center gap-2">
                    <Mail className="size-4" aria-hidden color="#4F46E5" />
                    Contact support
                  </span>
                </a>
              </li>
              <li>
                <Link href="/policy" className={linkBase}>
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/terms" className={linkBase}>
                  Terms
                </Link>
              </li>
            </ul>
          </nav>

          {/* Build in public / Updates */}
          <div className="space-y-3 md:justify-self-end">
            <h3 className="text-sm font-medium" style={{ color: "#1F2937" }}>
              Follow along
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://alara.stream"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkBase}
                  aria-label="alara.stream (opens in a new tab)"
                >
                  <span className="inline-flex items-center gap-1">
                    alara.stream <ArrowUpRight className="size-3.5" aria-hidden />
                  </span>
                </a>
              </li>
              {/* <li><Link href="/changelog" className={linkBase}>Changelog</Link></li> */}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="py-6" style={{ borderTop: "1px solid #E5E7EB" }}>
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-xs" style={{ color: "#6B7280" }}>
              © {year} Alara. Built with care.
            </p>
            <div className="flex items-center gap-4">
              <Link href="/accessibility" className={linkBase}>
                Accessibility
              </Link>
              <Link href="/policy" className={linkBase}>
                Privacy
              </Link>
              <Link href="/terms" className={linkBase}>
                Terms
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Hover/focus color overrides without tokens */}
      <style jsx>{`
        a:hover { color: #111827; }
        a:focus-visible { outline: none; }
        .hover\\:text-foreground:hover { color: #111827; }
      `}</style>
    </footer>
  );
}
