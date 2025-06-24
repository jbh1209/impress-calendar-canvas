
-- Create storage bucket for template files
INSERT INTO storage.buckets (id, name, public)
VALUES ('template-files', 'template-files', true);

-- Create storage policies for template files
CREATE POLICY "Allow authenticated users to upload template files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'template-files' AND auth.role() = 'authenticated');

CREATE POLICY "Allow public read access to template files"
ON storage.objects FOR SELECT
USING (bucket_id = 'template-files');

CREATE POLICY "Allow authenticated users to update template files"
ON storage.objects FOR UPDATE
USING (bucket_id = 'template-files' AND auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete template files"
ON storage.objects FOR DELETE
USING (bucket_id = 'template-files' AND auth.role() = 'authenticated');

-- Add original_pdf_url column to templates table
ALTER TABLE public.templates 
ADD COLUMN original_pdf_url TEXT;

-- Add pdf_metadata column to store PDF dimensions, page count, etc.
ALTER TABLE public.templates 
ADD COLUMN pdf_metadata JSONB;

-- Update template_pages to store both preview and vector coordinates
ALTER TABLE public.template_pages 
ADD COLUMN pdf_page_width DOUBLE PRECISION,
ADD COLUMN pdf_page_height DOUBLE PRECISION,
ADD COLUMN pdf_units TEXT DEFAULT 'pt';

-- Add comment for clarity
COMMENT ON COLUMN public.templates.original_pdf_url IS 'URL to the original PDF file in vector format';
COMMENT ON COLUMN public.templates.pdf_metadata IS 'Stores PDF metadata: page count, dimensions, units, etc.';
COMMENT ON COLUMN public.template_pages.pdf_page_width IS 'Original PDF page width in PDF units (points)';
COMMENT ON COLUMN public.template_pages.pdf_page_height IS 'Original PDF page height in PDF units (points)';
