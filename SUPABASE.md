# Integración con Supabase

Este proyecto está integrado con Supabase para Database (PostgreSQL) y Storage.

## Configuración Inicial

### 1. Obtener las credenciales de Supabase

1. Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. En el menú lateral, ve a **Settings** > **API**
3. Copia los valores de:
   - **Project URL** (ejemplo: `https://xxx.supabase.co`)
   - **anon public key** (empieza con `eyJ...`)

### 2. Configurar las variables de entorno

Edita el archivo `.env` en la raíz del proyecto y agrega tus credenciales:

```env
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_anon_key
```

### 3. Reiniciar el servidor de desarrollo

Después de configurar las variables, reinicia el servidor:

```bash
pnpm dev
```

## Uso de la Base de Datos

### Operaciones CRUD básicas

```typescript
import { getRecords, getRecordById, insertRecord, updateRecord, deleteRecord } from '@/services/supabase';

// Obtener todos los registros
const users = await getRecords('users');

// Obtener un registro por ID
const user = await getRecordById('users', '123');

// Insertar un nuevo registro
const newUser = await insertRecord('users', {
  email: 'test@example.com',
  name: 'Test User'
});

// Actualizar un registro
const updated = await updateRecord('users', '123', {
  name: 'Updated Name'
});

// Eliminar un registro
await deleteRecord('users', '123');
```

### Queries personalizadas

```typescript
import { queryRecords } from '@/services/supabase';

// Query con filtros y ordenamiento
const activeUsers = await queryRecords('users', (query) =>
  query
    .select('id, email, name, created_at')
    .eq('active', true)
    .order('created_at', { ascending: false })
    .limit(10)
);

// Query con joins (relaciones)
const ordersWithCustomers = await queryRecords('orders', (query) =>
  query
    .select(`
      id,
      total,
      customer:customers (
        name,
        email
      )
    `)
);
```

## Uso de Storage

### Subir archivos

```typescript
import { uploadFile, getPublicUrl } from '@/services/supabase';

// Subir un archivo
const handleFileUpload = async (file: File) => {
  try {
    // Generar un nombre único para el archivo
    const fileName = `${Date.now()}-${file.name}`;

    // Subir el archivo
    const path = await uploadFile('avatars', fileName, file, {
      contentType: file.type,
      upsert: false
    });

    // Obtener la URL pública
    const url = getPublicUrl('avatars', path);

    console.log('Archivo subido:', url);
    return url;
  } catch (error) {
    console.error('Error al subir archivo:', error);
    throw error;
  }
};
```

### Listar archivos

```typescript
import { listFiles } from '@/services/supabase';

// Listar archivos de un bucket
const files = await listFiles('documents', 'invoices/2024', {
  limit: 50,
  sortBy: { column: 'created_at', order: 'desc' }
});

console.log('Archivos:', files);
```

### Eliminar archivos

```typescript
import { deleteFile } from '@/services/supabase';

// Eliminar un archivo
await deleteFile('avatars', 'user-123.jpg');

// Eliminar múltiples archivos
await deleteFile('avatars', ['user-123.jpg', 'user-456.jpg']);
```

### URLs firmadas (archivos privados)

```typescript
import { createSignedUrl } from '@/services/supabase';

// Crear una URL temporal para un archivo privado (válida por 1 hora)
const signedUrl = await createSignedUrl('private-docs', 'contract.pdf', 3600);

// Usar la URL (expira en 1 hora)
window.open(signedUrl, '_blank');
```

## Generar Tipos TypeScript

Puedes generar tipos automáticamente desde tu base de datos:

### Opción 1: Usando la CLI de Supabase

```bash
# Instalar la CLI (si no la tienes)
npm install -g supabase

# Login
supabase login

# Linkear tu proyecto
supabase link --project-ref tu-project-ref

# Generar tipos
supabase gen types typescript --linked > src/types/supabase.ts
```

### Opción 2: Usando npx

```bash
npx supabase gen types typescript --project-id tu-project-id > src/types/supabase.ts
```

## Estructura de Archivos

```
src/
├── config/
│   └── supabase.ts          # Configuración del cliente
├── services/
│   └── supabase/
│       ├── index.ts         # Exportaciones centralizadas
│       ├── database.ts      # Servicios de base de datos
│       └── storage.ts       # Servicios de storage
└── types/
    └── supabase.ts          # Tipos de la base de datos
```

## Crear Buckets en Supabase

Antes de usar Storage, necesitas crear buckets:

1. Ve a **Storage** en el dashboard de Supabase
2. Click en **Create bucket**
3. Configura:
   - **Name**: Nombre del bucket (ej: `avatars`, `documents`)
   - **Public**: Marca si quieres que sea público
   - **File size limit**: Límite de tamaño (opcional)

### Ejemplo de políticas de seguridad (RLS)

Para un bucket público de avatares:

```sql
-- Permitir lectura pública
CREATE POLICY "Public avatars are viewable by everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Permitir subida autenticada
CREATE POLICY "Users can upload avatars"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars');
```

## Acceso Directo al Cliente

Si necesitas funcionalidades avanzadas no cubiertas por los servicios:

```typescript
import { supabase } from '@/config/supabase';

// Usar el cliente directamente
const { data, error } = await supabase
  .from('users')
  .select('*')
  .ilike('name', '%john%');
```

## Recursos

- [Documentación de Supabase](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Database Queries](https://supabase.com/docs/guides/database/overview)
- [Storage Guide](https://supabase.com/docs/guides/storage)
