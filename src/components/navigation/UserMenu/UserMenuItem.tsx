"use client";

import Link from 'next/link';
import { cn } from '../utils';

interface UserMenuItemProps {
  id: string;
  label: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick?: () => void;
  variant?: 'default' | 'danger';
  divider?: boolean;
  className?: string;
}

export const UserMenuItem: React.FC<UserMenuItemProps> = ({
  label,
  href,
  icon: Icon,
  onClick,
  variant = 'default',
  divider,
  className
}) => {
  // If it's a divider, render a divider line
  if (divider) {
    return <div className="my-1 border-t border-border" />;
  }

  const itemClasses = cn(
    'flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md',
    variant === 'default'
      ? 'text-foreground hover:bg-accent hover:text-accent-foreground'
      : 'text-destructive hover:bg-destructive/10',
    className
  );

  // If there's an href, render a Link
  if (href) {
    return (
      <Link href={href} className={itemClasses} onClick={onClick}>
        {Icon && <Icon className="h-4 w-4" />}
        <span>{label}</span>
      </Link>
    );
  }

  // Otherwise, render a button
  return (
    <button
      type="button"
      className={itemClasses}
      onClick={onClick}
    >
      {Icon && <Icon className="h-4 w-4" />}
      <span>{label}</span>
    </button>
  );
};

export default UserMenuItem;