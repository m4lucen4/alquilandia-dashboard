-- ============================================
-- SETUP INVOICES TABLE
-- ============================================
-- This table stores generated invoices from budgets
-- Invoice numbers auto-increment independently per business_id

-- Drop existing objects if they exist
-- Drop table first (this will automatically drop associated triggers)
DROP TABLE IF EXISTS invoices;

-- Drop invoice-specific functions only
-- Note: update_updated_at_column() is shared across tables, so we don't drop it
DROP FUNCTION IF EXISTS get_next_invoice_number(UUID);
DROP FUNCTION IF EXISTS set_invoice_number();

-- Create invoices table
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES business(id) ON DELETE CASCADE,
  invoices_type_id UUID NOT NULL REFERENCES invoices_types(id) ON DELETE RESTRICT,
  taxes_type_id UUID NOT NULL REFERENCES taxes_types(id) ON DELETE RESTRICT,
  budget_reference INTEGER NOT NULL,
  invoice_number INTEGER NOT NULL,
  budgetlines JSONB NOT NULL DEFAULT '[]'::jsonb,
  price JSONB NOT NULL DEFAULT '{}'::jsonb,
  pdf_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Ensure invoice_number is unique per business
  CONSTRAINT unique_invoice_number_per_business UNIQUE (business_id, invoice_number)
);

-- Create indexes for better performance
CREATE INDEX idx_invoices_business_id ON invoices(business_id);
CREATE INDEX idx_invoices_invoices_type_id ON invoices(invoices_type_id);
CREATE INDEX idx_invoices_taxes_type_id ON invoices(taxes_type_id);
CREATE INDEX idx_invoices_budget_reference ON invoices(budget_reference);
CREATE INDEX idx_invoices_pdf_url ON invoices(pdf_url);
CREATE INDEX idx_invoices_created_at ON invoices(created_at DESC);

-- Create function to get next invoice number for a business
CREATE OR REPLACE FUNCTION get_next_invoice_number(p_business_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_next_number INTEGER;
BEGIN
  -- Get the maximum invoice number for this business and add 1
  SELECT COALESCE(MAX(invoice_number), 0) + 1
  INTO v_next_number
  FROM invoices
  WHERE business_id = p_business_id;

  RETURN v_next_number;
END;
$$ LANGUAGE plpgsql;

-- Create trigger function to auto-set invoice_number before insert
CREATE OR REPLACE FUNCTION set_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
  -- Only set invoice_number if it's not already provided
  IF NEW.invoice_number IS NULL OR NEW.invoice_number = 0 THEN
    NEW.invoice_number := get_next_invoice_number(NEW.business_id);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-set invoice_number
CREATE TRIGGER set_invoice_number_trigger
  BEFORE INSERT ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION set_invoice_number();

-- Note: update_updated_at_column() function already exists and is shared across tables
-- We just need to create the trigger that uses it

-- Create trigger for updated_at
CREATE TRIGGER set_updated_at_invoices
  BEFORE UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for anonymous users
-- WARNING: These policies allow full access to anonymous users
-- Consider restricting based on your authentication system
CREATE POLICY "Allow anonymous to view invoices"
  ON invoices FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anonymous to insert invoices"
  ON invoices FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anonymous to update invoices"
  ON invoices FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anonymous to delete invoices"
  ON invoices FOR DELETE
  TO anon
  USING (true);

-- Add comments for documentation
COMMENT ON TABLE invoices IS 'Stores generated invoices from budgets with auto-incrementing invoice numbers per business';
COMMENT ON COLUMN invoices.budget_reference IS 'Reference number of the original budget (budgetReference)';
COMMENT ON COLUMN invoices.invoice_number IS 'Auto-increments independently for each business_id (business 1: 1,2,3... business 2: 1,2,3...)';
COMMENT ON COLUMN invoices.budgetlines IS 'Array of budget line items from the original budget';
COMMENT ON COLUMN invoices.price IS 'Price breakdown from the original budget (total, subTotal, vat, extras, etc.)';
COMMENT ON COLUMN invoices.pdf_url IS 'URL of the generated PDF stored in Supabase Storage';
