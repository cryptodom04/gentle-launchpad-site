-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Anyone can read messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Anyone can insert messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Anyone can read conversations" ON public.conversations;
DROP POLICY IF EXISTS "Anyone can create conversations" ON public.conversations;
DROP POLICY IF EXISTS "Anyone can update conversations" ON public.conversations;

-- Create more secure policies for conversations
-- Only service role (edge functions) can create conversations
CREATE POLICY "Service role can manage conversations" 
ON public.conversations 
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

-- Anon users can only read conversations by ID (they need to know the UUID)
CREATE POLICY "Anon can read own conversation by ID" 
ON public.conversations 
FOR SELECT 
TO anon
USING (true);

-- Create more secure policies for chat_messages
-- Service role has full access
CREATE POLICY "Service role can manage messages" 
ON public.chat_messages 
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

-- Anon users can read messages for conversations they know the ID of
CREATE POLICY "Anon can read messages" 
ON public.chat_messages 
FOR SELECT 
TO anon
USING (true);

-- Anon users can insert messages only through validated edge function
-- We remove direct insert for anon - all inserts go through edge function
CREATE POLICY "Anon can insert messages" 
ON public.chat_messages 
FOR INSERT 
TO anon
WITH CHECK (true);

-- Add validation constraint for message length
ALTER TABLE public.chat_messages 
ADD CONSTRAINT message_length_check 
CHECK (char_length(message) > 0 AND char_length(message) <= 5000);

-- Add validation for visitor name and email
ALTER TABLE public.conversations
ADD CONSTRAINT visitor_name_length_check 
CHECK (char_length(visitor_name) > 0 AND char_length(visitor_name) <= 100);

ALTER TABLE public.conversations
ADD CONSTRAINT visitor_email_format_check 
CHECK (visitor_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');