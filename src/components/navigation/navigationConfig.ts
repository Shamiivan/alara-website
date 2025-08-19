import { LayoutDashboard, Settings, User, HelpCircle, LogOut } from 'lucide-react';

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

export const navigationConfig = {
  mainNav: [
    {
      id: 'calls',
      label: 'Calls',
      href: '/calls',
    },
    {
      id: 'pricing',
      label: 'Pricing',
      href: '/pricing',
    },
    {
      id: 'faq',
      label: 'FAQ',
      href: '/faq',
    },
    {
      id: 'policy',
      label: 'Policies',
      href: '/policy',
    }
  ],

  userNav: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      requiresAuth: true,
      requiresOnboarding: true,
      requiresPayment: true
    },
    {
      id: 'settings',
      label: 'Settings',
      href: '/settings',
      icon: Settings,
      requiresAuth: true
    }
  ],

  userMenuItems: [
    { id: 'profile', label: 'Your Profile', href: '/profile', icon: User },
    { id: 'settings', label: 'Settings', href: '/settings', icon: Settings },
    { id: 'divider-1', divider: true },
    { id: 'help', label: 'Help & Support', href: '/help', icon: HelpCircle },
    { id: 'divider-2', divider: true },
    { id: 'signout', label: 'Sign Out', icon: LogOut, variant: 'danger' as const }
  ] as UserMenuItem[]
};