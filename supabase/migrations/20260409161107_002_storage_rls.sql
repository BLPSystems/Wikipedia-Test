/*
  # Storage RLS Policies for uploads bucket

  Allows anyone to upload files to the uploads bucket (insert),
  and the service role (edge function) to read/download them.
*/

CREATE POLICY "Anyone can upload files"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'uploads');

CREATE POLICY "Service role can download files"
  ON storage.objects FOR SELECT
  TO service_role
  USING (bucket_id = 'uploads');

CREATE POLICY "Authenticated can read uploads"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'uploads');
