"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import { cn } from '../utils';
import { NavItem } from '../navigationConfig';
import { useNavigation } from '../useNavigation';

interface MobileNavItemProps {
  item: NavItem;
  className?: string;
}

export const MobileNavItem: React.FC<MobileNavItemProps> = ({
  item,
  className
}) => {
  const pathname = usePathname();
  const { closeMobileMenu, setActiveItem } = useNavigation();
  const [isExpanded, setIsExpanded] = useState(false);

  const hasChildren = item.children && item.children.length > 0;
  const isActive = pathname === item.href ||
    (item.children?.some(child => pathname === child.href));

  // Handle item click
  const handleItemClick = () => {
    if (hasChildren) {
      setIsExpanded(!isExpanded);
    } else {
      setActiveItem(item.id);
      closeMobileMenu();
    }
  };

  return (
    <div className={cn('w-full', className)}>
      {hasChildren ? (
        <div>
          <button
            className={cn(
              'flex items-center justify-between w-full px-4 py-3 text-sm font-medium rounded-md',
              isActive
                ? 'text-primary'
                : 'text-foreground hover:bg-accent hover:text-accent-foreground'
            )}
            onClick={handleItemClick}
            aria-expanded={isExpanded}
          >
            <span>{item.label}</span>
            <ChevronDown className={cn(
              'h-4 w-4 transition-transform',
              isExpanded && 'rotate-180'
            )} />
          </button>

          {isExpanded && (
            <div className="pl-4 space-y-1 mt-1">
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
                  onClick={() => {
                    setActiveItem(child.id);
                    closeMobileMenu();
                  }}
                >
                  {child.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      ) : (
        <Link
          href={item.href}
          className={cn(
            'flex items-center w-full px-4 py-3 text-sm font-medium rounded-md',
            isActive
              ? 'bg-primary/10 text-primary'
              : 'text-foreground hover:bg-accent hover:text-accent-foreground'
          )}
          onClick={handleItemClick}
        >
          {item.icon && <item.icon className="mr-2 h-4 w-4" />}
          <span>{item.label}</span>
        </Link>
      )}
    </div>
  );
};

export default MobileNavItem;