"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { CallButton } from "@/components/calls/CallButton";
import NextCallCard from "@/components/dashboard/NextCallCard";

export default function Dashboard() {
  const user = useQuery(api.user.getCurrentUser);
  const userStatus = useQuery(api.user.checkUserStatus);
  const searchParams = useSearchParams();
  const router = useRouter();

  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);

  // Inline design tokens (hardcoded to avoid broken styling system)
  const TOKENS = {
    bg: "#F8FAFC", // base page bg (near Tailwind slate-50)
    cardBg: "#FFFFFF",
    text: "#0F172A", // slate-900
    subtext: "#475569", // slate-600
    border: "#E2E8F0", // slate-200
    primary: "#4F46E5", // Deep Indigo
    primaryHover: "#4338CA",
    accent: "#E0E7FF", // Soft Lavender
    success: "#10B981", // Success Green
    successBg: "rgba(16, 185, 129, 0.12)",
    warn: "#F59E0B",
    radius: 12,
    shadow:
      "0 1px 2px rgba(16,24,40,0.04), 0 8px 24px rgba(16,24,40,0.06)", // soft, modern
  };

  const isLoading = useMemo(
    () => user === undefined || userStatus === undefined,
    [user, userStatus]
  );

  // Detect payment success once
  useEffect(() => {
    const paymentStatus = searchParams.get("payment");
    const paymentId = searchParams.get("paymentId");

    if (paymentStatus === "success") {
      console.log("Dashboard - Payment success detected", {
        paymentId,
        userStatus: userStatus || "loading",
        user: user
          ? { id: user._id, isOnboarded: user.isOnboarded, hasPaid: user.hasPaid }
          : "loading",
      });
      setShowPaymentSuccess(true);
      const timer = setTimeout(() => setShowPaymentSuccess(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [searchParams, user, userStatus]);

  // Tiny helpers for pills
  const Pill = ({ label, tone = "default" }: { label: string; tone?: "default" | "good" | "warn" }) => {
    const tones = {
      default: { bg: "#F1F5F9", fg: "#0F172A" },
      good: { bg: TOKENS.successBg, fg: TOKENS.success },
      warn: { bg: "rgba(245, 158, 11, 0.12)", fg: TOKENS.warn },
    }[tone];
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          padding: "4px 10px",
          borderRadius: 999,
          backgroundColor: tones.bg,
          color: tones.fg,
          fontSize: 12,
          fontWeight: 600,
          lineHeight: 1,
        }}
      >
        {label}
      </span>
    );
  };

  // Layout styles
  const pageStyle: React.CSSProperties = {
    minHeight: "100vh",
    backgroundColor: TOKENS.bg,
  };

  const containerStyle: React.CSSProperties = {
    maxWidth: 1120,
    margin: "0 auto",
    padding: "24px 16px 56px",
  };

  const headerStyle: React.CSSProperties = {
    backgroundColor: TOKENS.cardBg,
    borderBottom: `1px solid ${TOKENS.border}`,
  };

  const headerInnerStyle: React.CSSProperties = {
    maxWidth: 1120,
    margin: "0 auto",
    padding: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  };

  const titleStyle: React.CSSProperties = {
    fontSize: 20,
    fontWeight: 700,
    color: TOKENS.text,
    letterSpacing: "-0.02em",
  };

  const subStyle: React.CSSProperties = {
    fontSize: 14,
    color: TOKENS.subtext,
  };

  const gridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: 16,
  };

  const twoCol: React.CSSProperties = {
    display: "grid",
    gap: 16,
    gridTemplateColumns: "1fr",
  };

  // responsive tweak
  // (We'll keep it inline and minimal—no external CSS)
  if (typeof window !== "undefined" && window.innerWidth >= 768) {
    (gridStyle as React.CSSProperties).gridTemplateColumns = "1.2fr 0.8fr";
    (twoCol as React.CSSProperties).gridTemplateColumns = "1fr 1fr";
  }

  const cardStyle: React.CSSProperties = {
    backgroundColor: TOKENS.cardBg,
    border: `1px solid ${TOKENS.border}`,
    borderRadius: TOKENS.radius,
    padding: 24,
    boxShadow: TOKENS.shadow,
  };

  const h2Style: React.CSSProperties = {
    fontSize: 16,
    fontWeight: 600,
    color: TOKENS.text,
    marginBottom: 12,
    letterSpacing: "-0.01em",
  };


  const secondaryBtn: React.CSSProperties = {
    width: "100%",
    backgroundColor: "#FFFFFF",
    color: TOKENS.text,
    padding: "10px 14px",
    borderRadius: 10,
    border: `1px solid ${TOKENS.border}`,
    fontWeight: 600,
    transition: "background-color 150ms ease, transform 150ms ease",
    cursor: "pointer",
  };

  const skeleton = (w = "100%", h = 14) => (
    <div
      style={{
        width: w,
        height: h,
        borderRadius: 8,
        background:
          "linear-gradient(90deg, #E5E7EB 25%, #F3F4F6 37%, #E5E7EB 63%)",
        backgroundSize: "400% 100%",
        animation: "sweep 1200ms ease-in-out infinite",
      }}
    />
  );

  return (
    <div style={pageStyle}>
      {/* Global styles for subtle animations */}
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
        .tap:hover { transform: translateY(-1px); }
        .tap:active { transform: translateY(0); }
      `}</style>

      {/* Payment toast */}
      {showPaymentSuccess && (
        <div
          className="fade-in"
          style={{
            position: "fixed",
            top: 16,
            right: 16,
            zIndex: 50,
            backgroundColor: TOKENS.successBg,
            borderLeft: `4px solid ${TOKENS.success}`,
            padding: 14,
            borderRadius: TOKENS.radius,
            boxShadow: TOKENS.shadow,
            maxWidth: 420,
          }}
        >
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill={TOKENS.success} aria-hidden>
              <path d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.53-9.97a.75.75 0 0 0-1.06-1.06L9 10.44 7.53 8.97a.75.75 0 1 0-1.06 1.06l2 2a.75.75 0 0 0 1.06 0l4-4Z" />
            </svg>
            <div style={{ color: TOKENS.text }}>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>
                Payment successful! Your account is now active.
              </div>
              <div style={{ fontSize: 12, color: TOKENS.subtext }}>
                Thanks for supporting the pilot. You’re set.
              </div>
            </div>
            <button
              onClick={() => setShowPaymentSuccess(false)}
              aria-label="Close"
              style={{
                marginLeft: "auto",
                border: 0,
                background: "transparent",
                color: TOKENS.success,
                padding: 4,
                cursor: "pointer",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 0 1 1.414 0L10 8.586l4.293-4.293a1 1 0 1 1 1.414 1.414L11.414 10l4.293 4.293a1 1 0 0 1-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 0 1-1.414-1.414L8.586 10 4.293 5.707a1 1 0 0 1 0-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header style={headerStyle}>
        <div style={headerInnerStyle}>
          <div>
            <div style={titleStyle}>
              {`Welcome back, ${user?.name || "Friend"}!`}
            </div>
            <div style={subStyle}>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <LogoutButton variant="subtle" />
          </div>
        </div>
      </header>

      {/* Main */}
      <main style={containerStyle}>
        <div style={gridStyle}>
          {/* Left: Activity / Status */}
          <section className="fade-in" style={cardStyle}>
            <h2 style={h2Style}>Your Activity</h2>

            {isLoading ? (
              <div style={{ display: "grid", gap: 10 }}>
                {skeleton("60%", 18)}
                {skeleton("85%")}
                {skeleton("40%")}
              </div>
            ) : (
              <>
                <p style={{ color: TOKENS.subtext, fontSize: 14 }}>
                  You’re all set up and ready to use Alara.
                </p>

                <div
                  style={{
                    marginTop: 16,
                    padding: 14,
                    borderRadius: 10,
                    backgroundColor: TOKENS.accent,
                    color: TOKENS.text,
                    border: `1px solid ${TOKENS.border}`,
                  }}
                >
                  <div style={{ fontSize: 12, color: TOKENS.subtext, marginBottom: 4 }}>
                    Preferred call time
                  </div>
                  <div style={{ fontWeight: 600 }}>
                    {user?.callTime || "Not set"}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
                  <Pill label={user?.isOnboarded ? "You are all set!" : "Onboarding pending"} tone={user?.isOnboarded ? "good" : "warn"} />
                  {userStatus && typeof userStatus === "string" && <Pill label={userStatus} />}
                </div>
              </>
            )}
          </section>

          <section className="fade-in" style={cardStyle}>
            <NextCallCard
              initialUtc={user?.callTimeUtc ?? null}
              initialTimeZone={user?.timezone ?? null}
              onSave={async ({ }) => {
                // Handle save logic here
              }}
            />
          </section>

          {/* Right: Actions */}
          <aside className="fade-in" style={cardStyle}>
            <h2 style={h2Style}>Quick Actions</h2>


            <div style={{ height: 10 }} />

            {user?.phone ? (
              <CallButton
                phoneNumber={user.phone}
                userName={user?.name || "Friend"}
                agentName="Alara"
                className="tap"
                style={secondaryBtn}
                playful="extra"
                showHint={true}
              >
                Call Me Now
              </CallButton>
            ) : (
              <button
                className="tap"
                style={{
                  ...secondaryBtn,
                  opacity: 0.6,
                  cursor: "not-allowed"
                }}
                disabled={true}
                title="Please complete onboarding to add your phone number"
              >
                Add your phone number to call
              </button>
            )}

            <div style={{ height: 10 }} />

            <button
              className="tap"
              style={secondaryBtn}
              onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = "#F8FAFC")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = "#FFFFFF")}
              onClick={() => router.push("/settings")}
            >
              Update Preferences
            </button>

            <div
              style={{
                marginTop: 16,
                padding: 14,
                borderRadius: 10,
                backgroundColor: "#FFFFFF",
                border: `1px dashed ${TOKENS.border}`,
              }}
            >
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4, color: TOKENS.text }}>
                How it works
              </div>
              <p style={{ color: TOKENS.subtext, fontSize: 13, margin: 0 }}>
                Short planning call → one clear step saved → gentle check-in later. Adjust without guilt; track momentum, not just task counts.
              </p>
            </div>
          </aside>
        </div>

        {/* Optional: Secondary grid for future modules */}
        {/* <section style={{ ...twoCol, marginTop: 16 }}>
          <div style={cardStyle}>...</div>
          <div style={cardStyle}>...</div>
        </section> */}
      </main>
    </div>
  );
}