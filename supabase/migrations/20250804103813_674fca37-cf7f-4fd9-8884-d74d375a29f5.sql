-- Add PitchPrint design ID to products table
ALTER TABLE products ADD COLUMN pitchprint_design_id TEXT;

-- Add index for better performance
CREATE INDEX idx_products_pitchprint_design_id ON products(pitchprint_design_id) WHERE pitchprint_design_id IS NOT NULL;