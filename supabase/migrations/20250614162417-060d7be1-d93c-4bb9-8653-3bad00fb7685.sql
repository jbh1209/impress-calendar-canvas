
-- Create a function to automatically update the updated_at timestamp on relevant tables
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the customization_zones table
CREATE TABLE public.customization_zones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID NOT NULL REFERENCES public.templates(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('image', 'text')),
  x DOUBLE PRECISION NOT NULL,
  y DOUBLE PRECISION NOT NULL,
  width DOUBLE PRECISION NOT NULL,
  height DOUBLE PRECISION NOT NULL,
  z_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add a comment to the table for clarity
COMMENT ON TABLE public.customization_zones IS 'Stores customization zones for calendar templates.';

-- Apply the trigger to the new customization_zones table
CREATE TRIGGER update_customization_zones_updated_at
BEFORE UPDATE ON public.customization_zones
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Apply the trigger to existing tables that have an updated_at column
CREATE TRIGGER update_templates_updated_at
BEFORE UPDATE ON public.templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_product_images_updated_at
BEFORE UPDATE ON public.product_images
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_product_variants_updated_at
BEFORE UPDATE ON public.product_variants
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_shutterstock_selections_updated_at
BEFORE UPDATE ON public.shutterstock_selections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
