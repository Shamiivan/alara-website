"use client";

import { cn } from '../utils';

interface HamburgerButtonProps {
  isOpen: boolean;
  onClick: () => void;
  variant?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  ariaLabel?: string;
}

export const HamburgerButton: React.FC<HamburgerButtonProps> = ({
  isOpen,
  onClick,
  variant = 'dark',
  size = 'md',
  className,
  ariaLabel = 'Toggle navigation menu'
}) => {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <button
      className={cn(
        'relative flex flex-col justify-center items-center',
        'p-2 rounded-md transition-colors',
        'hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary',
        sizeClasses[size],
        className
      )}
      onClick={onClick}
      aria-label={ariaLabel}
      aria-expanded={isOpen}
      type="button"
    >
      <span
        className={cn(
          'absolute h-0.5 w-full transition-all duration-300',
          variant === 'light' ? 'bg-white' : 'bg-foreground',
          isOpen ? 'rotate-45 top-1/2' : 'top-[25%]'
        )}
      />
      <span
        className={cn(
          'absolute h-0.5 w-full transition-all duration-300',
          variant === 'light' ? 'bg-white' : 'bg-foreground',
          isOpen ? 'opacity-0' : 'opacity-100'
        )}
      />
      <span
        className={cn(
          'absolute h-0.5 w-full transition-all duration-300',
          variant === 'light' ? 'bg-white' : 'bg-foreground',
          isOpen ? '-rotate-45 bottom-1/2' : 'bottom-[25%]'
        )}
      />
    </button>
  );
};

export default HamburgerButton;