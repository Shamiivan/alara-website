/**
 * Handle Stripe webhook events
 * This function processes Stripe webhook events and updates the database accordingly
 */
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { stripe, STRIPE_WEBHOOK_SECRET } from '../_shared/stripe.ts';
import { supabaseAdmin } from '../_shared/supabase.ts';

serve(async (req) => {
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return new Response(
      JSON.stringify({ error: 'Missing stripe-signature header' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  try {
    // Get request body as text
    const body = await req.text();

    // Verify webhook signature
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      STRIPE_WEBHOOK_SECRET
    );

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object);
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object);
        break;
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Return success
    return new Response(
      JSON.stringify({ received: true }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error handling webhook:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
});

/**
 * Handle checkout.session.completed event
 */
async function handleCheckoutSessionCompleted(session: any) {
  // Get subscription ID from session
  const subscriptionId = session.subscription;

  if (!subscriptionId) {
    console.log('No subscription ID in session');
    return;
  }

  // Get subscription details
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  // Get customer ID
  const customerId = subscription.customer as string;

  // Update subscription in database
  const { data: userData, error: userError } = await supabaseAdmin
    .from('subscriptions')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (userError) {
    console.error('Error getting user ID from database:', userError);
    return;
  }

  const userId = userData.user_id;

  // Update or insert subscription record
  const { error: subscriptionError } = await supabaseAdmin
    .from('subscriptions')
    .upsert({
      user_id: userId,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
      status: subscription.status,
      price_id: subscription.items.data[0].price.id,
      quantity: subscription.items.data[0].quantity,
      cancel_at_period_end: subscription.cancel_at_period_end,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

  if (subscriptionError) {
    console.error('Error updating subscription in database:', subscriptionError);
  }
}

/**
 * Handle customer.subscription.created event
 */
async function handleSubscriptionCreated(subscription: any) {
  // Similar to handleCheckoutSessionCompleted but with subscription object directly
  const customerId = subscription.customer as string;
  const subscriptionId = subscription.id;

  // Get user ID from database
  const { data: userData, error: userError } = await supabaseAdmin
    .from('subscriptions')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (userError) {
    console.error('Error getting user ID from database:', userError);
    return;
  }

  const userId = userData.user_id;

  // Update subscription in database
  const { error: subscriptionError } = await supabaseAdmin
    .from('subscriptions')
    .upsert({
      user_id: userId,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
      status: subscription.status,
      price_id: subscription.items.data[0].price.id,
      quantity: subscription.items.data[0].quantity,
      cancel_at_period_end: subscription.cancel_at_period_end,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

  if (subscriptionError) {
    console.error('Error updating subscription in database:', subscriptionError);
  }
}

/**
 * Handle customer.subscription.updated event
 */
async function handleSubscriptionUpdated(subscription: any) {
  const subscriptionId = subscription.id;

  // Update subscription in database
  const { error: subscriptionError } = await supabaseAdmin
    .from('subscriptions')
    .update({
      status: subscription.status,
      price_id: subscription.items.data[0].price.id,
      quantity: subscription.items.data[0].quantity,
      cancel_at_period_end: subscription.cancel_at_period_end,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscriptionId);

  if (subscriptionError) {
    console.error('Error updating subscription in database:', subscriptionError);
  }
}

/**
 * Handle customer.subscription.deleted event
 */
async function handleSubscriptionDeleted(subscription: any) {
  const subscriptionId = subscription.id;

  // Update subscription in database
  const { error: subscriptionError } = await supabaseAdmin
    .from('subscriptions')
    .update({
      status: 'canceled',
      cancel_at_period_end: false,
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscriptionId);

  if (subscriptionError) {
    console.error('Error updating subscription in database:', subscriptionError);
  }
}

/**
 * Handle invoice.payment_succeeded event
 */
async function handleInvoicePaymentSucceeded(invoice: any) {
  const customerId = invoice.customer as string;

  // Get user ID from database
  const { data: userData, error: userError } = await supabaseAdmin
    .from('subscriptions')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (userError) {
    console.error('Error getting user ID from database:', userError);
    return;
  }

  const userId = userData.user_id;

  // Add payment to history
  const { error: paymentError } = await supabaseAdmin
    .from('payment_history')
    .insert({
      user_id: userId,
      stripe_invoice_id: invoice.id,
      amount: invoice.amount_paid,
      status: invoice.status,
      invoice_url: invoice.hosted_invoice_url,
      created_at: new Date().toISOString(),
    });

  if (paymentError) {
    console.error('Error adding payment to history:', paymentError);
  }
}

/**
 * Handle invoice.payment_failed event
 */
async function handleInvoicePaymentFailed(invoice: any) {
  const customerId = invoice.customer as string;
  const subscriptionId = invoice.subscription;

  if (subscriptionId) {
    // Update subscription status in database
    const { error: subscriptionError } = await supabaseAdmin
      .from('subscriptions')
      .update({
        status: 'past_due',
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', subscriptionId);

    if (subscriptionError) {
      console.error('Error updating subscription in database:', subscriptionError);
    }
  }

  // Get user ID from database
  const { data: userData, error: userError } = await supabaseAdmin
    .from('subscriptions')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (userError) {
    console.error('Error getting user ID from database:', userError);
    return;
  }

  const userId = userData.user_id;

  // Add failed payment to history
  const { error: paymentError } = await supabaseAdmin
    .from('payment_history')
    .insert({
      user_id: userId,
      stripe_invoice_id: invoice.id,
      amount: invoice.amount_due,
      status: 'failed',
      invoice_url: invoice.hosted_invoice_url,
      created_at: new Date().toISOString(),
    });

  if (paymentError) {
    console.error('Error adding payment to history:', paymentError);
  }
}