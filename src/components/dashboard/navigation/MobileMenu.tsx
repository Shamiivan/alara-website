"use client";

import { Menu } from "lucide-react";

interface MobileMenuButtonProps {
  onClick: () => void;
  isOpen: boolean;
}

const COLORS = {
  indigo: "#4F46E5",
  slate: "#334155",
  border: "#E5E7EB",
  white: "#FFFFFF",
};

export default function MobileMenuButton({ onClick, isOpen }: MobileMenuButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`fixed top-4 left-4 z-30 md:hidden inline-flex items-center justify-center rounded-lg border px-3 py-2 text-sm transition-all ${isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      style={{
        backgroundColor: COLORS.white,
        borderColor: COLORS.border,
        color: COLORS.slate,
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      }}
      aria-label="Open navigation menu"
    >
      <Menu size={20} />
    </button>
  );
}