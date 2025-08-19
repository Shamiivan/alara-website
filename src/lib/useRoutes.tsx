"use client";

import { usePathname } from 'next/navigation';
import { useConvexAuth } from 'convex/react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import routes, { RouteConfig, getRouteConfig } from './routes';
import { useEffect } from 'react';

export interface UseRoutesReturn {
  currentRoute: RouteConfig | undefined;
  isAuthenticated: boolean;
  isAuthorized: boolean;
  isLoading: boolean;
  userStatus: {
    isAuthenticated: boolean;
    isOnboarded: boolean;
    hasPaid: boolean;
  };
  shouldRedirect: boolean;
  redirectTo: string | null;
}

export function useRoutes(): UseRoutesReturn {
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const user = useQuery(api.user.getCurrentUser);
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();

  // Check for payment success parameters
  const isPaymentSuccess = searchParams.get('payment') === 'success';
  const paymentId = searchParams.get('paymentId');

  // Get current route config
  const currentRoute = getRouteConfig(pathname);

  // Default user status
  const userStatus = {
    isAuthenticated: isAuthenticated,
    isOnboarded: user?.isOnboarded || false,
    hasPaid: user?.hasPaid || false
  };

  // Debug logging
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("useRoutes - Current path:", pathname);
      console.log("useRoutes - Route config:", currentRoute);
      console.log("useRoutes - Auth status:", { isAuthenticated, isLoading });
      console.log("useRoutes - User data:", user);
      console.log("useRoutes - User status:", userStatus);
      console.log("useRoutes - Payment params:", { isPaymentSuccess, paymentId });
    }
  }, [pathname, currentRoute, isAuthenticated, isLoading, user, userStatus, isPaymentSuccess, paymentId]);

  // Determine if user is authorized for this route
  let isAuthorized = true;
  let shouldRedirect = false;
  let redirectTo: string | null = null;

  if (currentRoute) {
    // Check authentication requirement
    if (currentRoute.requiresAuth && !isAuthenticated) {
      isAuthorized = false;
      shouldRedirect = true;
      redirectTo = '/auth/login';
      if (process.env.NODE_ENV === "development") {
        console.log("useRoutes - Redirecting to login: Not authenticated");
      }
    }

    // Check onboarding requirement
    else if (currentRoute.requiresOnboarding && !userStatus.isOnboarded) {
      // Special case: If we're on dashboard with payment success params, don't redirect
      if (pathname === '/dashboard' && isPaymentSuccess && paymentId) {
        if (process.env.NODE_ENV === "development") {
          console.log("useRoutes - Allowing dashboard access after payment success");
        }
        isAuthorized = true;
        shouldRedirect = false;
      } else {
        isAuthorized = false;
        shouldRedirect = true;
        redirectTo = '/onboarding';
        if (process.env.NODE_ENV === "development") {
          console.log("useRoutes - Redirecting to onboarding: Not onboarded", {
            pathname,
            isPaymentSuccess,
            paymentId
          });
        }
      }
    }

    // Check payment requirement
    else if (currentRoute.requiresPayment && !userStatus.hasPaid) {
      isAuthorized = false;
      shouldRedirect = true;
      redirectTo = '/payment';
      if (process.env.NODE_ENV === "development") {
        console.log("useRoutes - Redirecting to payment: Not paid");
      }
    }
  }

  // If authenticated and on a public-only route like login or home, redirect to dashboard
  if (isAuthenticated && !isLoading && pathname === '/') {
    shouldRedirect = true;
    redirectTo = '/dashboard';
  }

  return {
    currentRoute,
    isAuthenticated,
    isAuthorized,
    isLoading,
    userStatus,
    shouldRedirect,
    redirectTo
  };
}

export default useRoutes;