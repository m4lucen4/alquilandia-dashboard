-- ============================================
-- VERIFY STORAGE BUCKET CONFIGURATION
-- ============================================
-- Run these queries to verify your Storage bucket is configured correctly

-- 1. Check if bucket exists
SELECT * FROM storage.buckets WHERE name = 'invoices-pdf';

-- Expected result: One row with:
--   - name: invoices-pdf
--   - public: true
--   - file_size_limit: null (or a number)
--   - allowed_mime_types: null (or contains 'application/pdf')

-- 2. Check bucket policies
SELECT * FROM storage.objects WHERE bucket_id = 'invoices-pdf';

-- This shows all files in the bucket (might be empty if no PDFs yet)

-- 3. List all policies for storage.objects
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'objects'
AND schemaname = 'storage';

-- Expected policies:
--   - "Allow anonymous to upload invoices" (INSERT)
--   - "Allow public to read invoices" (SELECT)
--   - "Allow anonymous to delete invoices" (DELETE)
