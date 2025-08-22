"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { SignInWithGoogle } from "./SignInWithGoogle";

export default function Login() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-soft-lavender text-gray-900 p-6 font-sans">
      <div
        className={`w-full max-w-md rounded-lg shadow-xs bg-white p-8 transition-all duration-250 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
      >
        {/* Header */}
        <h1 className="text-3xl font-semibold text-deep-indigo tracking-tight text-center">
          Good to see you again! 👋
        </h1>
        <p className="mt-2 text-center text-gray-600">
          Sign in to continue your journey
        </p>

        {/* Google Login */}
        <div className="mt-8 flex flex-col space-y-4">
          <SignInWithGoogle />

          {/* Secondary link */}
          <Link
            href="/"
            className="text-sm text-deep-indigo hover:underline text-center"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
