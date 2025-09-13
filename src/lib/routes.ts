import { LayoutDashboard, Settings, User, HelpCircle, LogOut } from 'lucide-react';

export interface RouteConfig {
  id: string;
  path: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  showInNav?: boolean;
  showInUserMenu?: boolean;
  showInFooter?: boolean;
  requiresAuth?: boolean;
  requiresOnboarding?: boolean;
  requiresPayment?: boolean;
  isPublic?: boolean;
  divider?: boolean;
  variant?: 'default' | 'danger';
  children?: RouteConfig[];
}

const routes: RouteConfig[] = [
  // Public pages
  {
    id: 'home',
    path: '/',
    label: 'Home',
    isPublic: true,
    showInNav: false,
  },
  {
    id: 'pricing',
    path: '/pricing',
    label: 'Pricing',
    isPublic: true,
    showInNav: true,
  },
  {
    id: 'faq',
    path: '/faq',
    label: 'FAQ',
    isPublic: true,
    showInNav: true,
  },
  {
    id: 'policy',
    path: '/policy',
    label: 'Policies',
    isPublic: true,
    showInNav: true,
  },
  {
    id: 'login',
    path: '/auth/login',
    label: 'Login',
    isPublic: true,
    showInNav: false,
  },

  // Protected pages
  {
    id: 'dashboard',
    path: '/app/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    requiresAuth: true,
    requiresOnboarding: true,
    requiresPayment: true,
    showInNav: true,
    showInUserMenu: true,
  },
  {
    id: "calls",
    path: '/app/calls',
    label: 'calls',
    icon: LayoutDashboard,
    requiresAuth: true,
    requiresOnboarding: true,
    requiresPayment: true,
    showInNav: true,
    showInUserMenu: true,
  },
  {
    id: "tasks",
    path: '/app/tasks',
    label: 'tasks',
    icon: LayoutDashboard,
    requiresAuth: true,
    requiresOnboarding: true,
    requiresPayment: true,
    showInNav: true,
    showInUserMenu: true,
  },
  {
    id: "settings",
    path: '/app/settings',
    label: 'settings',
    icon: LayoutDashboard,
    requiresAuth: true,
    requiresOnboarding: true,
    requiresPayment: true,
    showInNav: true,
    showInUserMenu: true,
  },
  {
    id: 'onboarding',
    path: '/onboarding',
    label: 'Onboarding',
    requiresAuth: true,
    showInNav: false,
  },
  {
    id: 'payment',
    path: '/payment',
    label: 'Payment',
    requiresAuth: true,
    requiresOnboarding: false,
    showInNav: false,
  },
  {
    id: 'profile',
    path: '/profile',
    label: 'Your Profile',
    icon: User,
    requiresAuth: true,
    showInNav: false,
    showInUserMenu: true,
  },
  {
    id: 'settings',
    path: '/settings',
    label: 'Settings',
    icon: Settings,
    requiresAuth: true,
    showInNav: false,
    showInUserMenu: true,
  },
  {
    id: 'help',
    path: '/help',
    label: 'Help & Support',
    icon: HelpCircle,
    isPublic: true,
    showInNav: false,
    showInUserMenu: true,
  },
];

// Helper functions to filter routes for different purposes
export function getPublicRoutes(): string[] {
  return routes.filter(route => route.isPublic).map(route => route.path);
}

export function getProtectedRoutes(): string[] {
  return routes.filter(route => route.requiresAuth).map(route => route.path);
}

export function getRoutesRequiringOnboarding(): string[] {
  return routes.filter(route => route.requiresOnboarding).map(route => route.path);
}

export function getRoutesRequiringPayment(): string[] {
  return routes.filter(route => route.requiresPayment).map(route => route.path);
}

export function getNavItems() {
  return routes
    .filter(route => route.showInNav)
    .map(({ id, path, label }) => ({
      id,
      label,
      href: path,
    }));
}

export function getUserNavItems() {
  return routes
    .filter(route => route.requiresAuth && !route.showInUserMenu)
    .map(({ id, path, label, icon, requiresAuth, requiresOnboarding, requiresPayment }) => ({
      id,
      label,
      href: path,
      icon,
      requiresAuth,
      requiresOnboarding,
      requiresPayment
    }));
}

export function getUserMenuItems() {
  const menuItems = routes
    .filter(route => route.showInUserMenu && !['profile', 'settings', 'help'].includes(route.id))
    .map(({ id, path, label, icon, variant }) => ({
      id,
      label,
      href: path,
      icon,
      variant,
    }));

  // Add dividers and logout
  return [
    ...menuItems,
    { id: 'divider-2', divider: true },
    { id: 'signout', label: 'Sign Out', icon: LogOut, variant: 'danger' as const }
  ];
}

export function getRouteConfig(path: string): RouteConfig | undefined {
  return routes.find(route => route.path === path);
}

export default routes;