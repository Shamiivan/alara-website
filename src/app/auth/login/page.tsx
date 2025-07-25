"use client"
import { useEffect } from "react";
import { SignInWithGoogle } from "./SignInWithGoogle";

const Login = () => {
  // Redirect to dashboard if already authenticated
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-indigo-600">Alara</h1>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your account to access your dashboard
          </p>
        </div>
        <SignInWithGoogle />
      </div>
    </div>
  );
};

export default Login;
