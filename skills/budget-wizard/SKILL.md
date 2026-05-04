---
name: budget-wizard
description: "Guía para continuar o modificar el wizard de creación de presupuestos. Cubre arquitectura, flujos, estado Redux, manejo de errores y cómo añadir nuevos steps."
---

# Budget Wizard — alquilandia-dashboard

Wizard de creación de presupuestos en múltiples pasos. Ruta: `/budgets/new`.
Estado actual: **Steps 1 y 2 implementados. Steps 3-5 pendientes.**

---

## Arquitectura de archivos

```
src/
  types/
    budgetWizard.ts              ← BudgetWizardState, ClientWizardFormData
  redux/
    slices/budgetWizardSlice.ts  ← slice del wizard con persist propio
    actions/budgets.ts           ← createBudgetThunk (step 1)
                                    updateBudgetEventDetailsThunk (step 2)
    actions/users.ts             ← generateBudgetByIdThunk (step 1 - usuario existente)
  pages/
    CreateBudgetPage.tsx         ← página contenedora, step indicator, render por step
  components/
    shared/
      CalendarPicker.tsx         ← date picker inline (react-day-picker v9, locale ES)
      PlacesAutocompleteField.tsx ← input + mapa Google Maps (script tag vanilla)
    budgets/wizard/
      BudgetStep1Client.tsx      ← step 1: datos del cliente
      BudgetStep2EventDetails.tsx ← step 2: datos del evento
      BudgetStep3*.tsx           ← (pendiente)
      ...
```

---

## Estado Redux — `budgetWizardSlice`

```typescript
interface BudgetWizardState {
  step: number;                            // paso actual (1-indexed)
  prefillData: ClientWizardFormData | null; // datos pre-rellenos desde Users table
  budgetId: string | null;                 // MongoDB _id del budget creado
  createBudgetRequest: IRequest;           // loading/error step 1
  updateEventDetailsRequest: IRequest;     // loading/error step 2
}
```

**Persist**: `key: "budgetWizard"`, blacklist: `["createBudgetRequest", "updateEventDetailsRequest"]`.
Los campos `step`, `prefillData` y `budgetId` sobreviven a un refresh.

### Acciones del slice

| Acción | Efecto |
|---|---|
| `resetWizard()` | Vuelve a `initialState` — llamar al pulsar "Cancelar" o "Nuevo presupuesto" |
| `setPrefillData(data)` | Guarda datos pre-rellenos y pone `step = 1` — **ya no se usa** |
| `setExistingBudget(budgetId)` | Pone `budgetId`, `step = 2`, limpia `prefillData` — usado cuando el budget ya existe |
| `clearCreateBudgetError()` | Resetea `createBudgetRequest` a idle |

---

## Dos flujos de entrada al wizard

### Flujo A — Usuario nuevo (botón "Nuevo presupuesto" en `/budgets`)

1. `dispatch(resetWizard())` + `navigate("/budgets/new")`
2. Se muestra step 1 con formulario vacío
3. Al enviar: `POST /budgets/?isFromWeb=true` con los datos del usuario (rol fijo `CLIENT`)
4. Si OK → `budgetWizardSlice` captura `createBudgetThunk.fulfilled`, guarda `budget.id`, avanza a `step = 2`

### Flujo B — Usuario existente (botón "Generar presupuesto" en tabla `/users`)

1. `dispatch(resetWizard())` + `dispatch(generateBudgetByIdThunk(user.id))`
2. Endpoint: `POST /users/{user.id}/generateBudget`
3. Si OK → `dispatch(setExistingBudget(result.payload.id))` + `navigate("/budgets/new")`
4. El wizard arranca directamente en `step = 2` — **el step 1 no se muestra**

---

## Step 1 — `BudgetStep1Client`

**Cuándo se muestra**: solo cuando `step === 1` (Flujo A).

**Campos del formulario** (RHF + Zod):
`firstName`, `lastName`, `email`, `phone`, `phone2`, `dnif`, `address`, `population`, `locality`, `zipCode`, `company` (opcional)

**Datos enviados al backend**: todos los campos + `role: "CLIENT"` (hardcoded), `company: null` si vacía.

**Endpoint**: `POST /budgets/?isFromWeb=true` (body: FormData con clave `user`)

**Manejo de errores**:

| Código | Comportamiento |
|---|---|
| `USER_ALREADY_EXISTS` | Modal + botón "Ir a usuarios" |
| `USER_IS_PROBLEMATIC` | Mismo modal |
| `UNKNOWN` | Mensaje rojo bajo el formulario |

---

## Step 2 — `BudgetStep2EventDetails`

**Cuándo se muestra**: `step === 2` (ambos flujos).

**Layout**: dos columnas (`lg:grid-cols-3`) — calendario ocupa 1/3, mapa+input ocupa 2/3.

**Campos del formulario** (RHF + Zod):

| Campo | Componente | Tipo en Budget |
|---|---|---|
| `address` | `PlacesAutocompleteField` | `address: string` |
| `eventDate` | `CalendarPicker` | `eventDate: string` (ISO) |
| `concepto` | `InputField` | `concepto: string` |
| `comments` | `InputField` (textarea) | `comments: string` |
| `commentsalquilandia` | `InputField` (textarea) | `commentsalquilandia: string` |
| `location` | oculto, se rellena con lat/lng del mapa | `location: Location` |

**Endpoint**: `POST /budgets/:id` (body: `Partial<Budget>`) via `updateBudgetEventDetailsThunk`.

Al guardar OK → el slice avanza a `step = 3`.

**Conversión de fecha**: `values.eventDate.toISOString()` → ISO UTC. Usar siempre `new Date(year, month, day)` (medianoche local) para que en UTC+2 quede como `T22:00:00Z` del día anterior, que es el formato esperado por la API.

---

## Componentes shared creados para el wizard

### `CalendarPicker`

- Calendario inline siempre visible (no popup).
- `react-day-picker` v9 con locale ES importado de `react-day-picker/locale` (NO de `date-fns/locale` — no está instalado como dependencia directa).
- Formato de fecha con `Intl.DateTimeFormat` nativo (no `date-fns/format`).
- Acento azul via CSS vars: `--rdp-accent-color: #2563eb`.
- Props: `value: Date | undefined`, `onChange`, `label`, `name`, `error`, `required`, `disabled`.

### `PlacesAutocompleteField`

- Input con Google Maps Places Autocomplete + mapa embebido encima.
- **Carga el script de Maps con un `<script>` tag dinámico** (singleton `mapsLoadPromise`). NO usar `@googlemaps/js-api-loader` — su v2 tiene comportamiento diferente y causó el error "This page can't load Google Maps correctly".
- API key: `import.meta.env.VITE_GOOGLE_MAPS_API_KEY`.
- Mapa centrado en Sevilla por defecto (lat: 37.38, lng: -5.99). Al seleccionar lugar, centra el mapa y añade `google.maps.Marker`.
- Input uncontrolled (ref) para no conflictuar con las mutaciones de DOM de Google.
- Props: `value`, `onChange: (value: string) => void`, `onLocationChange?: (loc) => void`, `onBlur`, `label`, `name`, `error`, `required`, `disabled`.
- Para conectar con RHF Controller: `onChange={(val) => field.onChange(val)}` (no pasar `field.onChange` directamente).

---

## `CreateBudgetPage` — contenedora del wizard

```tsx
{step === 1 && <BudgetStep1Client />}
{step === 2 && <BudgetStep2EventDetails />}
{step === 3 && <BudgetStep3*** />}
// ...
```

- Botón "Cancelar": `dispatch(resetWizard())` + `navigate("/budgets")`
- Barra de progreso: 5 segmentos, los `<= step` en azul
- `TOTAL_STEPS = 5` — ajustar cuando se confirme el número final

---

## Cómo añadir un nuevo step

1. **Crear** `src/components/budgets/wizard/BudgetStep{N}*.tsx`
   - Leer `budgetId` del wizard state: `useAppSelector(state => state.budgetWizard.budgetId)`
   - Al completar: dispatch del thunk correspondiente → el slice avanza el step vía `extraReducers`
2. **Añadir** `{N}Request: IRequest` a `BudgetWizardState` + blacklist en `store.ts`
3. **Añadir** thunk dedicado en `src/redux/actions/budgets.ts` (no reutilizar thunks genéricos — el slice escucha por action type)
4. **Añadir** `extraReducers` en `budgetWizardSlice` para pending/fulfilled/rejected
5. **Renderizar** en `CreateBudgetPage` con `{step === N && <BudgetStep{N} />}`
6. **Actualizar esta skill** con los detalles del nuevo step

---

## Convenciones específicas del wizard

- El `budgetId` almacenado es el MongoDB `_id` del budget (`budget.id`), no el `budgetId` UUID
- Siempre hacer `dispatch(resetWizard())` antes de entrar al wizard desde cero
- Los steps no navegan a rutas distintas — todo vive en `/budgets/new`; el step se controla por Redux
- No usar `useState` para el progreso entre steps — siempre Redux para que sobreviva al refresh
- Thunks de wizard: action type `"budgetWizard/accion"` para que el slice los diferencie de thunks generales

---

## Steps

| Step | Descripción | Estado |
|---|---|---|
| 1 | Datos del cliente | ✅ Implementado |
| 2 | Datos del evento (dirección, fecha, concepto, observaciones) | ✅ Implementado |
| 3 | — | 🔲 Pendiente |
| 4 | — | 🔲 Pendiente |
| 5 | — | 🔲 Pendiente |
