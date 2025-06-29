
-- First, let's create the storage buckets with proper configuration
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('template-files', 'template-files', false, 104857600, ARRAY['application/pdf']),
  ('pdf-previews', 'pdf-previews', true, 52428800, ARRAY['image/png', 'image/jpeg'])
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Create RLS policies for template-files bucket (admin only)
CREATE POLICY "Admin can upload template files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'template-files' AND
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admin can view template files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'template-files' AND
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Create RLS policies for pdf-previews bucket (public read, admin write)
CREATE POLICY "Everyone can view PDF previews" ON storage.objects
  FOR SELECT USING (bucket_id = 'pdf-previews');

CREATE POLICY "Admin can upload PDF previews" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'pdf-previews' AND
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Ensure we have proper indexes for performance
CREATE INDEX IF NOT EXISTS idx_templates_category ON templates(category);
CREATE INDEX IF NOT EXISTS idx_templates_active ON templates(is_active);
CREATE INDEX IF NOT EXISTS idx_template_pages_template_id ON template_pages(template_id);
CREATE INDEX IF NOT EXISTS idx_template_pages_page_number ON template_pages(template_id, page_number);
CREATE INDEX IF NOT EXISTS idx_customization_zones_template_id ON customization_zones(template_id);
CREATE INDEX IF NOT EXISTS idx_zone_page_assignments_page_id ON zone_page_assignments(page_id);
CREATE INDEX IF NOT EXISTS idx_zone_page_assignments_zone_id ON zone_page_assignments(zone_id);

-- Add constraints to ensure data integrity
ALTER TABLE template_pages 
ADD CONSTRAINT template_pages_page_number_positive CHECK (page_number > 0),
ADD CONSTRAINT template_pages_dimensions_positive CHECK (
  (pdf_page_width IS NULL OR pdf_page_width > 0) AND 
  (pdf_page_height IS NULL OR pdf_page_height > 0)
);

ALTER TABLE customization_zones
ADD CONSTRAINT customization_zones_dimensions_positive CHECK (
  width > 0 AND height > 0 AND x >= 0 AND y >= 0
);

ALTER TABLE zone_page_assignments
ADD CONSTRAINT zone_page_assignments_dimensions_positive CHECK (
  width > 0 AND height > 0 AND x >= 0 AND y >= 0
);

-- Add unique constraints to prevent duplicate page numbers per template
ALTER TABLE template_pages 
ADD CONSTRAINT template_pages_unique_page_number 
UNIQUE (template_id, page_number);

-- Update the split-pdf function's return type structure
COMMENT ON TABLE template_pages IS 'Stores individual pages from uploaded PDF templates with dimensions and preview images';
COMMENT ON TABLE zone_page_assignments IS 'Maps customization zones to specific pages with positioning data';
