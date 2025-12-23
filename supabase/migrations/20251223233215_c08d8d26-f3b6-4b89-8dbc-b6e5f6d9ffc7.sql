-- Таблица для отслеживания посещений
CREATE TABLE public.page_visits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  page_path TEXT NOT NULL,
  visitor_ip TEXT,
  visitor_country TEXT,
  visitor_country_code TEXT,
  visitor_city TEXT,
  referrer TEXT,
  user_agent TEXT,
  session_id TEXT,
  worker_subdomain TEXT
);

-- Включить RLS
ALTER TABLE public.page_visits ENABLE ROW LEVEL SECURITY;

-- Политика для service role
CREATE POLICY "Service role can manage page_visits" ON public.page_visits
FOR ALL USING (true) WITH CHECK (true);

-- Индексы для быстрой статистики
CREATE INDEX idx_page_visits_created_at ON public.page_visits(created_at);
CREATE INDEX idx_page_visits_country ON public.page_visits(visitor_country_code);
CREATE INDEX idx_page_visits_subdomain ON public.page_visits(worker_subdomain);