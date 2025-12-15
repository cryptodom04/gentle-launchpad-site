-- Create table to track processed transactions
CREATE TABLE public.processed_transactions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    signature TEXT NOT NULL UNIQUE,
    processed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.processed_transactions ENABLE ROW LEVEL SECURITY;

-- Allow edge functions to insert
CREATE POLICY "Service role can manage processed transactions" 
ON public.processed_transactions 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Auto-cleanup old records after 24 hours
CREATE OR REPLACE FUNCTION public.cleanup_old_transactions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.processed_transactions 
  WHERE processed_at < now() - interval '24 hours';
END;
$$;