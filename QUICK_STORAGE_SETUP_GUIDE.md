# Guía Rápida: Configuración de Storage para PDFs

## ⚠️ Checklist de Verificación

Antes de continuar, verifica:
- [ ] Has ejecutado el script `UPDATE_ADD_PDF_URL.sql` en tu base de datos
- [ ] La columna `pdf_url` existe en la tabla `invoices`
- [ ] Has instalado pdfmake: `npm install pdfmake`

## 📋 Paso 1: Crear el Bucket

1. Ve a tu proyecto en Supabase Dashboard
2. Click en **Storage** en el menú lateral
3. Click en **New Bucket**
4. Configuración:
   - **Name:** `invoices-pdf` (exactamente así, sin espacios)
   - **Public bucket:** ✅ **ACTIVADO** (muy importante)
   - **File size limit:** Dejar vacío o poner 5MB
   - **Allowed MIME types:** Dejar vacío (acepta todos)
5. Click en **Create bucket**

## 📋 Paso 2: Configurar Políticas RLS

Tienes dos opciones:

### Opción A: Usar la Interfaz (Más Fácil)

1. Ve a **Storage** → Click en el bucket `invoices-pdf`
2. Ve a la pestaña **Policies**
3. Click en **New Policy**
4. Crea 3 políticas:

**Política 1: Upload**
- Operation: INSERT
- Policy name: `Allow anonymous to upload invoices`
- Target roles: `anon`
- USING expression: `bucket_id = 'invoices-pdf'`

**Política 2: Download**
- Operation: SELECT
- Policy name: `Allow public to read invoices`
- Target roles: `public`
- USING expression: `bucket_id = 'invoices-pdf'`

**Política 3: Delete**
- Operation: DELETE
- Policy name: `Allow anonymous to delete invoices`
- Target roles: `anon`
- USING expression: `bucket_id = 'invoices-pdf'`

### Opción B: Usar SQL (Más Rápido)

Ve a **SQL Editor** y ejecuta:

```sql
-- Política INSERT
CREATE POLICY "Allow anonymous to upload invoices"
ON storage.objects FOR INSERT
TO anon
WITH CHECK (bucket_id = 'invoices-pdf');

-- Política SELECT
CREATE POLICY "Allow public to read invoices"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'invoices-pdf');

-- Política DELETE
CREATE POLICY "Allow anonymous to delete invoices"
ON storage.objects FOR DELETE
TO anon
USING (bucket_id = 'invoices-pdf');
```

## ✅ Paso 3: Verificar Configuración

Ejecuta este SQL en el SQL Editor para verificar:

```sql
-- Verificar que el bucket existe y es público
SELECT name, public FROM storage.buckets WHERE name = 'invoices-pdf';
```

**Resultado esperado:**
```
name          | public
------------- | ------
invoices-pdf  | true
```

Si `public` es `false`, ve a Storage → invoices-pdf → Settings → Public Bucket → Activar

## 🧪 Paso 4: Probar

1. Genera una factura desde la aplicación
2. Abre la consola del navegador (F12)
3. Busca los logs con emojis:
   - 🔍 Step 2: Fetching complete invoice...
   - 📄 Step 3: Generating PDF...
   - ☁️ Step 4: Uploading PDF to Storage...
   - 🔗 Step 5: Getting public URL...
   - 💾 Step 6: Updating invoice...

4. Si ves un ❌, lee el error específico

## 🐛 Troubleshooting

### Error: "new row violates row-level security policy"
**Causa:** Las políticas RLS no están configuradas
**Solución:** Ejecuta los comandos SQL del Paso 2

### Error: "Bucket not found"
**Causa:** El bucket no existe o tiene nombre incorrecto
**Solución:** Verifica que el bucket se llama exactamente `invoices-pdf`

### Error: "The resource already exists"
**Causa:** Las políticas ya existen
**Solución:** No es un problema, ignora este error

### PDF no se genera
**Causa:** Error en pdfmake
**Solución:** Verifica la consola del navegador, busca logs con 📄

### PDF se genera pero no se sube
**Causa:** Políticas RLS incorrectas o bucket no público
**Solución:** Verifica que el bucket es público y las políticas están activas

## 📞 Soporte

Si después de seguir todos los pasos sigue sin funcionar:
1. Copia los logs de la consola del navegador
2. Ejecuta `VERIFY_STORAGE_SETUP.sql` y copia los resultados
3. Comparte la información para debugging
