import { convexAuthNextjsMiddleware } from "@convex-dev/auth/nextjs/server";
import { NextRequest } from "next/server";
import path from "path";

// defining multiple routs 
const publicRoutes = [
  "/",
  "auth/login"
];

// define routes that dont require onboarding 
const onboardingExemptRoutes = [
  "/onboarding",
]
export default convexAuthNextjsMiddleware(async (request: NextRequest, { convexAuth }) => {
  const { pathname } = request.nextUrl;
  const isStaticFile = pathname.startsWith("/_next/")

  if (isStaticFile) {
    console.log("routes should be statid")
  }
});

export const config = {
  // The following matcher runs middleware on all routes
  // except static assets.
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};