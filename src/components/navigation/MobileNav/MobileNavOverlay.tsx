"use client";

import { cn } from '../utils';

interface MobileNavOverlayProps {
  isOpen: boolean;
  onClick: () => void;
  className?: string;
}

export const MobileNavOverlay: React.FC<MobileNavOverlayProps> = ({
  isOpen,
  onClick,
  className
}) => {
  if (!isOpen) return null;

  return (
    <div
      className={cn(
        'fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity',
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none',
        className
      )}
      onClick={onClick}
      aria-hidden="true"
    />
  );
};

export default MobileNavOverlay;