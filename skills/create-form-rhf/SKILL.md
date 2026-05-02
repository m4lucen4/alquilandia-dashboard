---
name: create-form-rhf
description: Crea o modifica formularios con React Hook Form + Zod siguiendo los patrones del proyecto. Invocar cuando el usuario pida crear un formulario, añadir validación, crear un modal con campos, o migrar un formulario controlado a RHF.
disable-model-invocation: false
---

# Skill: create-form-rhf

Crea o modifica formularios usando **React Hook Form + Zod** siguiendo los patrones del proyecto.

## Implementación de referencia
`src/components/users/ModalMassiveEmail.tsx`

---

## Patrón completo

### 1. Definir el schema Zod
```ts
import { z } from "zod";

const mySchema = z.object({
  name: z.string().min(1, "Obligatorio"),
  email: z.string().email("Email inválido"),
  // campo opcional con validación condicional:
  url: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^https?:\/\/.+/.test(val),
      "URL inválida",
    ),
  // file upload:
  file: z.instanceof(File).optional(),
});

export type MyFormValues = z.infer<typeof mySchema>;
```

### 2. Inicializar el form
```ts
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const { control, handleSubmit, reset, formState: { errors } } =
  useForm<MyFormValues>({
    resolver: zodResolver(mySchema),
    defaultValues: {
      name: "",
      email: "",
      url: "",
    },
  });
```

### 3. Campos de texto y textarea — `Controller` + `InputField`
```tsx
<Controller
  name="name"
  control={control}
  render={({ field }) => (
    <InputField
      label="Nombre"
      name={field.name}
      value={field.value ?? ""}
      onChange={field.onChange}
      onBlur={field.onBlur}
      required
      error={errors.name?.message}
      placeholder="..."
    />
  )}
/>

// Textarea: añadir as="textarea" rows={N}
<Controller
  name="body"
  control={control}
  render={({ field }) => (
    <InputField
      label="Descripción"
      name={field.name}
      value={field.value ?? ""}
      onChange={field.onChange}
      onBlur={field.onBlur}
      as="textarea"
      rows={4}
      error={errors.body?.message}
    />
  )}
/>
```

### 4. Select — `Controller` + `SelectField`
```tsx
<Controller
  name="type"
  control={control}
  render={({ field }) => (
    <SelectField
      label="Tipo"
      name={field.name}
      value={field.value ?? ""}
      onChange={field.onChange}
      options={options}
      error={errors.type?.message}
    />
  )}
/>
```

### 5. File input — `Controller` + input nativo
```tsx
<Controller
  name="file"
  control={control}
  render={({ field: { onChange } }) => (
    <div>
      <label className="block text-sm/6 font-medium text-gray-900">
        Archivo
      </label>
      <div className="mt-2">
        <input
          type="file"
          onChange={(e) => onChange(e.target.files?.[0])}
          className="block w-full text-sm text-gray-600 file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-blue-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-blue-600 hover:file:bg-blue-100"
        />
      </div>
      {errors.file && (
        <p className="mt-2 text-sm text-red-600">
          {errors.file.message as string}
        </p>
      )}
    </div>
  )}
/>
```

### 6. Submit — `handleSubmit` en el `<form>`
```tsx
<form onSubmit={handleSubmit(onSubmit)} noValidate>
  {/* campos */}
  <Button
    title="Guardar"
    onClick={() => {}}
    type="submit"
    loading={isSaving}
  />
</form>
```

El botón de submit usa `onClick={() => {}}` (noop) porque el submit lo gestiona el `<form>`.

### 7. Reset al cerrar un modal
```ts
useEffect(() => {
  if (!isOpen) reset();
}, [isOpen, reset]);
```

---

## Patrones de validación Zod frecuentes

| Caso | Schema |
|---|---|
| Obligatorio | `z.string().min(1, "Obligatorio")` |
| Email | `z.string().email("Email inválido")` |
| URL opcional | `z.string().optional().refine((v) => !v \|\| /^https?:\/\/.+/.test(v), "URL inválida")` |
| Número positivo | `z.number().positive("Debe ser positivo")` |
| Número desde string | `z.preprocess((v) => Number(v), z.number().min(0))` |
| Enum | `z.enum(["A", "B", "C"])` |
| File opcional | `z.instanceof(File).optional()` |
| Array no vacío | `z.array(z.string()).min(1, "Selecciona al menos uno")` |

---

## Reglas del proyecto

- **Nunca** usar `any` en el tipo del schema ni en el handler
- El tipo de los valores del form **siempre** se infiere del schema: `z.infer<typeof schema>`
- Los `defaultValues` deben cubrir todos los campos para evitar uncontrolled→controlled warnings
- En modales: `<form noValidate>` y reset via `useEffect` con `isOpen`
- El `onSubmit` del modal recibe `FormValues` tipado; el padre hace el `dispatch`
- Para campos con lógica condicional compleja usar `watch` de RHF, no `useState`
