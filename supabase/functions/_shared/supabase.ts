/**
 * Supabase client configuration for Edge Functions
 */
import { createClient } from 'supabase';

// Create a Supabase client with the service role key for admin access
export const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
  {
    auth: {
      persistSession: false,
    },
  }
);

// Validate environment variables
if (!Deno.env.get('SUPABASE_URL')) {
  console.error('Missing environment variable: SUPABASE_URL');
}

if (!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')) {
  console.error('Missing environment variable: SUPABASE_SERVICE_ROLE_KEY');
}