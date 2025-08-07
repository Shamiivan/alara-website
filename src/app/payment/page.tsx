"use client";

import PaymentButton from "@/components/payments/TestPaymentButton";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function PaymentPage() {
  const searchParams = useSearchParams();
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    // Check if payment was cancelled
    if (searchParams.get("payment") === "cancelled") {
      setShowError(true);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-md mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Complete Your Setup</h1>
          <p className="mt-2 text-gray-600">
            You're almost there! Just one more step to unlock full access.
          </p>
        </div>

        {/* Payment Card */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Payment Error Alert */}
          {showError && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">
                    Your previous payment was cancelled. No worries, you can try again when you're ready.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Pricing Header */}
          <div className="bg-blue-600 px-6 py-8 text-center text-white">
            <h2 className="text-2xl font-bold">Try Alara Today</h2>
            <div className="mt-4 flex items-center justify-center">
              <span className="text-4xl font-extrabold">$8</span>
              <span className="ml-1 text-xl font-medium">CAD</span>
            </div>
            <p className="mt-2 text-blue-100">One-time payment for full access</p>
          </div>

          {/* Features */}
          <div className="px-6 py-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">What you'll get:</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700">Full access to Alara's features</span>
              </li>
              <li className="flex items-start">
                <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700">Try the product with no commitment</span>
              </li>
              <li className="flex items-start">
                <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700">Secure payment processing</span>
              </li>
            </ul>
          </div>

          {/* Payment Button */}
          <div className="px-6 py-6">
            <PaymentButton />
            <p className="mt-4 text-xs text-center text-gray-500">
              By proceeding, you agree to our Terms of Service and Privacy Policy.
              Your payment is processed securely through Stripe.
            </p>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Need help? <a href="#" className="text-blue-600 hover:underline">Contact our support team</a>
          </p>
        </div>
      </div>
    </div>
  );
}