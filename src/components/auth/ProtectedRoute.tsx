import { ReactNode, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import supabase from "@/lib/supabase";

interface ProtectedRouteProps {
  children: ReactNode;
  requireSubscription?: boolean;
}

/**
 * A wrapper component that protects routes from unauthenticated users
 * Optionally can require an active subscription
 */
const ProtectedRoute = ({
  children,
  requireSubscription = false
}: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, user, profile } = useAuth();
  const location = useLocation();
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [isCheckingSubscription, setIsCheckingSubscription] = useState(false);

  // Check if user has an active subscription from the database
  useEffect(() => {
    const checkSubscription = async () => {
      if (!user?.id || !requireSubscription) return;

      try {
        setIsCheckingSubscription(true);

        // Check the subscriptions table for an active subscription
        const { data, error } = await supabase
          .from("subscriptions")
          .select("status")
          .eq("user_id", user.id)
          .eq("status", "active")
          .single();

        if (error && error.code !== "PGRST116") {
          console.error("Error checking subscription:", error);
          return;
        }

        setHasActiveSubscription(!!data);
      } catch (error) {
        console.error("Error in subscription check:", error);
      } finally {
        setIsCheckingSubscription(false);
      }
    };

    checkSubscription();
  }, [user?.id, requireSubscription]);

  // Show loading state while checking authentication or subscription
  if (isLoading || (requireSubscription && isCheckingSubscription)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mb-4" />
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // If subscription is required but user doesn't have one, redirect to subscription page
  if (requireSubscription && !hasActiveSubscription) {
    return <Navigate to="/subscription" state={{ from: location }} replace />;
  }

  // If authenticated (and has subscription if required), render the children
  return <>{children}</>;
};

export default ProtectedRoute;