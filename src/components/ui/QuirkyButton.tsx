"use client";

import * as React from "react";
import { Sparkles } from "lucide-react"; // lucide icon for sparkle
import { Flower2 } from "lucide-react";  // zen-like outline icon

// Tokens
const TOKENS = {
  quirkyBg: "linear-gradient(135deg,#A78BFA 0%,#E0E7FF 100%)", // warm purple → lavender
  quirkyFg: "#0F172A",
  radius: 14,
  focus: "0 0 0 3px rgba(167,139,250,0.4)",

  zenBorder: "#A78BFA",
  text: "#0F172A",
};

function injectCSS() {
  if (document.getElementById("quirky-btn-styles")) return;
  const css = `
    @keyframes wiggle { 
      0%,100%{ transform: rotate(0deg);} 
      25%{ transform: rotate(1.5deg);} 
      75%{ transform: rotate(-1.5deg);} 
    }
    .quirky-btn:hover { animation: wiggle 280ms ease }
    .zen-icon-breathe { 
      animation: breathe 2.8s ease-in-out infinite;
      transform-origin: center;
    }
    @keyframes breathe {
      0%,100% { transform: scale(1); opacity: 0.7 }
      50% { transform: scale(1.2); opacity: 1 }
    }
  `;
  const tag = document.createElement("style");
  tag.id = "quirky-btn-styles";
  tag.innerHTML = css;
  document.head.appendChild(tag);
}

export const QuirkyButton = ({
  children,
  hint,
  onClick,
}: {
  children: React.ReactNode;
  hint?: string;
  onClick?: () => void;
}) => {
  React.useEffect(injectCSS, []);

  return (
    <div style={{ display: "inline-block", textAlign: "center" }}>
      <button
        onClick={onClick}
        className="quirky-btn"
        style={{
          background: TOKENS.quirkyBg,
          color: TOKENS.quirkyFg,
          borderRadius: TOKENS.radius,
          padding: "14px 22px",
          fontWeight: 600,
          fontSize: 16,
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          border: "none",
          cursor: "pointer",
          boxShadow: "0 2px 8px rgba(167,139,250,0.3)",
        }}
      >
        <Sparkles size={18} />
        {children}
      </button>
      {hint && (
        <div style={{ marginTop: 6, fontSize: 13, color: "#475569" }}>
          {hint}
        </div>
      )}
    </div>
  );
};

export const ZenQuirkyButton = ({
  children,
  hint,
  onClick,
}: {
  children: React.ReactNode;
  hint?: string;
  onClick?: () => void;
}) => {
  React.useEffect(injectCSS, []);

  return (
    <div style={{ display: "inline-block", textAlign: "center" }}>
      <button
        onClick={onClick}
        style={{
          background: "transparent",
          color: TOKENS.text,
          borderRadius: TOKENS.radius,
          padding: "12px 20px",
          fontWeight: 500,
          fontSize: 15,
          display: "inline-flex",
          alignItems: "center",
          gap: 10,
          border: `2px solid ${TOKENS.zenBorder}`,
          cursor: "pointer",
        }}
      >
        <Flower2
          size={18}
          className="zen-icon-breathe"
          style={{ stroke: TOKENS.zenBorder }}
        />
        {children}
      </button>
      {hint && (
        <div style={{ marginTop: 6, fontSize: 13, color: "#475569" }}>
          {hint}
        </div>
      )}
    </div>
  );
};
