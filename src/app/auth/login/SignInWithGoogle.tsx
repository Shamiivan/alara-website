import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { useEventLogger } from "@/lib/eventLogger";
import { PrimaryButton } from "@/components/ui/CustomButton";

interface SignInWithGoogleProps {
  returnUrl?: string;
  onError?: (message: string) => void;
}

export function SignInWithGoogle({ returnUrl = "/dashboard", onError }: SignInWithGoogleProps) {
  const { signIn } = useAuthActions();
  const [isHovered, setIsHovered] = useState(false);
  const { info, error: logError, logUserAction } = useEventLogger();

  const handleSignIn = async () => {
    try {
      info("auth", "Google sign-in initiated");
      logUserAction("Google sign-in button clicked", "auth");
      // check the return URL
      if (returnUrl !== '/dashboard') {
        localStorage.setItem('auth_returnTo', returnUrl);
      }
      await signIn("google", { redirectTo: returnUrl });
      info("auth", "Google sign-in completed successfully");
    } catch (signInError) {
      const errorMessage = signInError instanceof Error ? signInError.message : String(signInError);
      logError("auth", "Google sign-in failed", {
        error: errorMessage
      }, true, "Sign in failed. Please try again.");

      // Call the onError prop if provided
      if (onError) {
        onError("Sign in failed. Please try again.");
      }
    }
  };

  return (

    <PrimaryButton
      className={`flex items-center justify-center gap-3 w-full bg-white hover:bg-gray-50 text-white border border-gray-200 shadow-sm transition-all duration-250 py-3 rounded-md ${isHovered ? 'bg-white translate-y-[-1px]' : ''}`}
      type="button"
      hint="Let’s make today a little lighter, together."
      onClick={handleSignIn}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label="Sign in with Google"
    >
      <span className="text-base font-medium text-gray-white">Continue with Google</span>
    </PrimaryButton>
  );
}