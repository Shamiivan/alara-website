"use client";

import { cn } from '../utils';
import { NavItem } from '../navigationConfig';
import NavbarItem from './NavbarItem';

interface NavbarNavProps {
  items: NavItem[];
  orientation?: 'horizontal' | 'vertical';
  isMobile?: boolean;
  className?: string;
}

export const NavbarNav: React.FC<NavbarNavProps> = ({
  items,
  orientation = 'horizontal',
  isMobile = false,
  className
}) => {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        'flex',
        orientation === 'horizontal' ? 'flex-row items-center' : 'flex-col',
        className
      )}
      role="navigation"
    >
      {items.map((item) => (
        <NavbarItem
          key={item.id}
          item={item}
          isMobile={isMobile}
          className={cn(
            orientation === 'vertical' && 'w-full'
          )}
        />
      ))}
    </div>
  );
};

export default NavbarNav;