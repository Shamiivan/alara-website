"use client";

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Button } from '@/components/ui/button';
import { cn } from '../utils';
import { NavbarBrand } from './NavbarBrand';
import { NavbarNav } from './NavbarNav';
import { NavbarCTA } from './NavbarCTA';
import HamburgerButton from '../MobileNav/HamburgerButton';
import MobileNav from '../MobileNav/MobileNav';
import { navigationConfig } from '../navigationConfig';
import { useNavigation } from '../useNavigation';

// Define the Convex user type
interface ConvexUser {
  _id: string;
  _creationTime: number;
  name?: string;
  email?: string;
  isOnboarded?: boolean;
  hasPaid?: boolean;
  [key: string]: any;
}

// Define our internal User type
interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface NavbarProps {
  user?: User;
  variant?: 'default' | 'transparent' | 'dark';
  fixed?: boolean;
  hideOnScroll?: boolean;
  showShadow?: boolean;
  logo?: React.ReactNode;
  className?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  user: propUser,
  variant = 'default',
  fixed = true,
  hideOnScroll = false,
  showShadow = true,
  logo,
  className
}) => {
  // For debugging hydration issues
  const isHydrated = useRef(false);
  const [isClient, setIsClient] = useState(false);

  // Fetch current user from Convex
  const convexUser = useQuery(api.user.getCurrentUser);

  // Log user state for debugging
  console.log('[Navbar] Render state:', {
    isHydrated: isHydrated.current,
    isClient,
    hasConvexUser: !!convexUser,
    convexUserData: convexUser ? {
      id: convexUser._id.toString(),
      name: convexUser.name,
      email: convexUser.email
    } : null,
    hasPropUser: !!propUser
  });

  // Convert Convex user to our User type if available
  const convertedUser = convexUser ? {
    id: convexUser._id.toString(),
    name: convexUser.name || 'User',
    email: convexUser.email || '',
    // Use image property if available, otherwise undefined
    avatar: convexUser.image
  } : undefined;

  // Use provided user prop or converted user
  // IMPORTANT: Only use user data after client-side hydration to prevent hydration mismatch
  const user = isClient ? (propUser || convertedUser) : undefined;
  const { isMobileMenuOpen, toggleMobileMenu } = useNavigation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const pathname = usePathname();

  // Mark component as hydrated after first render
  useEffect(() => {
    isHydrated.current = true;
    setIsClient(true);
    console.log('[Navbar] Component hydrated');
  }, []);

  // Handle scroll behavior
  useEffect(() => {
    if (!hideOnScroll && !showShadow) return;

    // Only access window after hydration
    let lastScrollY = typeof window !== 'undefined' ? window.scrollY : 0;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const isScrollingDown = scrollY > lastScrollY;

      setIsScrolled(scrollY > 10);

      if (hideOnScroll) {
        if (isScrollingDown && scrollY > 50) {
          setIsVisible(false);
        } else {
          setIsVisible(true);
        }
      }

      lastScrollY = scrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hideOnScroll, showShadow]);

  // Skip navigation link for accessibility
  const skipNavId = "skip-navigation";

  return (
    <>
      {/* Skip navigation link for accessibility */}
      <a
        href={`#${skipNavId}`}
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-background focus:text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
      >
        Skip to main content
      </a>

      <nav
        className={cn(
          'w-full border-b border-border z-50 transition-all duration-300',
          {
            'fixed top-0 left-0 right-0': fixed,
            'bg-background': variant === 'default',
            'bg-transparent border-transparent': variant === 'transparent',
            'bg-primary text-white': variant === 'dark',
            'bg-background/95 backdrop-blur-sm': isScrolled && variant !== 'dark',
            '-translate-y-full': !isVisible,
            'shadow-sm': showShadow && isScrolled
          },
          className
        )}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <NavbarBrand logo={logo} />
            <HamburgerButton
              isOpen={isMobileMenuOpen}
              onClick={toggleMobileMenu}
              variant={variant === 'dark' ? 'light' : 'dark'}
              className="lg:hidden"
            />
          </div>

          <div className="hidden lg:flex items-center gap-8">
            <NavbarNav items={navigationConfig.mainNav} />
            {/* Only render NavbarCTA with user data after hydration */}
            {isClient ? (
              <NavbarCTA user={user} />
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm" className="text-sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/payment">
                  <Button size="sm" className="text-sm bg-primary hover:bg-primary/90 text-white">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Only render MobileNav with user data after hydration */}
      {isClient ? (
        <MobileNav
          isOpen={isMobileMenuOpen}
          user={user}
          items={[...navigationConfig.mainNav, ...navigationConfig.userNav]}
        />
      ) : (
        <MobileNav
          isOpen={false}
          items={[...navigationConfig.mainNav]}
        />
      )}

      {/* Skip navigation target */}
      <div id={skipNavId} className="sr-only" tabIndex={-1} />
    </>
  );
};

export default Navbar;