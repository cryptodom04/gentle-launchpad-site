-- Add session token column to conversations
ALTER TABLE public.conversations 
ADD COLUMN session_token UUID NOT NULL DEFAULT gen_random_uuid();

-- Create index for faster lookups
CREATE INDEX idx_conversations_session_token ON public.conversations(session_token);

-- Drop old permissive policies
DROP POLICY IF EXISTS "Anon can read own conversation by ID" ON public.conversations;
DROP POLICY IF EXISTS "Anon can read messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Anon can insert messages" ON public.chat_messages;

-- Now only service role can access these tables directly
-- All client access goes through validated edge functions