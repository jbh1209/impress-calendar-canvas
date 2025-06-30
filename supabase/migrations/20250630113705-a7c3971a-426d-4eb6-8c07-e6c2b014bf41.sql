
-- Add bleed_settings column to templates table
ALTER TABLE public.templates 
ADD COLUMN bleed_settings JSONB DEFAULT '{"top": 3, "right": 3, "bottom": 3, "left": 3, "units": "mm"}'::jsonb;

-- Update existing templates to have the default bleed settings
UPDATE public.templates 
SET bleed_settings = '{"top": 3, "right": 3, "bottom": 3, "left": 3, "units": "mm"}'::jsonb 
WHERE bleed_settings IS NULL;
