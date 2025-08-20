"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { LogoutButton } from "@/components/auth/LogoutButton";

// Add CSS for animations
const styles = {
  '@keyframes fadeIn': {
    '0%': { opacity: 0, transform: 'translateY(-10px)' },
    '100%': { opacity: 1, transform: 'translateY(0)' }
  },
  animateFadeIn: {
    animation: 'fadeIn 0.5s ease-out forwards'
  }
};

export default function Dashboard() {
  const user = useQuery(api.user.getCurrentUser);
  const userStatus = useQuery(api.user.checkUserStatus);
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);

  // Debug logging
  useEffect(() => {
    // Check for payment success parameter
    const paymentStatus = searchParams.get('payment');
    const paymentId = searchParams.get('paymentId');

    if (paymentStatus === 'success') {
      console.log("Dashboard - Payment success detected", {
        paymentId,
        userStatus: userStatus || "loading",
        user: user ? { id: user._id, isOnboarded: user.isOnboarded, hasPaid: user.hasPaid } : "loading"
      });

      setShowPaymentSuccess(true);

      // Hide the success message after 5 seconds
      const timer = setTimeout(() => {
        setShowPaymentSuccess(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [searchParams, user, userStatus]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Payment Success Message */}
      {showPaymentSuccess && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 fixed top-4 right-4 z-50 shadow-md rounded-md max-w-md" style={styles.animateFadeIn}>
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm leading-5 font-medium text-green-800">
                Payment successful! Your account is now active.
              </p>
            </div>
            <div className="ml-auto pl-3">
              <div className="-mx-1.5 -my-1.5">
                <button
                  onClick={() => setShowPaymentSuccess(false)}
                  className="inline-flex rounded-md p-1.5 text-green-500 hover:bg-green-100 focus:outline-none"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header with user info */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold">Welcome back, {user?.name || "there"}!</h1>
            <LogoutButton variant="subtle" />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Quick Stats Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Your Activity</h2>
            <p className="text-gray-600">You&apos;re all set up and ready to use Alara!</p>
            <div className="mt-4 p-4 bg-blue-50 rounded-md">
              <p className="text-sm text-blue-700">
                Your preferred call time: <span className="font-medium">{user?.callTime || "Not set"}</span>
              </p>
            </div>
          </div>

          {/* Actions Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <button className="w-full bg-blue-600 text-white py-2 px-4 rounded mb-3 hover:bg-blue-700 transition-colors">
              Start Using Alara
            </button>
            <button className="w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-50 transition-colors">
              Update Preferences
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}