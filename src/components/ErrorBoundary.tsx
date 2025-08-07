"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { eventLogger } from "@/lib/eventLogger";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  category?: "auth" | "onboarding" | "payment" | "calls" | "api" | "system";
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error using our event logger
    eventLogger.logJSError(error, this.props.category || "system", {
      errorInfo: {
        componentStack: errorInfo.componentStack,
        errorBoundary: this.constructor.name,
      },
      location: typeof window !== "undefined" ? window.location.href : "unknown",
    });
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-[200px] flex flex-col items-center justify-center p-8 text-center">
          <div className="mb-4 text-red-500">
            <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-6 max-w-md">
            We encountered an unexpected error. Don&apos;t worry - we&apos;ve been notified and are working to fix it.
          </p>
          <div className="space-y-2">
            <button
              onClick={this.handleRetry}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Try Again
            </button>
            <p className="text-sm text-gray-500">
              If the problem persists, please refresh the page or contact support.
            </p>
          </div>

          {/* Show error details in development */}
          {process.env.NODE_ENV === "development" && this.state.error && (
            <details className="mt-6 max-w-2xl">
              <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                Show error details (development only)
              </summary>
              <pre className="mt-2 text-xs text-left bg-gray-100 p-4 rounded overflow-auto">
                {this.state.error.stack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for wrapping components with error boundaries
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  category?: Props["category"],
  fallback?: ReactNode
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary category={category} fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
}

// Specialized error boundaries for different sections
export const AuthErrorBoundary = ({ children }: { children: ReactNode }) => (
  <ErrorBoundary
    category="auth"
    fallback={
      <div className="min-h-[300px] flex items-center justify-center">
        <div className="text-center p-8">
          <h2 className="text-xl font-semibold mb-2">Authentication Error</h2>
          <p className="text-gray-600 mb-4">
            There was a problem with the authentication system.
          </p>
          <a
            href="/auth/login"
            className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Back to Login
          </a>
        </div>
      </div>
    }
  >
    {children}
  </ErrorBoundary>
);

export const OnboardingErrorBoundary = ({ children }: { children: ReactNode }) => (
  <ErrorBoundary
    category="onboarding"
    fallback={
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center p-8">
          <h2 className="text-xl font-semibold mb-2">Onboarding Error</h2>
          <p className="text-gray-600 mb-4">
            There was a problem with the onboarding process.
          </p>
          <a
            href="/onboarding"
            className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Restart Onboarding
          </a>
        </div>
      </div>
    }
  >
    {children}
  </ErrorBoundary>
);

export const PaymentErrorBoundary = ({ children }: { children: ReactNode }) => (
  <ErrorBoundary
    category="payment"
    fallback={
      <div className="min-h-[300px] flex items-center justify-center">
        <div className="text-center p-8">
          <h2 className="text-xl font-semibold mb-2">Payment Error</h2>
          <p className="text-gray-600 mb-4">
            There was a problem processing your payment.
          </p>
          <a
            href="/payment"
            className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Try Payment Again
          </a>
        </div>
      </div>
    }
  >
    {children}
  </ErrorBoundary>
);