
-- Create storage buckets for PDF processing
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('template-files', 'template-files', true),
  ('pdf-previews', 'pdf-previews', true)
ON CONFLICT (id) DO NOTHING;

-- Create policies for template-files bucket
CREATE POLICY "Allow authenticated users to upload template files" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'template-files' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Allow public read access to template files" ON storage.objects
FOR SELECT USING (bucket_id = 'template-files');

CREATE POLICY "Allow authenticated users to update template files" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'template-files' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Allow authenticated users to delete template files" ON storage.objects
FOR DELETE USING (
  bucket_id = 'template-files' AND
  auth.role() = 'authenticated'
);

-- Create policies for pdf-previews bucket
CREATE POLICY "Allow authenticated users to upload PDF previews" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'pdf-previews' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Allow public read access to PDF previews" ON storage.objects
FOR SELECT USING (bucket_id = 'pdf-previews');

CREATE POLICY "Allow authenticated users to update PDF previews" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'pdf-previews' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Allow authenticated users to delete PDF previews" ON storage.objects
FOR DELETE USING (
  bucket_id = 'pdf-previews' AND
  auth.role() = 'authenticated'
);
