"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useConvex, useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { SignInWithGoogle } from "./SignInWithGoogle";
import Link from "next/link";

export default function Login() {
  const [mounted, setMounted] = useState(false);

  // Handle mounting for animations
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 sm:p-6 lg:p-8">
      <div
        className={`w-full max-w-md space-y-8 transition-all duration-500 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
      >
        {/* Logo and Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="relative w-16 h-16 mb-2">
              <div className="absolute inset-0 bg-primary/10 rounded-full animate-pulse"></div>
              <div className="absolute inset-2 bg-primary/20 rounded-full"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  className="w-8 h-8 text-primary"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                  />
                </svg>
              </div>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-primary">Alara</h1>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">
            Your voice-first productivity platform. Sign in to continue your journey.
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-card rounded-xl shadow-sm border border-border p-6 space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-card-foreground">Welcome back</h2>
            <p className="text-sm text-muted-foreground">
              Sign in to access your personalized voice workspace
            </p>
          </div>

          {/* Voice-first element */}
          <div className="bg-[hsl(var(--voice-bg))] rounded-lg p-4 border border-primary/10">
            <div className="bubble-ai mb-2">
              &quot;Welcome back! Ready to be productive today?&quot;
            </div>
            <div className="flex items-center justify-center mt-4">
              <div className="h-1 w-16 bg-primary/30 rounded-full animate-pulse"></div>
            </div>
          </div>

          {/* Sign-in options */}
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-card text-muted-foreground">Sign in with</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <SignInWithGoogle returnUrl="/dashboard" />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground">
          <p>
            Don&apos;t have an account?{" "}
            <Link href="#" className="text-primary hover:underline transition-all">
              Contact us
            </Link>
          </p>
          <p className="mt-2">
            &copy; {new Date().getFullYear()} Alara. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
