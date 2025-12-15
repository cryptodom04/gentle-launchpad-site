-- Create enum for worker status
CREATE TYPE public.worker_status AS ENUM ('pending', 'approved', 'banned');

-- Create enum for withdrawal status
CREATE TYPE public.withdrawal_status AS ENUM ('pending', 'approved', 'rejected', 'paid');

-- Workers table
CREATE TABLE public.workers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  telegram_id BIGINT NOT NULL UNIQUE,
  telegram_username TEXT,
  telegram_name TEXT,
  status worker_status NOT NULL DEFAULT 'pending',
  balance_sol DECIMAL(18, 9) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by BIGINT
);

-- Worker domains table
CREATE TABLE public.worker_domains (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  worker_id UUID NOT NULL REFERENCES public.workers(id) ON DELETE CASCADE,
  subdomain TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Profits table
CREATE TABLE public.profits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  worker_id UUID NOT NULL REFERENCES public.workers(id) ON DELETE CASCADE,
  domain_id UUID NOT NULL REFERENCES public.worker_domains(id) ON DELETE CASCADE,
  amount_sol DECIMAL(18, 9) NOT NULL,
  amount_usd DECIMAL(18, 2),
  sender_address TEXT NOT NULL,
  tx_signature TEXT NOT NULL UNIQUE,
  worker_share_sol DECIMAL(18, 9) NOT NULL, -- 80%
  admin_share_sol DECIMAL(18, 9) NOT NULL, -- 20%
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Withdrawal requests table
CREATE TABLE public.withdrawal_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  worker_id UUID NOT NULL REFERENCES public.workers(id) ON DELETE CASCADE,
  amount_sol DECIMAL(18, 9) NOT NULL,
  wallet_address TEXT NOT NULL,
  status withdrawal_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE,
  processed_by BIGINT,
  tx_signature TEXT
);

-- Enable RLS
ALTER TABLE public.workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worker_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;

-- Service role policies (for edge functions)
CREATE POLICY "Service role can manage workers" ON public.workers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role can manage worker_domains" ON public.worker_domains FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role can manage profits" ON public.profits FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role can manage withdrawal_requests" ON public.withdrawal_requests FOR ALL USING (true) WITH CHECK (true);

-- Indexes for performance
CREATE INDEX idx_workers_telegram_id ON public.workers(telegram_id);
CREATE INDEX idx_workers_status ON public.workers(status);
CREATE INDEX idx_worker_domains_subdomain ON public.worker_domains(subdomain);
CREATE INDEX idx_profits_worker_id ON public.profits(worker_id);
CREATE INDEX idx_profits_domain_id ON public.profits(domain_id);
CREATE INDEX idx_withdrawal_requests_worker_id ON public.withdrawal_requests(worker_id);
CREATE INDEX idx_withdrawal_requests_status ON public.withdrawal_requests(status);