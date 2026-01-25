# Configuración de Supabase Storage para PDFs de Facturas

## Pasos para configurar el Storage Bucket

1. **Ir a Supabase Dashboard**
   - Ve a tu proyecto en Supabase
   - Navega a la sección **Storage**

2. **Crear nuevo Bucket**
   - Haz clic en "New Bucket"
   - Nombre: `invoices-pdf`
   - Visibilidad: **Public** (para poder descargar los PDFs)
   - Haz clic en "Create bucket"

3. **Configurar Políticas de Acceso (RLS)**

   Ve a la pestaña "Policies" del bucket y crea las siguientes políticas:

   **Política 1: Permitir INSERT a usuarios anónimos**
   ```sql
   CREATE POLICY "Allow anonymous to upload invoices"
   ON storage.objects FOR INSERT
   TO anon
   WITH CHECK (bucket_id = 'invoices-pdf');
   ```

   **Política 2: Permitir SELECT público (para descargar PDFs)**
   ```sql
   CREATE POLICY "Allow public to read invoices"
   ON storage.objects FOR SELECT
   TO public
   USING (bucket_id = 'invoices-pdf');
   ```

   **Política 3: Permitir DELETE a usuarios anónimos**
   ```sql
   CREATE POLICY "Allow anonymous to delete invoices"
   ON storage.objects FOR DELETE
   TO anon
   USING (bucket_id = 'invoices-pdf');
   ```

4. **Verificar configuración**
   - El bucket debe estar marcado como **Public**
   - Las políticas deben estar activas
   - El nombre del bucket debe ser exactamente: `invoices-pdf`

## Estructura de archivos

Los PDFs se guardarán con la siguiente estructura:
```
invoices-pdf/
  └── invoice_<invoice_id>.pdf
```

Ejemplo: `invoice_123e4567-e89b-12d3-a456-426614174000.pdf`

## URL de acceso

Los PDFs serán accesibles mediante:
```
https://<project-ref>.supabase.co/storage/v1/object/public/invoices-pdf/invoice_<invoice_id>.pdf
```
