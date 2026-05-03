---
name: budget-wizard
description: "Guía para continuar o modificar el wizard de creación de presupuestos. Cubre arquitectura, flujos, estado Redux, manejo de errores y cómo añadir nuevos steps."
---

# Budget Wizard — alquilandia-dashboard

Wizard de creación de presupuestos en múltiples pasos. Ruta: `/budgets/new`.
Estado actual: **Step 1 implementado. Steps 2-5 pendientes.**

---

## Arquitectura de archivos

```
src/
  types/
    budgetWizard.ts              ← BudgetWizardState, ClientWizardFormData
  redux/
    slices/budgetWizardSlice.ts  ← slice del wizard con persist propio
    actions/budgets.ts           ← createBudgetThunk (step 1 - nuevo usuario)
    actions/users.ts             ← generateBudgetByIdThunk (step 1 - usuario existente)
  pages/
    CreateBudgetPage.tsx         ← página contenedora, step indicator, render por step
  components/budgets/wizard/
    BudgetStep1Client.tsx        ← step 1: formulario datos del cliente
    BudgetStep2*.tsx             ← (pendiente)
    ...
```

---

## Estado Redux — `budgetWizardSlice`

```typescript
interface BudgetWizardState {
  step: number;                        // paso actual (1-indexed)
  prefillData: ClientWizardFormData | null;  // datos pre-rellenos desde Users table (no usado en steps 2+)
  budgetId: string | null;             // MongoDB _id del budget creado
  createBudgetRequest: IRequest;       // loading/error del paso de creación
}
```

**Persist**: `key: "budgetWizard"`, blacklist: `["createBudgetRequest"]`.
Los campos `step`, `prefillData` y `budgetId` sobreviven a un refresh.

### Acciones del slice

| Acción | Efecto |
|---|---|
| `resetWizard()` | Vuelve a `initialState` — llamar al pulsar "Cancelar" o "Nuevo presupuesto" |
| `setPrefillData(data)` | Guarda datos pre-rellenos y pone `step = 1` — **ya no se usa** (ver flujo existente) |
| `setExistingBudget(budgetId)` | Pone `budgetId`, `step = 2`, limpia `prefillData` — usado cuando el budget ya existe |
| `clearCreateBudgetError()` | Resetea `createBudgetRequest` a idle |

---

## Dos flujos de entrada al wizard

### Flujo A — Usuario nuevo (botón "Nuevo presupuesto" en `/budgets`)

1. `dispatch(resetWizard())` + `navigate("/budgets/new")`
2. Se muestra step 1 con formulario vacío
3. Al enviar: `POST /budgets/?isFromWeb=true` con los datos del usuario (rol fijo `CLIENT`)
4. Si OK → `budgetWizardSlice` captura `createBudgetThunk.fulfilled`, guarda `budget.id`, avanza a `step = 2`
5. `CreateBudgetPage` renderiza el componente del step 2

### Flujo B — Usuario existente (botón "Generar presupuesto" en tabla `/users`)

1. `dispatch(resetWizard())` + `dispatch(generateBudgetByIdThunk(user.id))`
2. Endpoint: `POST /users/{user.id}/generateBudget`
3. Devuelve un `Budget` completo con `userEmailHash` y `technicianEmailHash` (hash del admin logado) ya asignados
4. Si OK → `dispatch(setExistingBudget(result.payload.id))` + `navigate("/budgets/new")`
5. El wizard arranca directamente en `step = 2` — **el step 1 no se muestra**

---

## Step 1 — `BudgetStep1Client`

**Cuándo se muestra**: solo cuando `step === 1` (Flujo A).

**Campos del formulario** (RHF + Zod, sin `role` ni `password`):
`firstName`, `lastName`, `email`, `phone`, `phone2`, `dnif`, `address`, `population`, `locality`, `zipCode`, `company` (opcional)

**Datos enviados al backend**: todos los campos + `role: "CLIENT"` (hardcoded), `company: null` si vacía.

**Manejo de errores de la API**:

| Código | Comportamiento |
|---|---|
| `USER_ALREADY_EXISTS` | Modal: "Este usuario ya existe, vaya a la tabla de usuarios y genere el presupuesto" + botones Cancelar / "Ir a usuarios" |
| `USER_IS_PROBLEMATIC` | Mismo modal (el usuario existe y es problemático → mismo flujo) |
| `UNKNOWN` | Mensaje de error en rojo bajo el formulario |

El `budgetWizardSlice` pone `createBudgetRequest = requestIdle` para `USER_ALREADY_EXISTS` y `USER_IS_PROBLEMATIC` (no se muestra error, el modal lo gestiona el componente).

---

## `CreateBudgetPage` — contenedora del wizard

```tsx
// Render por step:
{step === 1 && <BudgetStep1Client />}
{step === 2 && <BudgetStep2*** />}
// ...
```

- Botón "Cancelar": `dispatch(resetWizard())` + `navigate("/budgets")`
- Barra de progreso: 5 segmentos, los `<= step` en azul
- `TOTAL_STEPS = 5` — ajustar cuando se confirme el número final

---

## Cómo añadir un nuevo step

1. **Crear** `src/components/budgets/wizard/BudgetStep{N}*.tsx`
   - Leer `budgetId` del wizard state: `useAppSelector(state => state.budgetWizard.budgetId)`
   - Al completar el step: dispatch de la acción correspondiente + avanzar `step` vía el slice
2. **Añadir extraReducers** en `budgetWizardSlice` si el step llama a un thunk nuevo
3. **Renderizar** en `CreateBudgetPage` con `{step === N && <BudgetStep{N} />}`
4. **Actualizar esta skill** con los detalles del nuevo step

---

## Convenciones específicas del wizard

- El `budgetId` almacenado es el MongoDB `_id` del budget (`budget.id`), no el `budgetId` UUID
- Siempre hacer `dispatch(resetWizard())` antes de entrar al wizard desde cero
- Los steps no navegan a rutas distintas — todo vive en `/budgets/new`; el step se controla por Redux
- No usar `useState` para el progreso entre steps — siempre Redux para que sobreviva al refresh

---

## Steps planificados (pendientes)

| Step | Descripción | Estado |
|---|---|---|
| 1 | Datos del cliente | ✅ Implementado |
| 2 | — | 🔲 Pendiente |
| 3 | — | 🔲 Pendiente |
| 4 | — | 🔲 Pendiente |
| 5 | — | 🔲 Pendiente |
