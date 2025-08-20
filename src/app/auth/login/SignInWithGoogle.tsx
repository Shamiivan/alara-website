import { useSearchParams, useRouter } from "next/navigation";
import { useConvex, useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useEventLogger } from "@/lib/eventLogger";
import { Sign } from "crypto";

interface SignInWithGoogleProps {
  returnUrl?: string;
}
export function SignInWithGoogle({ returnUrl = "/dashboard" }: SignInWithGoogleProps) {
  const { signIn } = useAuthActions();
  const [isHovered, setIsHovered] = useState(false);
  const { info, error, logUserAction } = useEventLogger();

  const handleSignIn = async () => {
    try {
      info("auth", "Google sign-in initiated");
      logUserAction("Google sign-in button clicked", "auth");
      // check the return URL
      if (returnUrl !== '/dashboard') {
        localStorage.setItem('auth_returnTo', returnUrl);
      }
      await signIn("google",);
      info("auth", "Google sign-in completed successfully");
    } catch (signInError) {
      error("auth", "Google sign-in failed", {
        error: signInError instanceof Error ? signInError.message : String(signInError)
      }, true, "Sign in failed. Please try again.");
    }
  };

  return (
    <Button
      className={`flex items-center justify-center gap-3 w-full bg-white hover:bg-gray-50 text-gray-800 border-2 border-gray-300 shadow-sm hover:shadow-md hover:shadow-rose-500/20 transition-all duration-300 py-6 rounded-xl ${isHovered ? 'scale-[1.02]' : 'scale-100'}`}
      variant="outline"
      type="button"
      onClick={handleSignIn}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label="Sign in with Google"
    >
      <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
          <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" />
          <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z" />
          <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z" />
          <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z" />
        </g>
      </svg>
      <span className="text-base font-semibold text-gray-800">Continue with Google</span>
    </Button >
  );
}