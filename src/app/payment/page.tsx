"use client";

import { useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Lock, Check } from "lucide-react";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

export default function PaymentPage() {
  const pay = useAction(api.stripe.pay);
  const [isLoading, setIsLoading] = useState(false);
  const [showError, setShowError] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check if payment was cancelled
    if (searchParams.get("payment") === "cancelled") {
      setShowError(true);
    }
  }, [searchParams]);

  const handlePay = async () => {
    try {
      setIsLoading(true);
      setShowError(false);

      // Get URL from pay action (using empty object to match API)
      const url = await pay({});
      if (!url) {
        console.error("No URL returned from pay action");
        setShowError(true);
        setIsLoading(false);
        return;
      }

      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (err) {
      console.error("Payment action failed:", err);
      setShowError(true);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-10 max-w-screen-sm">
        {/* Header */}
        <header className="flex justify-between items-center mb-12">
          <div className="font-semibold text-xl text-foreground">
            Alara
          </div>
          <div className="flex gap-6">
            <Link
              href="/faq"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              FAQ
            </Link>
            <Link
              href="/contact"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Contact
            </Link>
          </div>
        </header>

        {/* Hero */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold tracking-tight mb-3 text-foreground">
            Start your month for $10.
          </h1>
          <p className="text-base text-muted-foreground">
            One plan. Cancel anytime. Full refund if it&apos;s not for you.
          </p>
        </div>

        {/* Error Alert */}
        {showError && (
          <div className="mb-6">
            <Alert variant="destructive">
              <AlertTitle>Something went wrong</AlertTitle>
              <AlertDescription>
                We couldn&apos;t start checkout. Please try again.
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Plan Card */}
        <div className="transition-all duration-200">
          <Card className="border rounded-2xl shadow-lg/5">
            <CardHeader className="p-6">
              <div className="flex justify-between items-center">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-semibold text-foreground">$10</span>
                  <span className="text-muted-foreground">/&nbsp;month</span>
                </div>
                <Badge
                  className="rounded px-2 py-0.5 text-xs font-medium bg-amber-500 text-foreground"
                >
                  Pilot
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="p-6 pt-0">
              <ul className="space-y-4">
                <li className="flex items-start">
                  <Check size={18} className="mr-2 shrink-0 mt-0.5 text-emerald-500" />
                  <span className="text-sm text-muted-foreground">
                    One plan, no hidden fees
                  </span>
                </li>
                <li className="flex items-start">
                  <Check size={18} className="mr-2 shrink-0 mt-0.5 text-emerald-500" />
                  <span className="text-sm text-muted-foreground">
                    Cancel anytime
                  </span>
                </li>
                <li className="flex items-start">
                  <Check size={18} className="mr-2 shrink-0 mt-0.5 text-emerald-500" />
                  <span className="text-sm text-muted-foreground">
                    Full refund if not satisfied
                  </span>
                </li>
              </ul>
            </CardContent>

            <CardFooter className="flex flex-col p-6 gap-4">
              <Button
                className="w-full h-12 rounded-xl"
                disabled={isLoading}
                onClick={handlePay}
                aria-busy={isLoading ? "true" : "false"}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Taking you to checkout...
                  </span>
                ) : "Activate my plan"}
              </Button>

              <Link
                href="/faq"
                className="text-center text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                View FAQ
              </Link>

              <div className="text-xs flex items-center justify-center gap-2 mt-2 text-muted-foreground">
                <Lock size={14} />
                <span>Secure checkout by Stripe</span>
              </div>
            </CardFooter>
          </Card>
        </div>

        {/* Mini FAQ (Optional & Collapsible) */}
        <div className="mt-10">
          <Separator className="mb-6" />

          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-1 text-foreground">Cancel anytime?</h3>
              <p className="text-sm text-muted-foreground">Yes, one click.</p>
            </div>

            <div>
              <h3 className="font-medium mb-1 text-foreground">Refund?</h3>
              <p className="text-sm text-muted-foreground">Yes, full refund in the pilot.</p>
            </div>

            <div>
              <h3 className="font-medium mb-1 text-foreground">After pay?</h3>
              <p className="text-sm text-muted-foreground">Immediate setup, auto-redirect to app.</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 pt-6 border-t border-border">
          <div className="flex justify-center gap-6">
            <Link
              href="/terms"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Terms
            </Link>
            <Link
              href="/privacy"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/contact"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Contact
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
}