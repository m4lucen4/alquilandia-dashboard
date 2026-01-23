-- Script SQL para crear la tabla taxes_types en Supabase
-- Ejecuta este script en el SQL Editor de tu proyecto Supabase

-- Crear tabla taxes_types
CREATE TABLE IF NOT EXISTS public.taxes_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  tax NUMERIC(5,2) NOT NULL CHECK (tax >= 0 AND tax <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crear índice en name para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_taxes_types_name ON public.taxes_types(name);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.taxes_types ENABLE ROW LEVEL SECURITY;

-- Política para permitir lectura a usuarios anónimos (anon key)
CREATE POLICY "Allow anon users to read taxes_types"
  ON public.taxes_types
  FOR SELECT
  TO anon
  USING (true);

-- Política para permitir inserción a usuarios anónimos
CREATE POLICY "Allow anon users to insert taxes_types"
  ON public.taxes_types
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Política para permitir actualización a usuarios anónimos
CREATE POLICY "Allow anon users to update taxes_types"
  ON public.taxes_types
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Política para permitir eliminación a usuarios anónimos
CREATE POLICY "Allow anon users to delete taxes_types"
  ON public.taxes_types
  FOR DELETE
  TO anon
  USING (true);

-- Trigger para actualizar updated_at automáticamente
-- Reutilizamos la función update_updated_at_column() si ya existe
CREATE TRIGGER update_taxes_types_updated_at
  BEFORE UPDATE ON public.taxes_types
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insertar datos de ejemplo (opcional)
INSERT INTO public.taxes_types (name, tax) VALUES
  ('IVA General', 21.00),
  ('IVA Reducido', 10.00),
  ('IVA Superreducido', 4.00),
  ('Exento', 0.00)
ON CONFLICT (name) DO NOTHING;
