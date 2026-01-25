-- ============================================
-- ADD PDF_URL TO EXISTING INVOICES TABLE
-- ============================================
-- Este script solo agrega la columna pdf_url a la tabla invoices existente
-- No toca funciones ni triggers

-- Agregar columna pdf_url si no existe
ALTER TABLE invoices
ADD COLUMN IF NOT EXISTS pdf_url TEXT;

-- Crear índice
CREATE INDEX IF NOT EXISTS idx_invoices_pdf_url ON invoices(pdf_url);

-- Agregar comentario
COMMENT ON COLUMN invoices.pdf_url IS 'URL of the generated PDF stored in Supabase Storage';
