-- E-commerce core tables and PitchPrint integration (migration)

-- 1) Carts
CREATE TABLE IF NOT EXISTS public.carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own carts" ON public.carts
FOR SELECT USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create their own carts" ON public.carts
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own carts" ON public.carts
FOR UPDATE USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can delete their own carts" ON public.carts
FOR DELETE USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS update_carts_updated_at ON public.carts;
CREATE TRIGGER update_carts_updated_at
BEFORE UPDATE ON public.carts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2) Cart Items
CREATE TABLE IF NOT EXISTS public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id UUID NOT NULL,
  product_id UUID NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC NOT NULL,
  total_price NUMERIC NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own cart items" ON public.cart_items
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.carts c
    WHERE c.id = cart_items.cart_id AND c.user_id = auth.uid()
  ) OR has_role(auth.uid(), 'admin')
);

CREATE POLICY "Users can create their own cart items" ON public.cart_items
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.carts c
    WHERE c.id = cart_items.cart_id AND c.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own cart items" ON public.cart_items
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.carts c
    WHERE c.id = cart_items.cart_id AND c.user_id = auth.uid()
  ) OR has_role(auth.uid(), 'admin')
);

CREATE POLICY "Users can delete their own cart items" ON public.cart_items
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.carts c
    WHERE c.id = cart_items.cart_id AND c.user_id = auth.uid()
  ) OR has_role(auth.uid(), 'admin')
);

DROP TRIGGER IF EXISTS update_cart_items_updated_at ON public.cart_items;
CREATE TRIGGER update_cart_items_updated_at
BEFORE UPDATE ON public.cart_items
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3) Addresses
CREATE TABLE IF NOT EXISTS public.addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type TEXT NOT NULL DEFAULT 'shipping', -- shipping | billing
  full_name TEXT,
  line1 TEXT NOT NULL,
  line2 TEXT,
  city TEXT NOT NULL,
  state TEXT,
  postal_code TEXT NOT NULL,
  country TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own addresses" ON public.addresses
FOR SELECT USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create their own addresses" ON public.addresses
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own addresses" ON public.addresses
FOR UPDATE USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can delete their own addresses" ON public.addresses
FOR DELETE USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS update_addresses_updated_at ON public.addresses;
CREATE TRIGGER update_addresses_updated_at
BEFORE UPDATE ON public.addresses
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4) Payment Transactions
CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL,
  provider TEXT NOT NULL DEFAULT 'payfast',
  status TEXT NOT NULL DEFAULT 'pending',
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'ZAR',
  raw_payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all payment transactions" ON public.payment_transactions
FOR ALL USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their own payment transactions" ON public.payment_transactions
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = payment_transactions.order_id AND o.user_id = auth.uid()
  ) OR has_role(auth.uid(), 'admin')
);

-- 5) PitchPrint Projects linkage
CREATE TABLE IF NOT EXISTS public.pitchprint_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  product_id UUID NOT NULL,
  cart_item_id UUID,
  order_item_id UUID,
  project_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'completed', -- created|in_progress|completed|pdf_ready|failed
  preview_url TEXT,
  pdf_url TEXT,
  payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_pitchprint_project_id ON public.pitchprint_projects(project_id);

ALTER TABLE public.pitchprint_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own pitchprint projects" ON public.pitchprint_projects
FOR SELECT USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create their own pitchprint projects" ON public.pitchprint_projects
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pitchprint projects" ON public.pitchprint_projects
FOR UPDATE USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can delete their own pitchprint projects" ON public.pitchprint_projects
FOR DELETE USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS update_pitchprint_projects_updated_at ON public.pitchprint_projects;
CREATE TRIGGER update_pitchprint_projects_updated_at
BEFORE UPDATE ON public.pitchprint_projects
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 6) Product adjustments to support PitchPrint-only flow
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS requires_customization boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS customization_help_text text;

-- 7) Storage bucket for order PDFs
INSERT INTO storage.buckets (id, name, public)
VALUES ('order-pdfs', 'order-pdfs', true)
ON CONFLICT (id) DO NOTHING;