"use client";

import * as React from "react";

/**
 * Alara Buttons — self-contained, no external CSS.
 * Charming micro-interactions inspired by Kevin Hale’s
 * “tiny delights” (relationship > interface).
 */

type Size = "sm" | "md" | "lg";
type Variant = "primary" | "secondary" | "tertiary" | "link";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  hint?: string;       // renders nothing if empty/undefined
  size?: Size;
  variant?: Variant;
  fullWidth?: boolean;
  pulse?: boolean;     // optional gentle bounce for special CTAs
}

/* ---------- Design Tokens (module-scoped) ---------- */
const TOKENS = {
  radius: 12,
  shadow: "0 1px 2px rgba(16,24,40,0.04), 0 8px 24px rgba(16,24,40,0.06)",
  focus: "0 0 0 3px rgba(79,70,229,0.25)",

  primary: "#4F46E5",
  primaryHover: "#4338CA",
  primaryFg: "#FFFFFF",

  text: "#0F172A",
  subtext: "#475569",

  outline: "#CBD5E1", // slate-300
  outlineHover: "#94A3B8", // slate-400

  ghostHoverBg: "rgba(79,70,229,0.08)",

  link: "#4F46E5",
};

/* ---------- One-time keyframe injector ---------- */
let injected = false;
function StyleInjector() {
  React.useEffect(() => {
    if (injected) return;
    injected = true;
    const css = `
    @keyframes subtle-bounce {
      0%, 100% { transform: translateY(0) }
      50% { transform: translateY(-1px) }
    }
    @keyframes sparkle-sheen {
      0% { transform: translateX(-120%) }
      100% { transform: translateX(120%) }
    }
    @keyframes corner-in {
      0% { transform: scale(0.6); opacity: 0 }
      100% { transform: scale(1); opacity: 1 }
    }
    @keyframes underline-slide {
      0% { transform: scaleX(0); opacity: 0.6 }
      100% { transform: scaleX(1); opacity: 1 }
    }
    @keyframes arrow-nudge {
      0% { transform: translateX(0) }
      50% { transform: translateX(2px) }
      100% { transform: translateX(0) }
    }
    @keyframes calm-ripple {
      0% { opacity: 0.0; transform: scale(0.85) }
      100% { opacity: 0.0; transform: scale(1.25) }
    }
    .btn-pressable { transition: transform 150ms ease }
    .btn-pressable:hover { transform: translateY(-1px) }
    .btn-pressable:active { transform: translateY(0) }
    `;
    const tag = document.createElement("style");
    tag.setAttribute("data-alara-buttons", "true");
    tag.appendChild(document.createTextNode(css));
    document.head.appendChild(tag);
  }, []);
  return null;
}

/* ---------- Sizing ---------- */
function dims(size: Size) {
  switch (size) {
    case "sm": return { padX: 12, padY: 8, font: 14, gap: 8 };
    case "lg": return { padX: 20, padY: 16, font: 16, gap: 10 };
    case "md":
    default: return { padX: 16, padY: 12, font: 15, gap: 10 };
  }
}

/* ---------- Variant styles + charms ---------- */
function baseCommon(disabled?: boolean): React.CSSProperties {
  return {
    borderRadius: TOKENS.radius,
    fontWeight: 600,
    lineHeight: 1.15,
    boxShadow: TOKENS.shadow,
    transition:
      "box-shadow 150ms ease, background-color 150ms ease, border-color 150ms ease, color 150ms ease",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.6 : 1,
    border: "1px solid transparent",
    outline: "none",
    position: "relative",
    overflow: "hidden",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  };
}

function variantStyle(variant: Variant, disabled?: boolean): React.CSSProperties {
  const c = baseCommon(disabled);

  if (variant === "primary") {
    return {
      ...c,
      backgroundColor: disabled ? "#6D64F1" : TOKENS.primary,
      color: TOKENS.primaryFg,
      borderColor: "transparent",
    };
  }

  if (variant === "secondary") {
    // pure outline, no bg
    return {
      ...c,
      backgroundColor: "transparent",
      color: TOKENS.text,
      borderColor: TOKENS.outline,
      boxShadow: "none",
    };
  }

  if (variant === "tertiary") {
    // ghost (text-forward)
    return {
      ...c,
      backgroundColor: "transparent",
      color: TOKENS.text,
      borderColor: "transparent",
      boxShadow: "none",
    };
  }

  // link (text + underline)
  return {
    ...c,
    backgroundColor: "transparent",
    color: TOKENS.link,
    borderColor: "transparent",
    boxShadow: "none",
  };
}

/* ---------- Interactive hookups (hover states) ---------- */
function useInteractive(
  ref: React.RefObject<HTMLButtonElement>,
  variant: Variant,
  disabled?: boolean
) {
  React.useEffect(() => {
    const el = ref.current;
    if (!el || disabled) return;

    function onFocus() {
      el.style.boxShadow =
        variant === "secondary" || variant === "tertiary" || variant === "link"
          ? `${TOKENS.focus}`
          : `${TOKENS.shadow}, ${TOKENS.focus}`;
    }
    function onBlur() {
      el.style.boxShadow =
        variant === "secondary" || variant === "tertiary" || variant === "link"
          ? "none"
          : TOKENS.shadow;
    }
    function onEnter() {
      if (variant === "primary") el.style.backgroundColor = TOKENS.primaryHover;
      if (variant === "secondary") el.style.borderColor = TOKENS.outlineHover;
    }
    function onLeave() {
      if (variant === "primary") el.style.backgroundColor = TOKENS.primary;
      if (variant === "secondary") el.style.borderColor = TOKENS.outline;
    }

    el.addEventListener("focus", onFocus);
    el.addEventListener("blur", onBlur);
    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("focus", onFocus);
      el.removeEventListener("blur", onBlur);
      el.removeEventListener("mouseenter", onEnter);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [ref, variant, disabled]);
}

/* ---------- Charming adornments per variant ---------- */
function PrimaryCharm() {
  // moving shimmer bar + tiny sparkle svg
  return (
    <>
      {/* sheen */}
      <span
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          overflow: "hidden",
        }}
      >
        <span
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            width: 80,
            transform: "translateX(-120%)",
            background:
              "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 100%)",
            filter: "blur(4px)",
          }}
          className="primary-sheen"
        />
      </span>
      <style>{`
        button:hover .primary-sheen {
          animation: sparkle-sheen 800ms ease;
        }
      `}</style>

      {/* sparkle dot */}
      <svg
        aria-hidden
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        style={{
          position: "absolute",
          right: 10,
          top: 8,
          opacity: 0.85,
        }}
      >
        <path
          d="M12 2l2.2 5.6L20 10l-5.6 2.2L12 18l-2.2-5.8L4 10l5.8-2.4L12 2z"
          fill="rgba(255,255,255,0.45)"
        />
      </svg>
    </>
  );
}

function SecondaryCharm() {
  // four tiny corner notches animate in
  const notch: React.CSSProperties = {
    position: "absolute",
    width: 10,
    height: 10,
    borderColor: TOKENS.outlineHover,
    opacity: 0,
  };
  return (
    <>
      <span
        aria-hidden
        style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      >
        <span
          style={{ ...notch, top: -1, left: -1, borderLeft: `2px solid ${TOKENS.outlineHover}`, borderTop: `2px solid ${TOKENS.outlineHover}` }}
          className="notch tl"
        />
        <span
          style={{ ...notch, top: -1, right: -1, borderRight: `2px solid ${TOKENS.outlineHover}`, borderTop: `2px solid ${TOKENS.outlineHover}` }}
          className="notch tr"
        />
        <span
          style={{ ...notch, bottom: -1, left: -1, borderLeft: `2px solid ${TOKENS.outlineHover}`, borderBottom: `2px solid ${TOKENS.outlineHover}` }}
          className="notch bl"
        />
        <span
          style={{ ...notch, bottom: -1, right: -1, borderRight: `2px solid ${TOKENS.outlineHover}`, borderBottom: `2px solid ${TOKENS.outlineHover}` }}
          className="notch br"
        />
      </span>
      <style>{`
        button:hover .notch { 
          animation: corner-in 220ms ease both; 
        }
        button:hover .notch.tr { animation-delay: 40ms }
        button:hover .notch.bl { animation-delay: 80ms }
        button:hover .notch.br { animation-delay: 120ms }
      `}</style>
    </>
  );
}

function TertiaryCharm() {
  // calm ripple aura on hover
  return (
    <>
      <span
        aria-hidden
        className="ghost-ripple"
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(120px 120px at var(--mx,50%) var(--my,50%), rgba(79,70,229,0.12), transparent 60%)",
          opacity: 0,
          transition: "opacity 180ms ease",
        }}
      />
      <style>{`
        .ghost-host:hover .ghost-ripple { opacity: 1 }
        .ghost-host { position: relative; }
      `}</style>
    </>
  );
}

function LinkCharm() {
  // animated underline + arrow nudge
  return (
    <>
      <span
        aria-hidden
        className="link-underline"
        style={{
          position: "absolute",
          left: 10,
          right: 10,
          bottom: 6,
          height: 2,
          backgroundColor: TOKENS.link,
          transform: "scaleX(0)",
          transformOrigin: "left",
          opacity: 0.9,
        }}
      />
      <span
        aria-hidden
        className="link-arrow"
        style={{ display: "inline-flex", marginLeft: 6 }}
      >
        →
      </span>
      <style>{`
        .link-host:hover .link-underline { 
          animation: underline-slide 220ms ease forwards 
        }
        .link-host:hover .link-arrow { 
          animation: arrow-nudge 360ms ease 
        }
      `}</style>
    </>
  );
}

/* ---------- Base Button ---------- */
export const ReusableButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      hint,
      size = "md",
      variant = "primary",
      fullWidth,
      pulse,
      disabled,
      style,
      children,
      ...rest
    },
    ref
  ) => {
    const d = dims(size);
    const btnRef = React.useRef<HTMLButtonElement | null>(null);
    React.useImperativeHandle(ref, () => btnRef.current as HTMLButtonElement);
    useInteractive(btnRef, variant, disabled);

    const base: React.CSSProperties = {
      ...variantStyle(variant, disabled),
      padding: `${d.padY}px ${d.padX}px`,
      fontSize: d.font,
      width: fullWidth ? "100%" : undefined,
      gap: d.gap,
      transform: "translateY(0)",
      animation: pulse ? "subtle-bounce 1100ms ease-in-out infinite" : undefined,
    };

    // class helpers for charms
    const hostClass =
      variant === "tertiary"
        ? "btn-pressable ghost-host"
        : variant === "link"
          ? "btn-pressable link-host"
          : "btn-pressable";

    return (
      <div style={{ display: fullWidth ? "block" : "inline-block" }}>
        <StyleInjector />
        <button
          ref={btnRef}
          className={hostClass}
          disabled={disabled}
          style={{ ...base, ...style }}
          {...rest}
        >
          {/* Charms by variant */}
          {variant === "primary" && <PrimaryCharm />}
          {variant === "secondary" && <SecondaryCharm />}
          {variant === "tertiary" && <TertiaryCharm />}
          {variant === "link" && <LinkCharm />}

          {/* Content */}
          <span style={{ position: "relative", zIndex: 1 }}>{children}</span>
        </button>

        {hint ? (
          <div
            style={{
              marginTop: 6,
              fontSize: 12,
              color: TOKENS.subtext,
              textAlign: fullWidth ? "left" : "center",
            }}
          >
            {hint}
          </div>
        ) : null}
      </div>
    );
  }
);
ReusableButton.displayName = "ReusableButton";

/* ---------- Named exports ---------- */
export const PrimaryButton = (p: Omit<ButtonProps, "variant">) => (
  <ReusableButton variant="primary" {...p} />
);
export const SecondaryButton = (p: Omit<ButtonProps, "variant">) => (
  <ReusableButton variant="secondary" {...p} />
); // outline only
export const TertiaryButton = (p: Omit<ButtonProps, "variant">) => (
  <ReusableButton variant="tertiary" {...p} />
); // ghost
export const LinkButton = (p: Omit<ButtonProps, "variant">) => (
  <ReusableButton variant="link" {...p} />
); // text + underline
