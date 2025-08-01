// app/test-pay.tsx or components/TestPay.tsx
"use client";

import { useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function TestPaymentButton() {
  const pay = useAction(api.stripe.pay);
  console.log(useConsumeQueryParam("paymentId"));



  const handlePay = async () => {
    try {
      const url = await pay({});
      if (!url) {
        console.error("No URL returned from pay action");
        return;
      }
      // Redirect to Stripe Checkout
      window.location.assign(url);
    } catch (err) {
      console.error("Payment action failed:", err);
    }
  };

  return (
    <button
      className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      onClick={handlePay}>
      Test One-Time Pay
    </ button>
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
