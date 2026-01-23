-- Script SQL para crear la tabla invoices_types en Supabase
-- Ejecuta este script en el SQL Editor de tu proyecto Supabase

-- Crear tabla invoices_types
CREATE TABLE IF NOT EXISTS public.invoices_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoices TEXT NOT NULL UNIQUE,
  percentage NUMERIC(5,2) NOT NULL CHECK (percentage >= 0 AND percentage <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crear índice en invoices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_invoices_types_invoices ON public.invoices_types(invoices);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.invoices_types ENABLE ROW LEVEL SECURITY;

-- Política para permitir lectura a usuarios anónimos (anon key)
CREATE POLICY "Allow anon users to read invoices_types"
  ON public.invoices_types
  FOR SELECT
  TO anon
  USING (true);

-- Política para permitir inserción a usuarios anónimos
CREATE POLICY "Allow anon users to insert invoices_types"
  ON public.invoices_types
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Política para permitir actualización a usuarios anónimos
CREATE POLICY "Allow anon users to update invoices_types"
  ON public.invoices_types
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Política para permitir eliminación a usuarios anónimos
CREATE POLICY "Allow anon users to delete invoices_types"
  ON public.invoices_types
  FOR DELETE
  TO anon
  USING (true);

-- Trigger para actualizar updated_at automáticamente
-- Reutilizamos la función update_updated_at_column() si ya existe
CREATE TRIGGER update_invoices_types_updated_at
  BEFORE UPDATE ON public.invoices_types
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insertar datos de ejemplo (opcional)
INSERT INTO public.invoices_types (invoices, percentage) VALUES
  ('Factura Estándar', 0.00),
  ('Factura con Retención IRPF 15%', 15.00),
  ('Factura con Retención IRPF 7%', 7.00),
  ('Factura Simplificada', 0.00)
ON CONFLICT (invoices) DO NOTHING;
