import {
  getNavItems,
  getUserNavItems,
  getUserMenuItems
} from '@/lib/routes';

// Re-export the interfaces from routes.ts
export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  children?: NavItem[];
  requiresAuth?: boolean;
  requiresOnboarding?: boolean;
  requiresPayment?: boolean;
  divider?: boolean;
  variant?: 'default' | 'danger';
}

export interface UserMenuItem {
  id: string;
  label?: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
  divider?: boolean;
  variant?: 'default' | 'danger';
}

// Use the centralized route configuration
export const navigationConfig = {
  mainNav: getNavItems(),
  userNav: getUserNavItems(),
  userMenuItems: getUserMenuItems() as UserMenuItem[]
};