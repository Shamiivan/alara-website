-- Create payment_history table
-- This table stores information about user payment history
CREATE TABLE IF NOT EXISTS public.payment_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  stripe_invoice_id TEXT,
  amount INTEGER,
  status TEXT,
  invoice_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.payment_history ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Users can view their own payment history
CREATE POLICY "Users can view own payment history"
  ON public.payment_history
  FOR SELECT
  USING (auth.uid() = user_id);

-- Only service role can insert/update/delete payment history
CREATE POLICY "Service role can manage payment history"
  ON public.payment_history
  USING (auth.role() = 'service_role');

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS payment_history_user_id_idx ON public.payment_history (user_id);
CREATE INDEX IF NOT EXISTS payment_history_stripe_invoice_id_idx ON public.payment_history (stripe_invoice_id);
CREATE INDEX IF NOT EXISTS payment_history_created_at_idx ON public.payment_history (created_at);

-- Add comment to table
COMMENT ON TABLE public.payment_history IS 'User payment history from Stripe';