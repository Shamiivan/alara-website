/**
 * Stripe configuration for Supabase Edge Functions
 */
import Stripe from 'stripe';

// Initialize Stripe with the secret key from environment variables
export const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16', // Use the latest API version
  httpClient: Stripe.createFetchHttpClient(),
});

// Get the Stripe price ID for the monthly subscription
export const STRIPE_PRICE_ID = Deno.env.get('STRIPE_PRICE_ID') || '';

// Get the Stripe webhook secret for verifying webhook events
export const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET') || '';

// Validate environment variables
if (!Deno.env.get('STRIPE_SECRET_KEY')) {
  console.error('Missing environment variable: STRIPE_SECRET_KEY');
}

if (!STRIPE_PRICE_ID) {
  console.error('Missing environment variable: STRIPE_PRICE_ID');
}

if (!STRIPE_WEBHOOK_SECRET) {
  console.error('Missing environment variable: STRIPE_WEBHOOK_SECRET');
}