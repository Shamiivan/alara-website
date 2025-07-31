// app/test-pay.tsx or components/TestPay.tsx
"use client";

import { useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";

export default function TestPayButton() {
  const pay = useAction(api.stripe.pay);

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
