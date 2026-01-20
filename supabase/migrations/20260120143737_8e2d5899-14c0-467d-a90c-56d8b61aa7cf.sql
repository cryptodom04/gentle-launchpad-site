-- Drop the existing overly permissive upload policy
DROP POLICY IF EXISTS "Anyone can upload chat images" ON storage.objects;

-- Create a new restrictive policy that only allows service_role to upload
-- This forces all uploads through the chat-upload-image edge function
CREATE POLICY "Only service role can upload chat images"
ON storage.objects FOR INSERT
TO authenticated, anon
WITH CHECK (false);

-- Keep the public read policy so images can be viewed
-- The "Anyone can view chat images" policy should still exist