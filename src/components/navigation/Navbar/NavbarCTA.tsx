"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '../utils';
import UserMenu from '../UserMenu/UserMenu';

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
  // If user is authenticated, show user menu
  if (user) {
    return (
      <div className={cn('flex items-center', className)}>
        <UserMenu user={user} />
      </div>
    );
  }

  // Otherwise, show sign in and get started buttons
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