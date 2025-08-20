"use client";

import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import { cn } from '../utils';
import UserAvatar from './UserAvatar';
import UserMenuItem from './UserMenuItem';
import { navigationConfig } from '../navigationConfig';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface UserMenuProps {
  user: User;
  className?: string;
}

export const UserMenu: React.FC<UserMenuProps> = ({
  user,
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { signOut } = useAuthActions();
  const router = useRouter();


  // Mark component as hydrated - always call hooks in the same order
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Close menu when clicking outside - always call hooks in the same order
  useEffect(() => {
    if (!isClient) return; // Skip effect logic until hydrated, but still call the hook

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isClient]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsOpen(!isOpen);
    } else if (e.key === 'Escape' && isOpen) {
      setIsOpen(false);
    }
  };

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/auth/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Render a placeholder during server-side rendering to prevent hydration mismatch
  if (!isClient) {
    console.log('[UserMenu] Rendering placeholder for SSR');
    return (
      <div className={cn('relative', className)}>
        <button
          className="flex items-center gap-2 p-1 rounded-md hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label="User menu"
        >
          <div className="w-8 h-8 rounded-full bg-gray-200"></div>
          <span className="text-sm font-medium hidden sm:block">User</span>
        </button>
      </div>
    );
  }

  // Client-side render with full functionality
  return (
    <div className={cn('relative', className)} ref={menuRef}>
      <button
        className="flex items-center gap-2 p-1 rounded-md hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="User menu"
      >
        <UserAvatar user={user} size="sm" />
        <span className="text-sm font-medium hidden sm:block">{user.name}</span>
        <ChevronDown className={cn(
          'h-4 w-4 text-muted-foreground transition-transform',
          isOpen && 'rotate-180'
        )} />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-card shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-2 px-1" role="menu" aria-orientation="vertical">
            {/* User info header */}
            <div className="px-3 py-2 mb-1">
              <p className="text-sm font-medium text-foreground">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>

            {/* Menu items */}
            <div className="space-y-1">
              {navigationConfig.userMenuItems.map((item) => (
                <UserMenuItem
                  key={item.id}
                  id={item.id}
                  label={item.label || ''}
                  href={item.href}
                  icon={item.icon}
                  variant={item.variant as 'default' | 'danger' | undefined}
                  divider={item.divider}
                  onClick={item.id === 'signout' ? handleSignOut : undefined}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;