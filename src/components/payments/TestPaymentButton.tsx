"use client";

import { useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function PaymentButton() {
  const pay = useAction(api.stripe.pay);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const paymentId = useConsumeQueryParam("paymentId");
  const paymentStatus = useConsumeQueryParam("payment");

  useEffect(() => {
    // Handle payment cancelled
    if (paymentStatus === "cancelled") {
      // Could show a toast or message here
      console.log("Payment was cancelled");
    }
  }, [paymentStatus]);

  const handlePay = async () => {
    try {
      setIsLoading(true);
      const url = await pay({});
      if (!url) {
        console.error("No URL returned from pay action");
        setIsLoading(false);
        return;
      }
      // Redirect to Stripe Checkout
      window.location.assign(url);
    } catch (err) {
      console.error("Payment action failed:", err);
      setIsLoading(false);
    }
  };

  return (
    <button
      className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      onClick={handlePay}
      disabled={isLoading}
    >
      {isLoading ? (
        <span className="flex items-center justify-center">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Processing...
        </span>
      ) : (
        "Continue to Payment"
      )}
    </button>
  );
}



function useConsumeQueryParam(name: string) {
  const searchParams = useSearchParams();
  const [value] = useState(searchParams.get(name));

  useEffect(() => {
    if (typeof window !== 'undefined' && searchParams.has(name)) {
      const currUrl = new URL(window.location.href);
      const searchParams = currUrl.searchParams;
      searchParams.delete(name);
      const consumedUrl =
        currUrl.origin + currUrl.pathname + searchParams.toString();
      window.history.replaceState(null, "", consumedUrl)
    }
  }, []);
  return value;
}
