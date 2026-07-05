---
name: budget-wizard
description: "Guía para continuar o modificar el wizard de creación de presupuestos. Cubre arquitectura, flujos, estado Redux, manejo de errores y cómo añadir nuevos steps."
---

# Budget Wizard — alquilandia-dashboard

Wizard de creación de presupuestos en múltiples pasos. Ruta: `/budgets/new`.
Estado actual: **Steps 1, 2, 3 y 4 implementados. Step 5 pendiente.**

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
    actions/users.ts             ← generateBudgetByIdThunk (flow B - usuario existente)
  pages/
    CreateBudgetPage.tsx         ← página contenedora, step indicator, render por step
  components/
    shared/
      CalendarPicker.tsx         ← date picker inline (react-day-picker v9, locale ES)
      PlacesAutocompleteField.tsx ← input + mapa Google Maps (script tag vanilla)
    budgets/wizard/
      BudgetStep1Client.tsx      ← step 1: datos del cliente
      BudgetStep2EventDetails.tsx ← step 2: datos del evento + distancia al almacén
      BudgetStep3Lines.tsx       ← step 3: placeholder (botón Volver implementado)
      ...
```

---

## Estado Redux — `budgetWizardSlice`

```typescript
interface BudgetWizardState {
  step: number;                            // paso actual (1-indexed)
  prefillData: ClientWizardFormData | null; // datos pre-rellenos desde Users table
  budgetId: string | null;                 // MongoDB _id del budget creado
  budget: Budget | null;                   // objeto Budget completo — requerido para updates
  createBudgetRequest: IRequest;           // loading/error step 1
  updateEventDetailsRequest: IRequest;     // loading/error step 2
  finalizeRequest: IRequest;               // loading/error step 5
  unavailableProducts: UnavailableProduct[]; // productos no disponibles (checkout rechazado)
}
```

**Persist**: `key: "budgetWizard"`, blacklist: `["createBudgetRequest", "updateEventDetailsRequest", "fetchCatalogRequest", "fetchStockRequest", "updateLinesRequest", "finalizeRequest", "unavailableProducts", "catalogProducts", "catalogTotal", "catalogPage", "catalogFiltersQuery", "stockByProductId"]`.
Los campos `step`, `budgetId` y `budget` sobreviven a un refresh.

### Acciones del slice

| Acción | Efecto |
|---|---|
| `resetWizard()` | Vuelve a `initialState` — llamar al pulsar "Cancelar" o al navegar tras éxito en step 5 |
| `setPrefillData(data)` | Guarda datos pre-rellenos y pone `step = 1` — **ya no se usa** |
| `setExistingBudget(budget: Budget)` | Guarda el budget completo, pone `step = 2`, limpia `prefillData` — flow B |
| `goBackStep()` | Decrementa `step` en 1 (guard: no baja de 1) — usado en botones "Volver" |
| `goNextStep()` | Incrementa `step` en 1 (guard: no sube de 5) |
| `goToStep(n: number)` | Salta al step n directamente — usado en "Continuar comprando" del step 5 para ir al 3 |
| `clearCreateBudgetError()` | Resetea `createBudgetRequest` a idle |

### Regla crítica: la API requiere el objeto Budget COMPLETO

El endpoint `POST /budgets/:id` espera el objeto `Budget` completo, no un `Partial<Budget>`.
Cada step que actualiza el budget debe hacer `{ ...budget, ...camposNuevos }`.
El `budget` actualizado que devuelve la API se guarda en el slice automáticamente en el `fulfilled` de cada thunk.

---

## Dos flujos de entrada al wizard

### Flujo A — Usuario nuevo (botón "Nuevo presupuesto" en `/budgets`)

1. `dispatch(resetWizard())` + `navigate("/budgets/new")`
2. Se muestra step 1 con formulario vacío
3. Al enviar: `POST /budgets/?isFromWeb=true` con los datos del usuario (rol fijo `CLIENT`)
4. Si OK → `createBudgetThunk.fulfilled` guarda `budget` completo en estado, avanza a `step = 2`

### Flujo B — Usuario existente (botón "Generar presupuesto" en tabla `/users`)

1. `dispatch(resetWizard())` + `dispatch(generateBudgetByIdThunk(user.id))`
2. Endpoint: `POST /users/{user.id}/generateBudget`
3. Si OK → `dispatch(setExistingBudget(result.payload))` + `navigate("/budgets/new")`
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

**Layout**: dos columnas (`lg:grid-cols-3`) — calendario ocupa 1/3, mapa+input+banner de distancia ocupa 2/3.

**Campos del formulario** (RHF + Zod):

| Campo | Componente | Tipo en Budget |
|---|---|---|
| `address` | `PlacesAutocompleteField` | `address: string` |
| `eventDate` | `CalendarPicker` | `eventDate: string` (ISO) |
| `concepto` | `InputField` | `concepto: string` |
| `comments` | `InputField` (textarea) | `comments: string` |
| `commentsalquilandia` | `InputField` (textarea) | `commentsalquilandia: string` |
| `location` | oculto, se rellena con lat/lng del mapa | `location: Location` |
| `distance` | oculto, calculado al seleccionar dirección | `distance: string` |

**Distancia al almacén**:
- Al montar: `dispatch(fetchAllWarehouses())` para tener coordenadas disponibles.
- Al seleccionar dirección en Google Maps (`onLocationChange`): calcula distancia Haversine a todos los warehouses con `use_for_mileage: true`, toma el mínimo.
- Formato: `toLocaleString("es-ES", { maximumFractionDigits: 1 }) + " km"` → e.g. `"18,5 km"`.
- Muestra un banner azul con la distancia calculada. Si no hay distancia, el banner no aparece.

**Submit**: envía `{ ...budget, ...camposDelFormulario }` — objeto completo obligatorio.
Al guardar OK → el slice actualiza `state.budget` con la respuesta y avanza a `step = 3`.

**Pre-relleno al volver del step 3**:
- `defaultValues` se inicializan desde `budget` en el store.
- Fecha ISO → `Date`: función `toEventDate(iso)` — si la ISO empieza por `"0001-"` (fecha cero de Go) devuelve `undefined`.
- `location` con `latitude` vacía → `undefined`.
- `distance` vacía → `undefined` (para no mostrar el banner sin datos reales).
- `PlacesAutocompleteField` sincroniza el DOM input con el prop `value` vía `useEffect`, por lo que el pre-relleno funciona al remontar.

**Conversión de fecha**: `values.eventDate.toISOString()` → ISO UTC. Usar siempre `new Date(year, month, day)` (medianoche local) para que en UTC+2 quede como `T22:00:00Z` del día anterior, que es el formato esperado por la API.

---

## Step 3 — `BudgetStep3Lines` (implementado)

**Cuándo se muestra**: `step === 3`.
**Ruta orquestador**: `src/components/budgets/wizard/BudgetStep3Lines.tsx`
**Componentes hijo** (en `src/components/budgets/wizard/step3/`):
  - `CatalogFilters.tsx` — filtros por categoría/subcategoría/nombre (RHF)
  - `ProductCard.tsx` — tarjeta de producto con mini-form RHF (units+descuento+extras via `useFieldArray`)
  - `ExtrasModal.tsx` — modal de extras con checkbox+units
  - `CartSummary.tsx` — drawer lateral con líneas añadidas + totales sin IVA

**Layout del catálogo**: grid siempre a `sm:2 / lg:3 / xl:4` columnas — el carrito NO reduce el grid.

**Carrito como drawer fijo** (desktop):
  - Botón toggle `fixed right-0 top-1/2` — lengüeta con icono de carrito + badge con número de líneas. Solo visible en `lg:`.
  - Cuando abierto: panel `fixed right-0 top-0 bottom-0 w-80` con scroll propio y cabecera con botón de cierre.
  - En mobile (`lg:hidden`): `CartSummary` apilado debajo del catálogo.

**Totales en `CartSummary`**: NO muestra IVA — muestra "Subtotal sin IVA" = `subTotalWithExtras − userDiscount`. El IVA aparece por primera vez en el step 4 (donde ya se suman costSend y cupón).

**Estado Redux nuevo** en `BudgetWizardState`:
  - `catalogProducts`, `catalogTotal`, `catalogPage`, `catalogFiltersQuery` — catálogo paginado
  - `stockByProductId: Record<string, number>` — unidades bloqueadas por producto (página actual)
  - `fetchCatalogRequest`, `fetchStockRequest`, `updateLinesRequest` — todos blacklisteados de persist

**Thunks nuevos** (en `src/redux/actions/budgets.ts`):
  - `fetchBudgetCatalogThunk` ("budgetWizard/fetchCatalog") → `GET /budgets/{id}/paginatedProducts`
  - `fetchCatalogStockThunk` ("budgetWizard/fetchStock") → `Promise.all` de `GET /inventory/{id}/stock?budgetId=` → `Record<id, number>`
  - `updateBudgetLinesThunk` ("budgetWizard/updateLines") → `POST /budgets/{id}` con Budget completo

**Regla crítica de `updateLines`**: el `fulfilled` solo hace `state.budget = payload`, **NO avanza `state.step`**. El step avanza con el reducer síncrono `goNextStep()`.

**Reducer síncrono nuevo**: `goNextStep()` (guard `step < 5`) — exportado desde `budgetWizardSlice`.

**Helpers puros** (en `src/helpers/budgetLines.ts`, todos testeados en `src/tests/budgetLines.test.ts`):
  - `getExceptionPrice(product, eventDate)` — precio con excepción de fecha (sin moment)
  - `buildBudgetLine(product, units, descuento, extras, unitPrice)` — mapea Inventory→BudgetLine
  - `upsertBudgetLine(budget, product, opts, shippingCosts?)` — añade/actualiza sin duplicar, merge OR de extras
  - `removeBudgetLine(budget, lineId, shippingCosts?)` y `setBudgetLineUnits(budget, lineId, units, shippingCosts?)` — recalculan
  - `recalculatePrice(budget, shippingCosts?)` — canónico; sin `shippingCosts` conserva `prevPrice.costSend` (compat. step 3)

**Dominio descuentos** creado completo: `src/types/discounts.ts`, `src/services/discountsService.ts`, `src/redux/actions/discounts.ts`, `src/redux/slices/discountsSlice.ts`. Registrado en store sin persist.

**Disponibilidad por card**: `unidades − stockByProductId[id] − unitsEnBudgetLines`. El stock se pide en batch al cambiar página (0 GETs extra por operación de carrito).

**Navegación**: los botones Volver y Continuar están en el header de `CreateBudgetPage` (ver sección correspondiente). El step 3 no tiene panel de navegación propio.

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
- Input uncontrolled (ref) para no conflictuar con las mutaciones de DOM de Google. Sincroniza el DOM input con el prop `value` vía `useEffect` — el pre-relleno al remontar funciona.
- Props: `value`, `onChange: (value: string) => void`, `onLocationChange?: (loc) => void`, `onBlur`, `label`, `name`, `error`, `required`, `disabled`.
- Para conectar con RHF Controller: `onChange={(val) => field.onChange(val)}` (no pasar `field.onChange` directamente).

---

## `CreateBudgetPage` — contenedora del wizard

```tsx
{step === 1 && <BudgetStep1Client />}
{step === 2 && <BudgetStep2EventDetails />}
{step === 3 && <BudgetStep3Lines />}
{step === 4 && <BudgetStep4Summary />}
```

**Header de navegación** (`src/pages/CreateBudgetPage.tsx`):
- Layout: `[Title + step]  ····  [Volver] [Continuar]  │  [Cancelar🔴]`
- **Cancelar**: `variant="danger"` (rojo), separado de los otros dos por `border-l` con margen. Siempre visible en todos los steps.
- **Volver + Continuar**: solo visibles cuando `step >= 3` (steps 1 y 2 usan sus propios botones de formulario). Leídos del wizard state:
  - `hasLines = (budget?.budgetLines?.length ?? 0) > 0`
  - `isSaving = updateLinesRequest.inProgress`
  - Continuar disabled si `!hasLines || isSaving`
- **Regla**: los steps 3 y 4 NO tienen panel de navegación propio al pie — toda la nav vive aquí.
- Barra de progreso: 5 segmentos, los `<= step` en azul.
- `TOTAL_STEPS = 5` — ajustar cuando se confirme el número final.

---

---

## Step 4 — `BudgetStep4Summary` (implementado)

**Cuándo se muestra**: `step === 4`.
**Ruta orquestador**: `src/components/budgets/wizard/BudgetStep4Summary.tsx`
**Componentes hijo** (en `src/components/budgets/wizard/step4/`):
  - `SummaryHeader.tsx` — fecha del evento (DD-MM-YYYY), dirección/nosend, datos del cliente
  - `SummaryOptions.tsx` — toggles "Recogida en tienda" (nosend) y "Con IVA" (solo admin/técnico)
  - `SummaryAmounts.tsx` — desglose artículos, extras, envío, descuento cliente, IVA, Total
  - `SummaryLineRow.tsx` — fila editable: +/− unidades (clamp por stock), select descuento (admin), Extras vía `ExtrasModal` reutilizado del step 3, quitar línea

**Recálculo canónico** — `recalculatePrice(budget, shippingCosts?)` en `src/helpers/budgetLines.ts`:
  - `shippingCosts = undefined` → conserva `prevPrice.costSend` (compatible con step 3)
  - `shippingCosts = null | ShippingCost` → llama `calculateCostSend` (step 4)
  - `calculateCostSend`: parsea `"18,5 km"` con coma decimal; maxBlock/hasMultipleBlocks → variante Zero, NotZero o ambas
  - Descuento aplicado: `userDiscount` del cliente (porcentaje sobre `subTotal − packs`)
  - Base del IVA: `subTotalWithExtras + costSend − userDiscount`

**Flujo de mutaciones** (todas → `updateBudgetLinesThunk` → POST Budget completo → fulfilled actualiza `state.budget` sin avanzar step):
  - Líneas: `updateBudgetLineValues(budget, lineId, patch, shippingCosts)` → POST
  - Quitar: `removeBudgetLine(budget, lineId, shippingCosts)` → POST
  - Nosend: `recalculatePrice({ ...budget, nosend: !nosend }, shippingCosts)` → POST
  - IVA: `recalculatePrice({ ...budget, price: { ...price, withIVA: !withIVA } }, shippingCosts)` → POST

**Helpers** exportados de `src/helpers/budgetLines.ts` (testeados en `src/tests/budgetLines.step4.test.ts`):
  - `calculateCostSend(budget, shippingCosts)` — paridad `calculateAndGetCostSend` legacy
  - `getAppliedDiscount(budget)` — devuelve `userDiscount`; usado por `SummaryAmounts`
  - `updateBudgetLineValues(budget, lineId, patch, shippingCosts?)` — mutación unificada para step 4

**Constantes** en `src/constants/index.ts`: `MIN_BUDGET_AMOUNT = 40`, `VAT_FACTOR = 0.21`.

**Aviso mínimo**: `Alert` si `subTotalWithExtras <= MIN_BUDGET_AMOUNT` (no bloquea "Continuar" — dashboard = admin).

**Navegación**: los botones Volver y Continuar están en el header de `CreateBudgetPage` (ver sección correspondiente). El step 4 no tiene panel de navegación propio.

---

## Step 5 — `BudgetStep5Checkout` (implementado)

**Cuándo se muestra**: `step === 5`.
**Ruta orquestador**: `src/components/budgets/wizard/BudgetStep5Checkout.tsx`
**Componentes hijo** (en `src/components/budgets/wizard/step5/`):
  - `CheckoutSummary.tsx` — nº presupuesto, cliente, fecha evento, nº artículos, total
  - `TransferPanel.tsx` — IBAN + importe del 25% + botón confirmar
  - `AlquilandiaPanel.tsx` — "Dejar reservado" y "Marcar como pagado 25%" (solo ADMIN/TECHNICIAN)

**Acciones disponibles**:
  - **Continuar comprando** → `dispatch(goToStep(3))` — vuelve al catálogo sin perder el carrito
  - **Archivar** → `dispatch(budgetWizardArchiveThunk({ budgetId, data: { ...budget, status: "PAID_PENDING" } }))` → estado `PAID_PENDING`
  - **Transferencia bancaria** → panel expandible → `budgetWizardCheckoutThunk({ budgetId, paymentType: "TRANSFER_PAID" })` → estado `TRANSFER_PAID`
  - **Pago Alquilandia** (solo ADMIN/TECH) → panel expandible:
    - "Dejar reservado" → `paymentType: "RESERVED"` → estado `RESERVED`
    - "Marcar como pagado 25%" → `paymentType: "PAID25"` → estado `PAID25`

**Tras éxito**: `useEffect` observa `finalizeRequest.ok` → `dispatch(resetWizard())` + `navigate("/budgets")`

**Productos no disponibles**: si el checkout rechaza con `PRODUCTS_UNAVAILABLE`, `unavailableProducts[]` se guarda en el estado y se muestra en el `Alert` junto a `finalizeRequest.messages`.

**Constantes usadas** (`src/constants/index.ts`): `CAIXA_ACCOUNT`, `INITIAL_PAYMENT_FACTOR = 0.25`

**Thunks del wizard** (`src/redux/actions/budgets.ts`):
  - `budgetWizardCheckoutThunk` ("budgetWizard/checkout") — POST `/budgets/{id}/alquilandiaCheckout?paymentType=`
  - `budgetWizardArchiveThunk` ("budgetWizard/archive") — POST `/budgets/{id}` con budget completo + `status: "PAID_PENDING"`

**Navegación**: el header de `CreateBudgetPage` muestra solo "Volver" para step 5 (`showContinuar = step >= 3 && step < 5`). Step 5 gestiona su propio flujo de navegación post-acción.

---

## Cómo añadir un nuevo step

1. **Crear** `src/components/budgets/wizard/BudgetStep{N}*.tsx`
   - Leer `budget` y `budgetId` del wizard state
   - Submit: `{ ...budget, ...camposNuevos }` — siempre objeto completo
   - **No añadir botones de Volver/Continuar** — la navegación vive en `CreateBudgetPage`
2. **Añadir** `{N}Request: IRequest` a `BudgetWizardState` + blacklist en `store.ts`
3. **Añadir** thunk dedicado en `src/redux/actions/budgets.ts` (no reutilizar thunks genéricos — el slice escucha por action type)
4. **Añadir** `extraReducers` en `budgetWizardSlice` para pending/fulfilled/rejected (guardar `state.budget = action.payload` en fulfilled)
5. **Renderizar** en `CreateBudgetPage` con `{step === N && <BudgetStep{N} />}`
6. Si el step necesita condición especial en el botón Continuar, añadirla en `CreateBudgetPage` leyendo el wizard state
7. **Actualizar esta skill** con los detalles del nuevo step

---

## Convenciones específicas del wizard

- El `budgetId` almacenado es el MongoDB `_id` del budget (`budget.id`), no el `budgetId` UUID
- Siempre hacer `dispatch(resetWizard())` antes de entrar al wizard desde cero
- Los steps no navegan a rutas distintas — todo vive en `/budgets/new`; el step se controla por Redux
- No usar `useState` para el progreso entre steps — siempre Redux para que sobreviva al refresh
- Thunks de wizard: action type `"budgetWizard/accion"` para que el slice los diferencie de thunks generales
- **La API espera el objeto Budget COMPLETO** en cada POST — nunca mandar solo los campos nuevos

---

## Steps

| Step | Descripción | Estado |
|---|---|---|
| 1 | Datos del cliente | ✅ Implementado |
| 2 | Datos del evento (dirección, fecha, concepto, observaciones, distancia al almacén) | ✅ Implementado |
| 3 | Selección de artículos (carrito) — productos simples, extras, descuentos por línea | ✅ Implementado |
| 4 | Resumen del presupuesto — edición de carrito, costSend, nosend, IVA, descuento cliente | ✅ Implementado |
| 5 | Finalización — archivar, transferencia bancaria, pago Alquilandia (RESERVED/PAID25) | ✅ Implementado |
