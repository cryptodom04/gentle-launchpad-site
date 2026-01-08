-- Add dns_verified column to worker_domains
ALTER TABLE public.worker_domains 
ADD COLUMN IF NOT EXISTS dns_verified boolean NOT NULL DEFAULT false;

-- Add dns_checked_at column to track last check
ALTER TABLE public.worker_domains 
ADD COLUMN IF NOT EXISTS dns_checked_at timestamp with time zone;

-- Add dns_notified column to prevent duplicate notifications
ALTER TABLE public.worker_domains 
ADD COLUMN IF NOT EXISTS dns_notified boolean NOT NULL DEFAULT false;