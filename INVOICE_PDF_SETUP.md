# Configuración de Generación de PDFs de Facturas

Este documento explica cómo configurar el sistema de generación automática de PDFs para facturas.

## 1. Instalación de Dependencias

Primero, instala la librería pdfmake:

```bash
npm install pdfmake
```

## 2. Configuración de Base de Datos

Ejecuta el siguiente script SQL en tu proyecto de Supabase para agregar la columna `pdf_url`:

**Archivo:** `ADD_PDF_URL_TO_INVOICES.sql`

```sql
ALTER TABLE invoices
ADD COLUMN IF NOT EXISTS pdf_url TEXT;

COMMENT ON COLUMN invoices.pdf_url IS 'URL of the generated PDF stored in Supabase Storage';

CREATE INDEX IF NOT EXISTS idx_invoices_pdf_url ON invoices(pdf_url);
```

## 3. Configuración de Supabase Storage

Sigue las instrucciones del archivo `SETUP_SUPABASE_STORAGE.md` para:

1. Crear el bucket `invoices-pdf`
2. Configurar como **Public**
3. Agregar las políticas RLS necesarias

### Pasos rápidos:

1. Ve a Supabase Dashboard → Storage
2. Crea nuevo bucket: `invoices-pdf` (Public)
3. Agrega las siguientes políticas en SQL Editor:

```sql
-- Permitir upload
CREATE POLICY "Allow anonymous to upload invoices"
ON storage.objects FOR INSERT
TO anon
WITH CHECK (bucket_id = 'invoices-pdf');

-- Permitir lectura pública
CREATE POLICY "Allow public to read invoices"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'invoices-pdf');

-- Permitir delete
CREATE POLICY "Allow anonymous to delete invoices"
ON storage.objects FOR DELETE
TO anon
USING (bucket_id = 'invoices-pdf');
```

## 4. Funcionalidades Implementadas

### Generación Automática de PDF

Cuando se crea una factura:
1. Se genera automáticamente un PDF con formato profesional
2. El PDF se sube a Supabase Storage (`invoices-pdf/invoice_<id>.pdf`)
3. La URL del PDF se guarda en la columna `pdf_url` de la factura

### Contenido del PDF

El PDF generado incluye:
- **Encabezado**: Nº Factura, Nº Presupuesto, Fecha
- **Empresa Emisora**: Nombre, NIF, dirección completa, teléfono
- **Tipo de Factura**: Con porcentaje (fondo azul)
- **Tipo de Impuesto**: Con porcentaje (fondo verde)
- **Tabla de Líneas**: Todas las líneas del presupuesto
- **Resumen de Precios**: Subtotal, IVA, Extras, Descuento, Total

### Tamaño del PDF

Los PDFs son ligeros (típicamente 20-50KB) gracias a:
- Uso de pdfmake (librería optimizada)
- Sin imágenes pesadas
- Fuentes estándar embebidas
- Diseño minimalista pero profesional

### Descarga de PDFs

**Desde la tabla de Presupuestos (Budgets):**
- Modal "Ver datos factura" → Botón "Descargar PDF"

**Desde la tabla de Facturas (Invoices):**
- Columna "Acciones" → Botón "PDF"

## 5. Estructura de Archivos Creados/Modificados

### Nuevos Archivos:
- `src/services/pdfService.ts` - Servicio de generación de PDFs
- `ADD_PDF_URL_TO_INVOICES.sql` - Script de migración
- `SETUP_SUPABASE_STORAGE.md` - Instrucciones de Storage

### Archivos Modificados:
- `src/services/invoicesService.ts` - Integración de PDF en creación de facturas
- `src/types/invoices.ts` - Agregado campo `pdf_url`
- `src/types/supabase.ts` - Agregado `pdf_url` en schema
- `src/pages/Budgets.tsx` - Botón descarga en modal
- `src/pages/accounting/Invoices.tsx` - Columna con botón descarga

## 6. Flujo Completo

```
Usuario genera factura →
  1. Se crea registro en DB
  2. Se obtienen datos completos (business, types)
  3. Se genera PDF con pdfmake
  4. Se sube a Storage
  5. Se actualiza registro con pdf_url
  6. Usuario puede descargar PDF
```

## 7. Troubleshooting

### Error: "Cannot find module 'pdfmake'"
**Solución:** Ejecuta `npm install pdfmake`

### Error: "Bucket not found"
**Solución:** Verifica que el bucket `invoices-pdf` existe en Storage

### Error: "Permission denied"
**Solución:** Verifica las políticas RLS del bucket

### PDF no se genera
**Solución:** Verifica la consola del navegador para errores de generación

## 8. Ejemplo de URL de PDF

```
https://abcdefghijklmnop.supabase.co/storage/v1/object/public/invoices-pdf/invoice_123e4567-e89b-12d3-a456-426614174000.pdf
```

## 9. Próximos Pasos (Opcionales)

- [ ] Personalizar diseño del PDF (logo, colores)
- [ ] Agregar más información al PDF
- [ ] Implementar envío por email
- [ ] Agregar watermark o firma digital
