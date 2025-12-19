-- Make worker_id and domain_id nullable to allow recording all transactions
ALTER TABLE public.profits 
ALTER COLUMN worker_id DROP NOT NULL,
ALTER COLUMN domain_id DROP NOT NULL;

-- Drop existing foreign key constraints and recreate with ON DELETE SET NULL
ALTER TABLE public.profits DROP CONSTRAINT IF EXISTS profits_worker_id_fkey;
ALTER TABLE public.profits DROP CONSTRAINT IF EXISTS profits_domain_id_fkey;

ALTER TABLE public.profits 
ADD CONSTRAINT profits_worker_id_fkey 
FOREIGN KEY (worker_id) REFERENCES public.workers(id) ON DELETE SET NULL;

ALTER TABLE public.profits 
ADD CONSTRAINT profits_domain_id_fkey 
FOREIGN KEY (domain_id) REFERENCES public.worker_domains(id) ON DELETE SET NULL;