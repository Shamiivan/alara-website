/**
 * Stripe client configuration and helper functions
 * This file provides utilities for interacting with the Stripe API
 */

// Environment variables
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string;
const STRIPE_PRICE_ID = import.meta.env.VITE_STRIPE_PRICE_ID as string;

// Validation
if (!STRIPE_PUBLISHABLE_KEY) {
  console.error('Missing environment variable: VITE_STRIPE_PUBLISHABLE_KEY');
}

if (!STRIPE_PRICE_ID) {
  console.error('Missing environment variable: VITE_STRIPE_PRICE_ID');
}

/**
 * Get the Stripe publishable key
 * @returns The Stripe publishable key from environment variables
 */
export const getStripePublishableKey = (): string => {
  return STRIPE_PUBLISHABLE_KEY;
};

/**
 * Get the Stripe price ID for the monthly subscription
 * @returns The Stripe price ID from environment variables
 */
export const getStripePriceId = (): string => {
  return STRIPE_PRICE_ID;
};

/**
 * Create a Stripe checkout session for subscription
 * @param customerId - The Stripe customer ID
 * @param successUrl - URL to redirect after successful payment
 * @param cancelUrl - URL to redirect after cancelled payment
 * @returns The checkout session ID
 */
export const createCheckoutSession = async (
  customerId: string,
  successUrl: string,
  cancelUrl: string
): Promise<string> => {
  try {
    const response = await fetch('/functions/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customerId,
        priceId: STRIPE_PRICE_ID,
        successUrl,
        cancelUrl,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create checkout session');
    }

    const data = await response.json();
    return data.sessionId;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
};

/**
 * Create a Stripe customer
 * @param email - Customer email
 * @param name - Customer name
 * @returns The Stripe customer ID
 */
export const createCustomer = async (
  email: string,
  name?: string
): Promise<string> => {
  try {
    const response = await fetch('/functions/create-customer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        name,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create customer');
    }

    const data = await response.json();
    return data.customerId;
  } catch (error) {
    console.error('Error creating customer:', error);
    throw error;
  }
};

/**
 * Get customer subscription status
 * @param customerId - The Stripe customer ID
 * @returns The subscription status
 */
export const getSubscriptionStatus = async (
  customerId: string
): Promise<string> => {
  try {
    const response = await fetch(`/functions/subscription-status?customerId=${customerId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get subscription status');
    }

    const data = await response.json();
    return data.status;
  } catch (error) {
    console.error('Error getting subscription status:', error);
    throw error;
  }
};

/**
 * Cancel a subscription
 * @param subscriptionId - The Stripe subscription ID
 * @returns Success status
 */
export const cancelSubscription = async (
  subscriptionId: string
): Promise<boolean> => {
  try {
    const response = await fetch('/functions/cancel-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subscriptionId,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to cancel subscription');
    }

    return true;
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    throw error;
  }
};

/**
 * Get customer payment history
 * @param customerId - The Stripe customer ID
 * @returns Array of payment history items
 */
export const getPaymentHistory = async (
  customerId: string
): Promise<any[]> => {
  try {
    const response = await fetch(`/functions/payment-history?customerId=${customerId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get payment history');
    }

    const data = await response.json();
    return data.payments;
  } catch (error) {
    console.error('Error getting payment history:', error);
    throw error;
  }
};

export default {
  getStripePublishableKey,
  getStripePriceId,
  createCheckoutSession,
  createCustomer,
  getSubscriptionStatus,
  cancelSubscription,
  getPaymentHistory,
};