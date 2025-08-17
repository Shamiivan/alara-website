"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '../utils';
import UserMenu from '../UserMenu/UserMenu';
import { useEffect, useState } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface NavbarCTAProps {
  user?: User;
  className?: string;
}

export const NavbarCTA: React.FC<NavbarCTAProps> = ({
  user,
  className
}) => {
  const [isClient, setIsClient] = useState(false);

  // Log for debugging hydration issues
  console.log('[NavbarCTA] Rendering with user:', user ? {
    id: user.id,
    name: user.name,
    email: user.email
  } : 'No user', 'isClient:', isClient);

  useEffect(() => {
    setIsClient(true);
    console.log('[NavbarCTA] Component hydrated');
  }, []);

  // Only render user-dependent content after client-side hydration
  // This prevents hydration mismatches between server and client
  if (!isClient) {
    console.log('[NavbarCTA] Rendering initial safe view (pre-hydration)');
    return (
      <div className={cn('flex items-center gap-2', className)}>
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
    );
  }

  // After hydration, if user is authenticated, show user menu
  if (user) {
    console.log('[NavbarCTA] Rendering authenticated view');
    return (
      <div className={cn('flex items-center', className)}>
        <UserMenu user={user} />
      </div>
    );
  }

  // Otherwise, show sign in and get started buttons
  console.log('[NavbarCTA] Rendering unauthenticated view');
  return (
    <div className={cn('flex items-center gap-2', className)}>
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
  );
};

export default NavbarCTA;