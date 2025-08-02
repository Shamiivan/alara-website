import { convexAuthNextjsMiddleware } from "@convex-dev/auth/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

// Public routes that don't require authentication
const publicRoutes = [
  "/",
  "/auth/login",
  "/calls",
  "/api/calls"
];

// Routes that require authentication
const protectedRoutes = [
  "/dashboard",
  "/onboarding",
  "/payment"
];

// Routes that require onboarding to be completed
const requiresOnboarding = [
  "/dashboard",
  "/payment"
];

// Routes that require payment to be completed
const requiresPayment = [
  "/dashboard"
];

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

  // If it's a public route, continue
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // If it's not a protected route, continue
  if (!protectedRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  try {
    // Check authentication status
    let isAuthenticated = false;

    try {
      isAuthenticated = await convexAuth.isAuthenticated();
    } catch (authError) {
      console.error("Error checking authentication:", authError);
      // If we can't check auth status, redirect to login for safety
      const loginUrl = new URL("/auth/login", request.url);
      return NextResponse.redirect(loginUrl);
    }

    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      const loginUrl = new URL("/auth/login", request.url);
      return NextResponse.redirect(loginUrl);
    }

    // Get token for user status check
    let token;
    try {
      token = await convexAuth.getToken();
    } catch (tokenError) {
      console.error("Error getting token:", tokenError);
      const loginUrl = new URL("/auth/login", request.url);
      return NextResponse.redirect(loginUrl);
    }

    // Check complete user status (auth, onboarding, payment)
    const userStatus = await checkUserStatus(token);

    // If route requires onboarding and user is not onboarded, redirect to onboarding
    if (requiresOnboarding.includes(pathname) && !userStatus.isOnboarded) {
      const onboardingUrl = new URL("/onboarding", request.url);
      return NextResponse.redirect(onboardingUrl);
    }

    // Special case: Allow access to dashboard if coming from successful payment
    // This gives the webhook time to process the payment
    if (pathname === '/dashboard' && isPaymentSuccess && paymentId) {
      console.log('Allowing dashboard access after successful payment');
      return NextResponse.next();
    }

    // If route requires payment and user has not paid, redirect to payment
    if (requiresPayment.includes(pathname) && !userStatus.hasPaid) {
      const paymentUrl = new URL("/payment", request.url);
      return NextResponse.redirect(paymentUrl);
    }

    // User meets all requirements for the route
    return NextResponse.next();

  } catch (error) {
    console.error("Middleware error:", error);
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
      console.error("Failed to check user status:", response.status);
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
    console.error("[Middleware Call to the backend]", error);
    return { isAuthenticated: false, isOnboarded: false, hasPaid: false };
  }
}

export const config = {
  // The following matcher runs middleware on all routes
  // except static assets.
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};