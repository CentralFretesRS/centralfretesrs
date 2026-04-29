
-- Quotes table
CREATE TABLE public.quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  origin_city TEXT NOT NULL,
  origin_neighborhood TEXT,
  origin_address TEXT,
  destination_city TEXT NOT NULL,
  destination_neighborhood TEXT,
  destination_address TEXT,
  item_category TEXT NOT NULL,
  item_quantity TEXT,
  item_notes TEXT,
  desired_date DATE,
  period TEXT,
  needs_helpers BOOLEAN DEFAULT false,
  technical_details TEXT,
  status TEXT NOT NULL DEFAULT 'recebido',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

-- Anyone (anon) can submit a new quote
CREATE POLICY "Anyone can insert quotes"
  ON public.quotes FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only authenticated users can read/update/delete
CREATE POLICY "Authenticated can view quotes"
  ON public.quotes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated can update quotes"
  ON public.quotes FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated can delete quotes"
  ON public.quotes FOR DELETE
  TO authenticated
  USING (true);

-- Financials table
CREATE TABLE public.financials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID REFERENCES public.quotes(id) ON DELETE SET NULL,
  client_name TEXT NOT NULL,
  origin TEXT,
  destination TEXT,
  driver TEXT,
  amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  commission_pct NUMERIC(5,2) NOT NULL DEFAULT 10,
  payment_method TEXT NOT NULL DEFAULT 'pix',
  payment_status TEXT NOT NULL DEFAULT 'pendente',
  realized_at DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.financials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view financials"
  ON public.financials FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert financials"
  ON public.financials FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update financials"
  ON public.financials FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated can delete financials"
  ON public.financials FOR DELETE TO authenticated USING (true);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER trg_quotes_updated BEFORE UPDATE ON public.quotes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_financials_updated BEFORE UPDATE ON public.financials
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.quotes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.financials;
