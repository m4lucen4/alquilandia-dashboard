-- Script SQL para crear la tabla business en Supabase
-- Ejecuta este script en el SQL Editor de tu proyecto Supabase

-- Crear tabla business
CREATE TABLE IF NOT EXISTS public.business (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  nif TEXT NOT NULL UNIQUE,
  address TEXT NOT NULL,
  locality TEXT NOT NULL,
  province TEXT NOT NULL,
  phone TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crear índice en NIF para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_business_nif ON public.business(nif);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.business ENABLE ROW LEVEL SECURITY;

-- Política para permitir lectura a usuarios anónimos (anon key)
CREATE POLICY "Allow anon users to read business"
  ON public.business
  FOR SELECT
  TO anon
  USING (true);

-- Política para permitir inserción a usuarios anónimos
CREATE POLICY "Allow anon users to insert business"
  ON public.business
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Política para permitir actualización a usuarios anónimos
CREATE POLICY "Allow anon users to update business"
  ON public.business
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Política para permitir eliminación a usuarios anónimos
CREATE POLICY "Allow anon users to delete business"
  ON public.business
  FOR DELETE
  TO anon
  USING (true);

-- Función para actualizar automáticamente el campo updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at automáticamente
CREATE TRIGGER update_business_updated_at
  BEFORE UPDATE ON public.business
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insertar datos de ejemplo (opcional)
INSERT INTO public.business (name, nif, address, locality, province, phone, postal_code) VALUES
  ('Empresa Demo S.L.', 'B12345678', 'Calle Principal 123', 'Madrid', 'Madrid', '912345678', '28001'),
  ('Alquilandia Sevilla', 'B87654321', 'Avenida de Andalucía 456', 'Sevilla', 'Sevilla', '954123456', '41001')
ON CONFLICT (nif) DO NOTHING;
