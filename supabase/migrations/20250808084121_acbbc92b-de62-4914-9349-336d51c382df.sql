-- Phase 3 DB adjustments: make orders.template_id nullable and add optional address links

-- 1) Allow product-based orders by making template_id nullable
ALTER TABLE public.orders 
  ALTER COLUMN template_id DROP NOT NULL;

-- 2) Add optional shipping/billing address references if they don't exist yet
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'orders' 
      AND column_name = 'shipping_address_id'
  ) THEN
    ALTER TABLE public.orders 
      ADD COLUMN shipping_address_id uuid REFERENCES public.addresses(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'orders' 
      AND column_name = 'billing_address_id'
  ) THEN
    ALTER TABLE public.orders 
      ADD COLUMN billing_address_id uuid REFERENCES public.addresses(id) ON DELETE SET NULL;
  END IF;
END $$;