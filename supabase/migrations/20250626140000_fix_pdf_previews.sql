
-- Ensure the pdf-previews bucket exists and is properly configured
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('pdf-previews', 'pdf-previews', true, 52428800, ARRAY['image/png', 'image/jpeg', 'image/jpg'])
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/jpg'];

-- Update RLS policies for better access
DROP POLICY IF EXISTS "Allow public read access to PDF previews" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload PDF previews" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update PDF previews" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete PDF previews" ON storage.objects;

-- Create more permissive policies
CREATE POLICY "Public read access to PDF previews"
ON storage.objects FOR SELECT
USING (bucket_id = 'pdf-previews');

CREATE POLICY "Authenticated upload to PDF previews"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'pdf-previews' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated update PDF previews"
ON storage.objects FOR UPDATE
USING (bucket_id = 'pdf-previews' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated delete PDF previews"
ON storage.objects FOR DELETE
USING (bucket_id = 'pdf-previews' AND auth.role() = 'authenticated');
