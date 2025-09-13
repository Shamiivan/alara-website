"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { PhoneIcon } from "lucide-react";

interface CallButtonProps {
  phoneNumber: string;
  userName?: string;
  agentName?: string; // default "Joe"
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  showHint?: boolean; // "Usually under 2 minutes"
  playful?: "subtle" | "extra"; // sparkles on idle
}

// Import global tokens instead of local definition
import { TOKENS } from "@/components/tokens";

export function CallButton({
  phoneNumber,
  userName = "User",
  agentName = "Joe",
  className,
  style,
  children,
  showHint = true,
  playful = "subtle",
}: CallButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "calling" | "success" | "error">("idle");
  const [confettiKey, setConfettiKey] = useState(0);
  const [buttonScale, setButtonScale] = useState(1);
  const [hoverState, setHoverState] = useState(false);
  const [canVibrate, setCanVibrate] = useState(false);

  // Convex action
  const initiateCall = useAction(api.core.calls.actions.initiateCalendarCall);
  const currentUser = useQuery(api.user.getCurrentUser);

  // Check for vibration support on mount
  useEffect(() => {
    if ('vibrate' in navigator) {
      setCanVibrate(true);
    }
  }, []);

  const handleCall = async () => {
    try {
      // Visual and haptic feedback on click
      setButtonScale(0.95);
      setTimeout(() => setButtonScale(1), 150);

      // Haptic feedback if available
      if (canVibrate) {
        navigator.vibrate(15);
      }

      setIsLoading(true);
      setStatus("calling");

      if (!currentUser) throw new Error("Not authenticated");
      const result = await initiateCall({ userId: currentUser!._id });

      if (result && result.success) {
        setStatus("success");
        setConfettiKey((k) => k + 1); // restart confetti

        // Success vibration pattern
        if (canVibrate) {
          navigator.vibrate([20, 30, 40]);
        }
      } else {
        setStatus("error");
        // Error vibration
        if (canVibrate) {
          navigator.vibrate([50, 100, 50]);
        }
      }
    } catch (err) {
      console.error("Call failed:", err);
      setStatus("error");

      // Error vibration
      if (canVibrate) {
        navigator.vibrate([50, 100, 50]);
      }
    } finally {
      setIsLoading(false);
      setTimeout(() => setStatus("idle"), 2400);
    }
  };

  const labelText = useMemo(() => {
    if (children) return children;
    switch (status) {
      case "calling":
        return "Ringing…";
      case "success":
        return `${agentName} is calling`;
      case "error":
        return "Couldn't connect";
      default:
        return "Call me now";
    }
  }, [children, status, agentName]);

  // Inject keyframes once (cleanup returns void)
  useEffect(() => {
    const styleEl = document.createElement("style");
    styleEl.textContent = `
      @keyframes pulseRing {
        0% { transform: scale(1); opacity: .6; }
        70% { transform: scale(1.22); opacity: 0; }
        100% { opacity: 0; }
      }
      @keyframes floatSparkle {
        0% { transform: translateY(0) scale(1); opacity: 0; }
        15% { opacity: .9; }
        100% { transform: translateY(-10px) scale(1.1); opacity: 0; }
      }
      @keyframes confettiPop {
        0% { transform: translate(0,0) rotate(0deg); opacity: 0; }
        10% { opacity: 1; }
        100% { transform: translate(var(--dx), var(--dy)) rotate(var(--rot)); opacity: 0; }
      }
      @keyframes gentlePulse {
        0%, 100% { opacity: 0.9; transform: scale(1); }
        50% { opacity: 1; transform: scale(1.03); }
      }
      @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }
      @keyframes bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-3px); }
      }
      @media (prefers-reduced-motion: reduce) {
        .pulse-ring, .sparkle, .confetti-piece, .shimmer, .bounce-effect { animation: none !important; }
      }
    `;
    document.head.appendChild(styleEl);
    return () => {
      if (styleEl.parentNode) {
        styleEl.parentNode.removeChild(styleEl); // return void
      }
    };
  }, []);

  const isDisabled = isLoading || status === "calling";

  return (
    <div
      className={className}
      style={{
        width: "100%",
        position: "relative",
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "stretch",
      }}
    >
      {/* Background glow effect for success */}
      {status === "success" && (
        <span
          aria-hidden
          style={{
            position: "absolute",
            inset: -4,
            borderRadius: 14,
            background: `radial-gradient(circle, ${TOKENS.successBg || "rgba(16,185,129,0.2)"} 0%, transparent 70%)`,
            opacity: 0.8,
            animation: "gentlePulse 1.5s ease-in-out infinite",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
      )}

      {/* Decorative pulse while dialing */}
      {status === "calling" && (
        <span
          className="pulse-ring"
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 12,
            border: `2px solid ${TOKENS.accent}`,
            animation: "pulseRing 900ms ease-out infinite",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
      )}

      {/* Error shake effect */}
      {status === "error" && (
        <span
          aria-hidden
          style={{
            position: "absolute",
            inset: -2,
            borderRadius: 12,
            border: `1px solid ${TOKENS.errorBg || "rgba(239,68,68,0.2)"}`,
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
      )}

      {/* BUTTON — with improved interactions */}
      <button
        onClick={handleCall}
        disabled={isDisabled}
        aria-live="polite"
        aria-busy={isLoading || status === "calling"}
        aria-label={
          status === "idle"
            ? `Call ${agentName} now`
            : status === "calling"
              ? `Ringing your phone`
              : status === "success"
                ? `${agentName} is calling`
                : `Call failed`
        }
        style={{
          zIndex: 1,
          opacity: isDisabled ? 0.75 : 1,
          transform: `scale(${buttonScale})`,
          transition: "all 0.2s ease-out, transform 0.15s ease-out, opacity 0.3s ease",
          padding: "10px 16px", // Larger padding for better touch targets
          borderRadius: 12,     // Slightly more rounded for modern feel
          border: `2px solid ${status === "error" ? TOKENS.error : status === "success" ? TOKENS.success : TOKENS.primary}`,
          color: status === "error" ? TOKENS.error : status === "success" ? TOKENS.success : TOKENS.primary,
          background: hoverState ? `${TOKENS.accent}40` : "transparent", // Subtle background on hover
          position: "relative",
          overflow: "hidden", // For shimmer effect
          cursor: isDisabled ? "default" : "pointer",
          ...style,
        }}
        onMouseEnter={(e) => {
          setHoverState(true);
          // Add subtle hover effect
          if (!isDisabled) {
            e.currentTarget.style.transform = `scale(${buttonScale * 1.02})`;
          }
        }}
        onMouseLeave={(e) => {
          setHoverState(false);
          // Reset hover effect
          e.currentTarget.style.transform = `scale(${buttonScale})`;
        }}
        onMouseDown={(e) => {
          // Add press effect
          if (!isDisabled) {
            e.currentTarget.style.transform = `scale(${buttonScale * 0.97})`;
          }
        }}
        onMouseUp={(e) => {
          // Reset press effect
          if (!isDisabled) {
            e.currentTarget.style.transform = hoverState ? `scale(${buttonScale * 1.02})` : `scale(${buttonScale})`;
          }
        }}
        onFocus={(e) => {
          e.currentTarget.style.boxShadow = `0 0 0 3px ${TOKENS.focus}`;
        }}
        onBlur={(e) => {
          e.currentTarget.style.boxShadow = "none";
        }}
        onTouchStart={() => {
          // Haptic feedback on touch if available
          if (canVibrate && !isDisabled) {
            navigator.vibrate(5);
          }
        }}
      >
        {/* Shimmer effect on idle hover */}
        {status === "idle" && hoverState && (
          <span
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              background: `linear-gradient(90deg, transparent, ${TOKENS.accent}30, transparent)`,
              backgroundSize: "200% 100%",
              animation: "shimmer 2s infinite linear",
              pointerEvents: "none",
              zIndex: 0,
            }}
          />
        )}
        {/* Icon (color reflects state) - enhanced with animations */}
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            marginRight: 10,
            position: "relative",
            zIndex: 1
          }}
          className={status === "success" ? "bounce-effect" : ""}
        >
          <PhoneIcon
            width={18}
            height={18}
            style={{
              color:
                status === "error"
                  ? TOKENS.error
                  : status === "success"
                    ? TOKENS.success
                    : "currentColor",
              animation: status === "success" ? "bounce 1s ease infinite" : "none",
              transform: status === "calling" ? "rotate(10deg)" : "none",
              transition: "transform 0.3s ease, color 0.3s ease"
            }}
          />
        </span>

        <span style={{
          fontWeight: 700,
          position: "relative",
          zIndex: 1
        }}>{labelText}</span>

        {/* Subtle progress line at bottom while ringing */}
        {status === "calling" && (
          <span
            aria-hidden
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              height: 2,
              background:
                "linear-gradient(90deg, rgba(79,70,229,0) 0%, rgba(79,70,229,.8) 50%, rgba(79,70,229,0) 100%)",
              maskImage:
                "linear-gradient(90deg, transparent, black 20%, black 80%, transparent)",
              animation: "floatSparkle 1200ms ease-in-out infinite",
            }}
          />
        )}
      </button>

      {/* Hint line with enhanced styling */}
      {showHint && (
        <div
          style={{
            marginTop: 6,
            fontSize: 12,
            color: TOKENS.subtext,
            lineHeight: 1.2,
            opacity: status === "idle" ? 1 : 0.7,
            transition: "opacity 0.3s ease",
            textAlign: "center"
          }}
        >
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            <span
              className="inline-block w-2 h-2 rounded-full"
              style={{
                background: status === "success" ? TOKENS.success : TOKENS.primary,
                opacity: 0.7
              }}
            />
            Usually under 2 minutes
          </span>
        </div>
      )}

      {/* Enhanced sparkles - show on both idle and extra modes */}
      {(playful === "extra" || (playful === "subtle" && hoverState)) && status === "idle" && <Sparkles />}

      {/* Confetti on success */}
      {status === "success" && <ConfettiBurst key={confettiKey} />}
    </div>
  );
}

/* ---------- Decorative helpers ---------- */

function Sparkles() {
  // Allow any combo of top/bottom/left/right with a delay
  type SparkleDot = { delay: string } & Partial<
    Record<"top" | "bottom" | "left" | "right", number>
  >;

  const dots: SparkleDot[] = [
    { top: -6, left: 10, delay: "0ms" },
    { top: -10, right: 24, delay: "150ms" },
    { bottom: -8, left: 28, delay: "300ms" },
  ];

  return (
    <>
      {dots.map((d, i) => (
        <span
          key={i}
          aria-hidden
          className="sparkle"
          style={{
            position: "absolute",
            width: 8,
            height: 8,
            borderRadius: "999px",
            background: "#A78BFA", // warm purple accent
            ...(d.top !== undefined ? { top: d.top } : {}),
            ...(d.bottom !== undefined ? { bottom: d.bottom } : {}),
            ...(d.left !== undefined ? { left: d.left } : {}),
            ...(d.right !== undefined ? { right: d.right } : {}),
            animation: `floatSparkle 1600ms ease-in-out ${d.delay} infinite`,
            opacity: 0,
            pointerEvents: "none",
          }}
        />
      ))}
    </>
  );
}

function ConfettiBurst() {
  // Lightweight confetti: 12 pieces flying outward
  const pieces = new Array(12).fill(0).map((_, i) => {
    const angle = (Math.PI * 2 * i) / 12;
    const dx = Math.cos(angle) * (32 + (i % 3) * 10);
    const dy = Math.sin(angle) * (24 + ((i + 1) % 3) * 12);
    const rot = (Math.random() * 120 - 60).toFixed(0) + "deg";
    const color = ["#bebec8ff", "#A78BFA", "#10B981", "#F59E0B"][i % 4];
    const size = 5 + (i % 3) * 3;
    const delay = (i % 4) * 20 + "ms";
    return { dx, dy, rot, color, size, delay };
  });

  return (
    <div
      className="confetti"
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 0,
      }}
    >
      {pieces.map((p, i) => {
        const confettiStyle: React.CSSProperties & {
          ["--dx"]?: string;
          ["--dy"]?: string;
          ["--rot"]?: string;
        } = {
          position: "absolute",
          top: "50%",
          left: "50%",
          width: p.size,
          height: p.size + 3,
          background: p.color,
          borderRadius: 1,
          transform: "translate(-50%, -50%)",
          animation: "confettiPop 700ms ease-out forwards",
          animationDelay: p.delay,
          ["--dx"]: `${p.dx}px`,
          ["--dy"]: `${-Math.abs(p.dy)}px`,
          ["--rot"]: p.rot,
        };
        return <span key={i} aria-hidden className="confetti-piece" style={confettiStyle} />;
      })}
    </div>
  );
}
