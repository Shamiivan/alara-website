import { convexAuthNextjsMiddleware } from "@convex-dev/auth/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { serverLogger, authLogger } from "@/lib/serverLogger";
import {
  getPublicRoutes,
  getProtectedRoutes,
  getRoutesRequiringOnboarding,
  getRoutesRequiringPayment
} from "@/lib/routes";

// Get routes from centralized configuration
const publicRoutes = getPublicRoutes();
const protectedRoutes = getProtectedRoutes();
const requiresOnboarding = getRoutesRequiringOnboarding();
const requiresPayment = getRoutesRequiringPayment();

export default convexAuthNextjsMiddleware(async (request: NextRequest, { convexAuth }) => {
  const { pathname, searchParams } = request.nextUrl;

  // Check if this is a redirect from successful payment
  const isPaymentSuccess = searchParams.get('payment') === 'success';
  const paymentId = searchParams.get('paymentId');

  // Check for static files first
  const isStaticFile = pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.includes(".");

  if (isStaticFile) {
    return NextResponse.next();
  }

  // Log the request
  serverLogger.logRequest(request);

  // If it's a public route, continue
  if (publicRoutes.includes(pathname)) {
    serverLogger.debug("system", `Public route accessed: ${pathname}`, undefined, request);
    return NextResponse.next();
  }

  // If it's not a protected route, continue
  if (!protectedRoutes.includes(pathname)) {
    serverLogger.debug("system", `Non-protected route accessed: ${pathname}`, undefined, request);
    return NextResponse.next();
  }

  try {
    // Check authentication status
    let isAuthenticated = false;

    try {
      isAuthenticated = await convexAuth.isAuthenticated();
    } catch (authError) {
      authLogger.error("Authentication check failed", { error: authError }, request);
      // If we can't check auth status, redirect to login for safety
      const loginUrl = new URL("/auth/login", request.url);
      return NextResponse.redirect(loginUrl);
    }

    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      authLogger.info("Unauthenticated access to protected route", { pathname }, request);
      const loginUrl = new URL("/auth/login", request.url);
      return NextResponse.redirect(loginUrl);
    }

    // Get token for user status check
    let token;
    try {
      token = await convexAuth.getToken();
    } catch (tokenError) {
      authLogger.error("Token retrieval failed", { error: tokenError }, request);
      const loginUrl = new URL("/auth/login", request.url);
      return NextResponse.redirect(loginUrl);
    }

    // Check complete user status (auth, onboarding, payment)
    const userStatus = await checkUserStatus(token);

    // If route requires onboarding and user is not onboarded, redirect to onboarding
    if (requiresOnboarding.includes(pathname) && !userStatus.isOnboarded) {
      // Log additional details for debugging payment-to-onboarding issue
      const paymentParams = {
        isPaymentSuccess: searchParams.get('payment') === 'success',
        paymentId: searchParams.get('paymentId')
      };

      authLogger.info("User needs onboarding", {
        pathname,
        userStatus,
        paymentParams,
        hasPaymentQueryParams: isPaymentSuccess && paymentId
      }, request);

      const onboardingUrl = new URL("/onboarding", request.url);
      return NextResponse.redirect(onboardingUrl);
    }

    // Special case: Allow access to dashboard if coming from successful payment
    // This gives the webhook time to process the payment
    if (pathname === '/dashboard' && isPaymentSuccess && paymentId) {
      serverLogger.info("payment", "Dashboard access allowed after payment success", {
        paymentId,
        userStatus,
        pathname
      }, request);
      return NextResponse.next();
    }

    // If route requires payment and user has not paid, redirect to payment
    if (requiresPayment.includes(pathname) && !userStatus.hasPaid) {
      serverLogger.info("payment", "User needs to complete payment", { pathname, userStatus }, request);
      const paymentUrl = new URL("/payment", request.url);
      return NextResponse.redirect(paymentUrl);
    }

    // User meets all requirements for the route
    serverLogger.debug("system", "Route access granted", { pathname, userStatus }, request);
    return NextResponse.next();

  } catch (error) {
    serverLogger.error("system", "Middleware error", { error }, request);
    // On any error, redirect to login for safety
    const loginUrl = new URL("/auth/login", request.url);
    return NextResponse.redirect(loginUrl);
  }
});

// Check complete user status (auth, onboarding, payment)
async function checkUserStatus(token?: string): Promise<{ isAuthenticated: boolean, isOnboarded: boolean, hasPaid: boolean }> {
  if (!token) return { isAuthenticated: false, isOnboarded: false, hasPaid: false };

  try {
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

    if (!convexUrl) {
      console.error("NEXT_PUBLIC_CONVEX_URL not found");
      return { isAuthenticated: false, isOnboarded: false, hasPaid: false };
    }

    // Make request to Convex HTTP API
    const response = await fetch(`${convexUrl}/api/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        path: "user:checkUserStatus",
        args: {},
        format: "json",
      }),
    });

    if (!response.ok) {
      serverLogger.error("system", "Failed to check user status", { status: response.status });
      return { isAuthenticated: false, isOnboarded: false, hasPaid: false };
    }

    const result = await response.json();

    // Handle the response format from your query
    if (result.status === "success") {
      return {
        isAuthenticated: result.value.isAuthenticated || false,
        isOnboarded: result.value.isOnboarded || false,
        hasPaid: result.value.hasPaid || false
      };
    }

    // If we get an error or unexpected response, assume the user needs everything
    return { isAuthenticated: false, isOnboarded: false, hasPaid: false };
  } catch (error) {
    serverLogger.error("system", "Error checking user status", { error });
    return { isAuthenticated: false, isOnboarded: false, hasPaid: false };
  }
}

export const config = {
  // The following matcher runs middleware on all routes
  // except static assets.
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};