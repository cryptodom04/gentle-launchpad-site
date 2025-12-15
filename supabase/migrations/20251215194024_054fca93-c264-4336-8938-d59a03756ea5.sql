-- Add application form fields to workers table
ALTER TABLE public.workers 
ADD COLUMN traffic_type TEXT,
ADD COLUMN hours_per_day TEXT,
ADD COLUMN experience TEXT,
ADD COLUMN registration_step TEXT DEFAULT 'start';

-- Create index for registration step
CREATE INDEX idx_workers_registration_step ON public.workers(registration_step);