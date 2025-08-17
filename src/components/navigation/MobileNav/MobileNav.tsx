"use client";

import { useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../utils';
import { NavItem } from '../navigationConfig';
import { useNavigation } from '../useNavigation';
import MobileNavItem from './MobileNavItem';
import MobileNavOverlay from './MobileNavOverlay';
import UserAvatar from '../UserMenu/UserAvatar';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface MobileNavProps {
  isOpen: boolean;
  user?: User;
  items: NavItem[];
  position?: 'left' | 'right';
  className?: string;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  isOpen,
  user,
  items,
  position = 'left',
  className
}) => {
  const { closeMobileMenu } = useNavigation();
  const navRef = useRef<HTMLDivElement>(null);

  // Focus trap for accessibility
  useEffect(() => {
    if (!isOpen) return;

    const nav = navRef.current;
    if (!nav) return;

    // Focus the first focusable element
    const focusableElements = nav.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length > 0) {
      (focusableElements[0] as HTMLElement).focus();
    }

    // Handle tab key to trap focus
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <>
      <MobileNavOverlay isOpen={isOpen} onClick={closeMobileMenu} />

      <div
        ref={navRef}
        className={cn(
          'fixed inset-y-0 w-[280px] max-w-[85vw] bg-background border-r border-border z-50 transition-transform duration-300 ease-in-out',
          position === 'left' ? 'left-0' : 'right-0',
          isOpen
            ? 'translate-x-0'
            : position === 'left'
              ? '-translate-x-full'
              : 'translate-x-full',
          className
        )}
        aria-hidden={!isOpen}
      >
        {/* Header with close button */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <Link href="/" className="flex items-center" onClick={closeMobileMenu}>
            <div className="relative w-8 h-8">
              <div className="absolute inset-0 bg-primary/10 rounded-full"></div>
              <div className="absolute inset-2 bg-primary/20 rounded-full"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  className="w-4 h-4 text-primary"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                  />
                </svg>
              </div>
            </div>
            <span className="ml-2 text-xl font-bold text-foreground">Alara</span>
          </Link>

          <button
            className="p-2 rounded-md hover:bg-accent"
            onClick={closeMobileMenu}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User section if authenticated */}
        {user && (
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <UserAvatar user={user} size="sm" />
              <div>
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation items */}
        <div className="p-2 space-y-1 overflow-y-auto max-h-[calc(100vh-180px)]">
          {items.map((item) => (
            <MobileNavItem key={item.id} item={item} />
          ))}
        </div>

        {/* Footer with auth buttons */}
        <div className="p-4 border-t border-border mt-auto">
          {user ? (
            <Button
              variant="outline"
              className="w-full justify-center"
              onClick={closeMobileMenu}
            >
              Dashboard
            </Button>
          ) : (
            <div className="flex flex-col gap-2">
              <Link href="/auth/login" onClick={closeMobileMenu} className="w-full">
                <Button variant="outline" className="w-full justify-center">
                  Sign In
                </Button>
              </Link>
              <Link href="/payment" onClick={closeMobileMenu} className="w-full">
                <Button className="w-full justify-center bg-primary hover:bg-primary/90 text-white">
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MobileNav;