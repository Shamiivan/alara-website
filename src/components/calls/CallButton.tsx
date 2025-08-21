"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useAction } from "convex/react";
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

const TOKENS = {
  text: "#0F172A",
  subtext: "#475569",
  border: "#E2E8F0",
  focus: "#A5B4FC",
  primary: "#4F46E5",
  success: "#10B981",
  error: "#EF4444",
  accent: "#E0E7FF",
};

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

  // Convex action
  const initiateCall = useAction(api.calls_node.initiateCall);

  const handleCall = async () => {
    try {
      setIsLoading(true);
      setStatus("calling");
      const result = await initiateCall({ toNumber: phoneNumber, userName });
      if (result && result.success) {
        setStatus("success");
        setConfettiKey((k) => k + 1); // restart confetti
      } else {
        setStatus("error");
      }
    } catch (err) {
      console.error("Call failed:", err);
      setStatus("error");
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
      @media (prefers-reduced-motion: reduce) {
        .pulse-ring, .sparkle, .confetti-piece { animation: none !important; }
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
      {/* Decorative pulse while dialing */}
      {status === "calling" && (
        <span
          className="pulse-ring"
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 10,
            border: `2px solid ${TOKENS.accent}`,
            animation: "pulseRing 900ms ease-out infinite",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
      )}

      {/* BUTTON — transparent background (even on hover), solid border */}
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
          ...style,
        }}
        onMouseEnter={(e) => {
          // keep transparent on hover
          (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent";
        }}
        onFocus={(e) => {
          (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 0 0 2px ${TOKENS.focus}`;
        }}
        onBlur={(e) => {
          (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
        }}
      >
        {/* Icon (color reflects state) */}
        <span style={{ display: "inline-flex", alignItems: "center", marginRight: 8 }}>
          <PhoneIcon
            width={16}
            height={16}
            style={{
              color:
                status === "error"
                  ? TOKENS.error
                  : status === "success"
                    ? TOKENS.success
                    : "currentColor",
            }}
          />
        </span>

        <span style={{ fontWeight: 700 }}>{labelText}</span>

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

      {/* Hint line */}
      {showHint && (
        <div style={{ marginTop: 4, fontSize: 12, color: TOKENS.subtext, lineHeight: 1.2 }}>
          Usually under 2 minutes
        </div>
      )}

      {/* Optional idle sparkles (playful=extra) */}
      {playful === "extra" && status === "idle" && <Sparkles />}

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
