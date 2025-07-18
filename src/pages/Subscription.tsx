import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { createCheckoutSession, createCustomer, getSubscriptionStatus } from "@/lib/stripe";
import supabase from "@/lib/supabase";

const Subscription = () => {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      if (!user?.id) return;

      try {
        setIsLoading(true);

        // First check if we have a subscription record in the database
        const { data, error } = await supabase
          .from("subscriptions")
          .select("status, stripe_customer_id")
          .eq("user_id", user.id)
          .single();

        if (error && error.code !== "PGRST116") {
          // PGRST116 is the error code for "no rows returned"
          console.error("Error fetching subscription:", error);
          toast({
            title: "Error",
            description: "Failed to load subscription information. Please try again.",
            variant: "destructive",
          });
          return;
        }

        if (data) {
          setSubscriptionStatus(data.status);
        } else {
          setSubscriptionStatus("inactive");
        }
      } catch (error) {
        console.error("Error in subscription check:", error);
        toast({
          title: "Error",
          description: "Failed to check subscription status. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscriptionStatus();
  }, [user?.id]);

  const handleSubscribe = async () => {
    if (!user?.id || !user?.email) {
      toast({
        title: "Error",
        description: "You must be logged in to subscribe.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsProcessing(true);

      // Check if user already has a Stripe customer ID
      const { data: subscriptionData } = await supabase
        .from("subscriptions")
        .select("stripe_customer_id")
        .eq("user_id", user.id)
        .single();

      let customerId = subscriptionData?.stripe_customer_id;

      // If not, create a new Stripe customer
      if (!customerId) {
        customerId = await createCustomer(
          user.email,
          profile?.full_name || undefined
        );

        // Save the customer ID to the database
        await supabase.from("subscriptions").insert({
          user_id: user.id,
          stripe_customer_id: customerId,
          status: "incomplete",
        });
      }

      // Create a checkout session
      const sessionId = await createCheckoutSession(
        customerId,
        `${window.location.origin}/subscription?success=true`,
        `${window.location.origin}/subscription?canceled=true`
      );

      // Redirect to Stripe Checkout
      window.location.href = `https://checkout.stripe.com/c/pay/${sessionId}`;
    } catch (error) {
      console.error("Error creating subscription:", error);
      toast({
        title: "Error",
        description: "Failed to start subscription process. Please try again.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  const handleManageSubscription = async () => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to manage your subscription.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsProcessing(true);

      // Get the customer portal URL from the backend
      const response = await fetch("/functions/create-customer-portal-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create customer portal session");
      }

      const data = await response.json();

      // Redirect to the customer portal
      window.location.href = data.url;
    } catch (error) {
      console.error("Error accessing customer portal:", error);
      toast({
        title: "Error",
        description: "Failed to access subscription management. Please try again.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  // Handle success and canceled query parameters
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const success = queryParams.get("success");
    const canceled = queryParams.get("canceled");

    if (success === "true") {
      toast({
        title: "Success!",
        description: "Your subscription has been activated. Welcome to Alara Premium!",
        variant: "default",
      });

      // Remove query parameters
      navigate("/subscription", { replace: true });

      // Refresh subscription status
      setIsLoading(true);
      setTimeout(() => {
        refreshProfile();
        setIsLoading(false);
      }, 2000);
    } else if (canceled === "true") {
      toast({
        title: "Subscription Canceled",
        description: "Your subscription process was canceled. No charges were made.",
        variant: "default",
      });

      // Remove query parameters
      navigate("/subscription", { replace: true });
    }
  }, [navigate, refreshProfile]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Alara Premium</h1>
          <p className="mt-2 text-lg text-gray-600">
            Unlock premium features and support our development
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Free Plan */}
          <Card>
            <CardHeader>
              <CardTitle>Free Plan</CardTitle>
              <CardDescription>Basic access to Alara</CardDescription>
              <div className="mt-4">
                <span className="text-3xl font-bold">$0</span>
                <span className="text-gray-500 ml-2">/ month</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <span>Basic profile management</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <span>Limited content access</span>
                </li>
                <li className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-gray-300 mr-2" />
                  <span className="text-gray-500">Premium dashboard</span>
                </li>
                <li className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-gray-300 mr-2" />
                  <span className="text-gray-500">Priority support</span>
                </li>
                <li className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-gray-300 mr-2" />
                  <span className="text-gray-500">Advanced features</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" disabled>
                Current Plan
              </Button>
            </CardFooter>
          </Card>

          {/* Premium Plan */}
          <Card className="border-indigo-200 bg-indigo-50">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Premium Plan</CardTitle>
                  <CardDescription>Full access to Alara</CardDescription>
                </div>
                <div className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-xs font-medium">
                  Recommended
                </div>
              </div>
              <div className="mt-4">
                <span className="text-3xl font-bold">$9</span>
                <span className="text-gray-500 ml-2">/ month</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <span>Everything in Free</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <span>Premium dashboard</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <span>Priority support</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <span>Advanced features</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <span>Early access to new features</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              {subscriptionStatus === "active" ? (
                <Button
                  variant="default"
                  className="w-full bg-indigo-600 hover:bg-indigo-700"
                  onClick={handleManageSubscription}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Manage Subscription"
                  )}
                </Button>
              ) : (
                <Button
                  variant="default"
                  className="w-full bg-indigo-600 hover:bg-indigo-700"
                  onClick={handleSubscribe}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Subscribe Now"
                  )}
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>

        <div className="mt-12 bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900">What's included in the Premium plan?</h3>
              <p className="mt-1 text-gray-600">
                Premium subscribers get access to all features, priority support, and early access to new features as they're developed.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Can I cancel anytime?</h3>
              <p className="mt-1 text-gray-600">
                Yes, you can cancel your subscription at any time. Your premium access will continue until the end of your current billing period.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">How do I manage my subscription?</h3>
              <p className="mt-1 text-gray-600">
                You can manage your subscription from your profile page or the subscription page. You can update payment methods, cancel, or change your plan.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Is there a free trial?</h3>
              <p className="mt-1 text-gray-600">
                We don't currently offer a free trial, but you can use the basic features with a free account to get a feel for the platform.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subscription;