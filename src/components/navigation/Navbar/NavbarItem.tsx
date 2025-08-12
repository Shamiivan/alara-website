"use client";

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import { cn } from '../utils';
import { NavItem } from '../navigationConfig';
import { useNavigation } from '../useNavigation';

interface NavbarItemProps {
  item: NavItem;
  isMobile?: boolean;
  className?: string;
}

export const NavbarItem: React.FC<NavbarItemProps> = ({
  item,
  isMobile = false,
  className
}) => {
  const pathname = usePathname();
  const { setActiveItem } = useNavigation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const hasChildren = item.children && item.children.length > 0;
  const isActive = pathname === item.href ||
    (item.children?.some(child => pathname === child.href));

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (hasChildren) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(!isOpen);
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    }
  };

  // Mobile version (no dropdown, all items expanded)
  if (isMobile) {
    if (hasChildren) {
      return (
        <div className={cn('space-y-1', className)}>
          <div className="px-4 py-2 text-sm font-medium text-muted-foreground">
            {item.label}
          </div>
          <div className="pl-4 space-y-1">
            {item.children?.map((child) => (
              <Link
                key={child.id}
                href={child.href}
                className={cn(
                  'block px-4 py-2 text-sm rounded-md',
                  pathname === child.href
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                )}
                onClick={() => setActiveItem(child.id)}
              >
                {child.label}
              </Link>
            ))}
          </div>
        </div>
      );
    }

    return (
      <Link
        href={item.href}
        className={cn(
          'block px-4 py-2 text-sm rounded-md',
          isActive
            ? 'bg-primary/10 text-primary font-medium'
            : 'text-foreground hover:bg-accent hover:text-accent-foreground',
          className
        )}
        onClick={() => setActiveItem(item.id)}
      >
        {item.label}
      </Link>
    );
  }

  // Desktop version with dropdown
  if (hasChildren) {
    return (
      <div className={cn('relative', className)} ref={dropdownRef}>
        <button
          className={cn(
            'flex items-center gap-1 px-3 py-2 text-sm rounded-md',
            isActive || isOpen
              ? 'text-primary font-medium'
              : 'text-foreground hover:text-primary',
          )}
          onClick={() => setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          {item.label}
          <ChevronDown className={cn(
            'h-4 w-4 transition-transform',
            isOpen && 'rotate-180'
          )} />
        </button>

        {isOpen && (
          <div className="absolute left-0 z-10 mt-1 w-48 origin-top-left rounded-md bg-card shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="py-1" role="menu" aria-orientation="vertical">
              {item.children?.map((child) => (
                <Link
                  key={child.id}
                  href={child.href}
                  className={cn(
                    'block px-4 py-2 text-sm',
                    pathname === child.href
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                  role="menuitem"
                  onClick={() => {
                    setIsOpen(false);
                    setActiveItem(child.id);
                  }}
                >
                  {child.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Regular link (no children)
  return (
    <Link
      href={item.href}
      className={cn(
        'px-3 py-2 text-sm rounded-md',
        isActive
          ? 'text-primary font-medium'
          : 'text-foreground hover:text-primary',
        className
      )}
      onClick={() => setActiveItem(item.id)}
    >
      {item.label}
    </Link>
  );
};

export default NavbarItem;