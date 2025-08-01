import { convexAuthNextjsMiddleware } from "@convex-dev/auth/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

// defining multiple routes 
const publicRoutes = [
  "/",
  "/auth/login",
  "/calls",
  "/api/calls",
  "/hi-mom", // Added hi-mom page to public routes
  "/onboarding" // Added onboarding page to public routes for testing
];

const privateRoutes = [
  "/hi-mom",
  "/onboarding",
  "/payment"
];

const routeNeedsOnboarding = [
  "/hi-mom",
  "/payment"
];

// define routes that dont require onboarding 
const onboardingExemptRoutes = [
  "/onboarding",
  "/auth/login",
  "/calls",
  "/api/calls",
  "/",
  "/hi-mom"
];

export default convexAuthNextjsMiddleware(async (request: NextRequest, { convexAuth }) => {
  const { pathname } = request.nextUrl;

  // Check for static files first
  const isStaticFile = pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.includes(".");

  if (isStaticFile) {
    return NextResponse.next();
  }

  // if its a public route, continue
  if (!privateRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  try {
    // Add more detailed error handling around isAuthenticated
    let isAuthenticated = false;

    try {
      isAuthenticated = await convexAuth.isAuthenticated();
    } catch (authError) {
      console.error("Error checking authentication:", authError);
      // If we can't check auth status, redirect to login for safety
      const loginUrl = new URL("/auth/login", request.url);
      return NextResponse.redirect(loginUrl);
    }

    // if the user is not authenticated and its not a public route, redirect to login
    if (!isAuthenticated) {
      const loginUrl = new URL("/auth/login", request.url);
      return NextResponse.redirect(loginUrl);
    }

    // if the user is authenticated, but not onboarded and its onboard exempt route, continue
    if (!routeNeedsOnboarding.includes(pathname)) {
      return NextResponse.next();
    }

    // Check onboarding status
    let token;
    try {
      token = await convexAuth.getToken();
    } catch (tokenError) {
      console.error("Error getting token:", tokenError);
      // If we can't get token, redirect to login
      const loginUrl = new URL("/auth/login", request.url);
      return NextResponse.redirect(loginUrl);
    }

    const userOnboarded = await isUserOnboarded(token);
    console.log("Middleware.ts] User is Onobaorde?", userOnboarded);

    // if the user is auth, not onboarded and its an onboard needed route, redirect
    if (!userOnboarded) {
      const onboardingUrl = new URL("/onboarding", request.url);
      return NextResponse.redirect(onboardingUrl);
    }

    // user is authenticated and onboarded 
    return NextResponse.next();

  } catch (error) {
    console.error("Middleware error:", error);
    // On any error, redirect to login for safety
    const loginUrl = new URL("/auth/login", request.url);
    return NextResponse.redirect(loginUrl);
  }
});

async function isUserOnboarded(token?: string): Promise<boolean> {
  console.error("[Middleware.ts]  We are getting the token", token);
  if (!token) return false;

  try {
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

    if (!convexUrl) {
      console.error("NEXT_PUBLIC_CONVEX_URL not found");
      return false; // Assume needs onboarding 
    }

    // Make request to Convex HTTP API
    const response = await fetch(`${convexUrl}/api/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        path: "user:isUserOnboarded",
        args: {},
        format: "json",
      }),
    });

    console.log("RESPONSE", response.ok);
    if (!response.ok) {
      console.error("Failed to check onboarding status:", response.status);
      return false; // Changed: assume needs onboarding if request fails
    }

    const result = await response.json();
    console.log("RESULT: ", result);

    // Handle the response format from your query
    if (result.status === "success") {
      const { isUserOnboarded } = result.value;
      return Boolean(isUserOnboarded); // Ensure boolean return
    }

    // If we get an error or unexpected response, assume the user needs onboarding 
    return false;
  } catch (error) {
    console.error("[Middleware Call to the backend]", error);
    return false;
  }
}

export const config = {
  // The following matcher runs middleware on all routes
  // except static assets.
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};