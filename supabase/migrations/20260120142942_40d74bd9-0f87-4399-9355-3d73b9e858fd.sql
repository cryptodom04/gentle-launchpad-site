-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Service role can manage workers" ON public.workers;
DROP POLICY IF EXISTS "Service role can manage conversations" ON public.conversations;
DROP POLICY IF EXISTS "Service role can manage messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Service role can manage page_visits" ON public.page_visits;
DROP POLICY IF EXISTS "Service role can manage worker_domains" ON public.worker_domains;
DROP POLICY IF EXISTS "Service role can manage profits" ON public.profits;
DROP POLICY IF EXISTS "Service role can manage withdrawal_requests" ON public.withdrawal_requests;
DROP POLICY IF EXISTS "Service role can manage processed transactions" ON public.processed_transactions;

-- Create proper restrictive policies that ONLY allow service_role access
-- Using a role check to ensure only service_role (used by edge functions) can access

-- Workers table - contains sensitive personal data (telegram IDs, names, balances)
CREATE POLICY "Only service role can access workers"
ON public.workers
FOR ALL
TO authenticated, anon
USING (false)
WITH CHECK (false);

-- Conversations table - contains visitor emails, IPs, names
CREATE POLICY "Only service role can access conversations"
ON public.conversations
FOR ALL
TO authenticated, anon
USING (false)
WITH CHECK (false);

-- Chat messages table - contains private messages
CREATE POLICY "Only service role can access chat_messages"
ON public.chat_messages
FOR ALL
TO authenticated, anon
USING (false)
WITH CHECK (false);

-- Page visits table - contains visitor IPs, user agents
CREATE POLICY "Only service role can access page_visits"
ON public.page_visits
FOR ALL
TO authenticated, anon
USING (false)
WITH CHECK (false);

-- Worker domains table - contains worker domain information
CREATE POLICY "Only service role can access worker_domains"
ON public.worker_domains
FOR ALL
TO authenticated, anon
USING (false)
WITH CHECK (false);

-- Profits table - contains financial data
CREATE POLICY "Only service role can access profits"
ON public.profits
FOR ALL
TO authenticated, anon
USING (false)
WITH CHECK (false);

-- Withdrawal requests table - contains wallet addresses
CREATE POLICY "Only service role can access withdrawal_requests"
ON public.withdrawal_requests
FOR ALL
TO authenticated, anon
USING (false)
WITH CHECK (false);

-- Processed transactions table - internal tracking data
CREATE POLICY "Only service role can access processed_transactions"
ON public.processed_transactions
FOR ALL
TO authenticated, anon
USING (false)
WITH CHECK (false);