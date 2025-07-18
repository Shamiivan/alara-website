import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

// Environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// Validation
if (!supabaseUrl) {
  console.error('Missing environment variable: VITE_SUPABASE_URL');
}

if (!supabaseAnonKey) {
  console.error('Missing environment variable: VITE_SUPABASE_ANON_KEY');
}

// Configuration options
const supabaseOptions = {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'x-application-name': 'alara-website'
    }
  }
};

// Create Supabase client
let supabaseInstance: SupabaseClient<Database> | null = null;

/**
 * Get the Supabase client instance
 * Creates a new instance if one doesn't exist
 */
export const getSupabase = (): SupabaseClient<Database> => {
  if (!supabaseInstance) {
    supabaseInstance = createClient<Database>(
      supabaseUrl,
      supabaseAnonKey,
      supabaseOptions
    );
  }
  return supabaseInstance;
};

/**
 * Get a fresh Supabase client (not using the singleton)
 * Useful for server-side operations or when you need a clean instance
 */
export const getFreshSupabaseClient = (): SupabaseClient<Database> => {
  return createClient<Database>(supabaseUrl, supabaseAnonKey, supabaseOptions);
};

/**
 * Reset the Supabase client instance
 * Useful after logout or when switching users
 */
export const resetSupabaseClient = (): void => {
  supabaseInstance = null;
};

// Default export for convenience
const supabase = getSupabase();
export default supabase;