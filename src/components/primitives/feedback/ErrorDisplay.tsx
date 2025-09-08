import React from "react";
import { TOKENS } from "../../tokens";
import { AlertCircle, RefreshCw } from "lucide-react";

interface ErrorDisplayProps {
  error: string;
  retry?: () => void;
  variant?: "card" | "inline" | "banner";
  className?: string;
}

export function ErrorDisplay({
  error,
  retry,
  variant = "card",
  className = ""
}: ErrorDisplayProps) {
  const baseStyles: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: TOKENS.warn || "#B45309",
  };

  const cardStyles: React.CSSProperties = {
    ...baseStyles,
    backgroundColor: TOKENS.warnBg || "rgba(245,158,11,0.12)",
    border: `1px solid ${TOKENS.warn || "#F59E0B"}`,
    borderRadius: TOKENS.radius,
    padding: "12px 16px",
  };

  const inlineStyles: React.CSSProperties = {
    ...baseStyles,
    fontSize: "14px",
  };

  const bannerStyles: React.CSSProperties = {
    ...baseStyles,
    backgroundColor: TOKENS.warnBg || "rgba(245,158,11,0.12)",
    border: `1px solid ${TOKENS.warn || "#F59E0B"}`,
    borderRadius: TOKENS.radius,
    padding: "8px 12px",
    fontSize: "14px",
    width: "100%",
  };

  const getStyles = () => {
    switch (variant) {
      case "inline":
        return inlineStyles;
      case "banner":
        return bannerStyles;
      default:
        return cardStyles;
    }
  };

  return (
    <div style={getStyles()} className={className} role="alert">
      <AlertCircle size={16} />
      <span style={{ flex: 1 }}>{error}</span>
      {retry && (
        <button
          onClick={retry}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            background: "transparent",
            border: "none",
            color: "inherit",
            cursor: "pointer",
            fontSize: "14px",
            padding: "4px 8px",
            borderRadius: "4px",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          <RefreshCw size={14} />
          Retry
        </button>
      )}
    </div>
  );
}