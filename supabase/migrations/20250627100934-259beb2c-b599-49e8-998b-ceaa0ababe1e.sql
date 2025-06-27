
-- Create the missing storage buckets with proper configuration
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('template-files', 'template-files', true, 104857600, ARRAY['application/pdf']),
  ('pdf-previews', 'pdf-previews', true, 52428800, ARRAY['image/png', 'image/jpeg', 'image/jpg'])
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Create comprehensive RLS policies for template-files bucket
DROP POLICY IF EXISTS "Allow authenticated users to upload template files" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access to template files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update template files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete template files" ON storage.objects;

CREATE POLICY "Public read access to template files"
ON storage.objects FOR SELECT
USING (bucket_id = 'template-files');

CREATE POLICY "Authenticated upload to template files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'template-files' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated update template files"
ON storage.objects FOR UPDATE
USING (bucket_id = 'template-files' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated delete template files"
ON storage.objects FOR DELETE
USING (bucket_id = 'template-files' AND auth.role() = 'authenticated');

-- Create comprehensive RLS policies for pdf-previews bucket
DROP POLICY IF EXISTS "Allow public read access to PDF previews" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload PDF previews" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update PDF previews" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete PDF previews" ON storage.objects;
DROP POLICY IF EXISTS "Public read access to PDF previews" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated upload to PDF previews" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated update PDF previews" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated delete PDF previews" ON storage.objects;

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
