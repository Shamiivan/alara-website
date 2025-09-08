import React from "react";
import { TOKENS } from "../../tokens";

interface LoadingStateProps {
  variant?: "spinner" | "skeleton" | "dots";
  size?: "sm" | "md" | "lg";
  message?: string;
  className?: string;
}

export function LoadingState({
  variant = "spinner",
  size = "md",
  message,
  className = ""
}: LoadingStateProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8"
  };

  const renderSpinner = () => (
    <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-current ${sizeClasses[size]}`} />
  );

  const renderSkeleton = () => (
    <div className="animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
    </div>
  );

  const renderDots = () => (
    <div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`bg-current rounded-full animate-pulse ${sizeClasses[size]}`}
          style={{ animationDelay: `${i * 0.2}s` }}
        />
      ))}
    </div>
  );

  const renderVariant = () => {
    switch (variant) {
      case "skeleton":
        return renderSkeleton();
      case "dots":
        return renderDots();
      default:
        return renderSpinner();
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center p-4 ${className}`}>
      {renderVariant()}
      {message && (
        <p className="mt-2 text-sm text-gray-600" style={{ color: TOKENS.subtext }}>
          {message}
        </p>
      )}
    </div>
  );
}