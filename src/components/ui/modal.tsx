"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

// Modal size variants
const modalVariants = cva(
  "relative bg-background rounded-xl border shadow-lg max-h-[85vh] overflow-hidden transition-all duration-300 ease-in-out transform",
  {
    variants: {
      size: {
        sm: "w-full max-w-sm",
        md: "w-full max-w-md",
        lg: "w-full max-w-lg",
        xl: "w-full max-w-xl",
        "2xl": "w-full max-w-2xl",
        full: "w-full h-full max-w-none max-h-none rounded-none",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

// Modal backdrop variants
const backdropVariants = cva(
  "fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300",
  {
    variants: {
      blur: {
        none: "bg-black/50",
        sm: "bg-black/50 backdrop-blur-sm",
        md: "bg-black/60 backdrop-blur",
        lg: "bg-black/70 backdrop-blur-lg",
      },
    },
    defaultVariants: {
      blur: "md",
    },
  }
);

// Interfaces
export interface ModalProps extends VariantProps<typeof modalVariants> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  blur?: VariantProps<typeof backdropVariants>["blur"];
  className?: string;
  "data-testid"?: string;
}

export interface ModalContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export interface ModalHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export interface ModalBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export interface ModalFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export interface ModalCloseButtonProps extends React.ComponentProps<typeof Button> {
  onClose?: () => void;
}

// Custom hook for focus trap
function useFocusTrap(isOpen: boolean, containerRef: React.RefObject<HTMLElement | null>) {
  React.useEffect(() => {
    if (!isOpen || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    container.addEventListener("keydown", handleTabKey);
    firstElement?.focus();

    return () => {
      container.removeEventListener("keydown", handleTabKey);
    };
  }, [isOpen, containerRef]);
}

// Custom hook for body scroll lock
function useBodyScrollLock(isOpen: boolean) {
  React.useEffect(() => {
    if (isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = "hidden";

      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen]);
}

// Main Modal Component
export const Modal: React.FC<ModalProps> = ({
  open,
  onOpenChange,
  children,
  size,
  blur = "md",
  closeOnBackdropClick = true,
  closeOnEscape = true,
  className,
  "data-testid": dataTestId,
}) => {
  const [mounted, setMounted] = React.useState(false);
  const [isAnimating, setIsAnimating] = React.useState(false);
  const modalRef = React.useRef<HTMLDivElement>(null);
  const backdropRef = React.useRef<HTMLDivElement>(null);

  // Handle mounting for SSR compatibility
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Handle body scroll lock
  useBodyScrollLock(open);

  // Handle focus trap
  useFocusTrap(open, modalRef);

  // Handle animations
  React.useEffect(() => {
    if (open) {
      setIsAnimating(true);
    }
  }, [open]);

  // Handle escape key
  React.useEffect(() => {
    if (!closeOnEscape || !open) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onOpenChange(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [closeOnEscape, open, onOpenChange]);

  // Handle backdrop click
  const handleBackdropClick = React.useCallback((e: React.MouseEvent) => {
    if (!closeOnBackdropClick) return;
    if (e.target === backdropRef.current) {
      onOpenChange(false);
    }
  }, [closeOnBackdropClick, onOpenChange]);

  // Handle animation end
  const handleAnimationEnd = React.useCallback(() => {
    if (!open) {
      setIsAnimating(false);
    }
  }, [open]);

  // Don't render on server or if not mounted
  if (!mounted || (!open && !isAnimating)) {
    return null;
  }

  const modalContent = (
    <div
      ref={backdropRef}
      className={cn(
        backdropVariants({ blur }),
        !open && isAnimating && "opacity-0",
        open && "opacity-100"
      )}
      onClick={handleBackdropClick}
      onAnimationEnd={handleAnimationEnd}
      onTransitionEnd={handleAnimationEnd}
      data-testid={dataTestId}
      role="dialog"
      aria-modal="true"
    >
      <div
        ref={modalRef}
        className={cn(
          modalVariants({ size }),
          !open && isAnimating && "scale-95 opacity-0",
          open && "scale-100 opacity-100",
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

// Modal Content Component
export const ModalContent: React.FC<ModalContentProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div
      className={cn("flex flex-col max-h-full", className)}
      {...props}
    >
      {children}
    </div>
  );
};

// Modal Header Component
export const ModalHeader: React.FC<ModalHeaderProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        "flex items-center justify-between p-6 border-b border-border",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

// Modal Body Component
export const ModalBody: React.FC<ModalBodyProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div
      className={cn("flex-1 p-6 overflow-y-auto", className)}
      {...props}
    >
      {children}
    </div>
  );
};

// Modal Footer Component
export const ModalFooter: React.FC<ModalFooterProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        "flex items-center justify-end gap-3 p-6 border-t border-border",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

// Modal Close Button Component
export const ModalCloseButton: React.FC<ModalCloseButtonProps> = ({
  onClose,
  className,
  ...props
}) => {
  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn("h-8 w-8 rounded-full", className)}
      onClick={onClose}
      aria-label="Close modal"
      {...props}
    >
      <X className="h-4 w-4" />
    </Button>
  );
};

// Hook for easier modal management
export const useModal = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  const openModal = React.useCallback(() => setIsOpen(true), []);
  const closeModal = React.useCallback(() => setIsOpen(false), []);
  const toggleModal = React.useCallback(() => setIsOpen(prev => !prev), []);

  return {
    isOpen,
    openModal,
    closeModal,
    toggleModal,
    setIsOpen,
  };
};

// Export all components and hooks
// (Types are already exported with their declarations above)