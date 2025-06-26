
-- Create storage bucket for PDF previews
INSERT INTO storage.buckets (id, name, public) 
VALUES ('pdf-previews', 'pdf-previews', true);

-- Create RLS policies for PDF preview storage
CREATE POLICY "Allow authenticated users to upload PDF previews"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'pdf-previews' AND auth.role() = 'authenticated');

CREATE POLICY "Allow public read access to PDF previews"
ON storage.objects FOR SELECT
USING (bucket_id = 'pdf-previews');

CREATE POLICY "Allow authenticated users to update PDF previews"
ON storage.objects FOR UPDATE
USING (bucket_id = 'pdf-previews' AND auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete PDF previews"
ON storage.objects FOR DELETE
USING (bucket_id = 'pdf-previews' AND auth.role() = 'authenticated');
