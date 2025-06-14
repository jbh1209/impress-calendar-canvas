
-- 1. Create table for template pages (each representing a page of an uploaded PDF)
CREATE TABLE public.template_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
  page_number INTEGER NOT NULL,
  preview_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. Create table for customization zone assignments to specific pages
CREATE TABLE public.zone_page_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id UUID NOT NULL REFERENCES customization_zones(id) ON DELETE CASCADE,
  page_id UUID NOT NULL REFERENCES template_pages(id) ON DELETE CASCADE,
  x DOUBLE PRECISION NOT NULL,
  y DOUBLE PRECISION NOT NULL,
  width DOUBLE PRECISION NOT NULL,
  height DOUBLE PRECISION NOT NULL,
  z_index INTEGER NOT NULL DEFAULT 0,
  is_repeating BOOLEAN NOT NULL DEFAULT false
);

-- 3. Enable RLS for both tables
ALTER TABLE public.template_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zone_page_assignments ENABLE ROW LEVEL SECURITY;

-- 4. Policies: allow full access for now (can be restricted later if needed)

-- template_pages
CREATE POLICY "Allow all actions on template_pages" ON public.template_pages
  FOR ALL USING (true) WITH CHECK (true);

-- zone_page_assignments
CREATE POLICY "Allow all actions on zone_page_assignments" ON public.zone_page_assignments
  FOR ALL USING (true) WITH CHECK (true);
