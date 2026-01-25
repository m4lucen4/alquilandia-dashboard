-- ============================================
-- ADD PDF_URL COLUMN TO INVOICES TABLE
-- ============================================
-- Adds pdf_url column to store the Supabase Storage URL of the generated PDF

ALTER TABLE invoices
ADD COLUMN IF NOT EXISTS pdf_url TEXT;

-- Add comment for documentation
COMMENT ON COLUMN invoices.pdf_url IS 'URL of the generated PDF stored in Supabase Storage';

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_invoices_pdf_url ON invoices(pdf_url);
