/**
 * Get customer payment history
 * This function retrieves the payment history for a customer
 */
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { stripe } from '../_shared/stripe.ts';
import { supabaseAdmin } from '../_shared/supabase.ts';

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get customer ID from query parameters
    const url = new URL(req.url);
    const customerId = url.searchParams.get('customerId');

    if (!customerId) {
      return new Response(
        JSON.stringify({ error: 'Customer ID is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get customer invoices
    const invoices = await stripe.invoices.list({
      customer: customerId,
      limit: 10,
    });

    // Format payment history
    const payments = invoices.data.map((invoice) => ({
      id: invoice.id,
      amount: invoice.amount_paid,
      status: invoice.status,
      created: invoice.created,
      invoice_url: invoice.hosted_invoice_url,
      invoice_pdf: invoice.invoice_pdf,
      period_start: invoice.period_start,
      period_end: invoice.period_end,
    }));

    // Return payment history
    return new Response(
      JSON.stringify({ payments }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error getting payment history:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});