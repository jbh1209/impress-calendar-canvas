
-- Ensure the pdf-previews bucket exists with proper configuration
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('pdf-previews', 'pdf-previews', true, 52428800, ARRAY['image/png', 'image/jpeg', 'image/jpg'])
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/jpg'];

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Public read access to PDF previews" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated upload to PDF previews" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated update PDF previews" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated delete PDF previews" ON storage.objects;

-- Create comprehensive policies for the pdf-previews bucket
CREATE POLICY "Allow public read access to PDF previews"
ON storage.objects FOR SELECT
USING (bucket_id = 'pdf-previews');

CREATE POLICY "Allow authenticated users to upload PDF previews"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'pdf-previews' AND auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update PDF previews"
ON storage.objects FOR UPDATE
USING (bucket_id = 'pdf-previews' AND auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete PDF previews"
ON storage.objects FOR DELETE
USING (bucket_id = 'pdf-previews' AND auth.role() = 'authenticated');
