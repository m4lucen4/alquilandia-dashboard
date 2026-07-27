---
name: pdf-generation
description: "Cómo trabajar con PDFs en este proyecto: estructura, funciones, flujo de subida y gotchas. Leer antes de modificar o añadir cualquier generación de PDF."
---

# PDF Generation — alquilandia-dashboard

## Librería
`jsPDF` + `jspdf-autotable`. Todo en `src/services/pdfService.ts`.

## Dos generadores

### `generateInvoicePDF(invoice: Invoice): Promise<Blob>`
- `invoice` ya lleva `business`, `invoices_type`, `taxes_type` y `original_invoice` embebidos (se obtienen con join antes de llamar)
- Renderiza bloque rojo de factura rectificativa si `invoice.is_corrective === true`
- Renderiza bloque naranja "FACTURA POR COSTES DE ROTURA" si `invoice.invoices_type.invoices` coincide (case-insensitive) con `BREAKAGE_INVOICE_TYPE_NAME` (`"Factura de rotura"`, definido en `helpers/budgets.ts`) — no depende de ninguna columna nueva en `invoices`, solo del nombre del tipo de factura
- "CONCEPTO" (amarillo) muestra solo `invoice.invoices_type.concept`. "OBSERVACIONES" (azul) es un bloque separado que muestra `invoice.additional_data` — antes se mezclaban en un único bloque "CONCEPTO", ahora están deliberadamente separados
- La tabla de líneas solo se renderiza si `invoice.invoices_type.show_budgetlines !== false`

### `generateBudgetPDF(budget, business, clientData, includeVAT, date): Promise<Blob>`
- `business` se pasa por separado (el usuario elige el emisor)
- `clientData: BudgetClientData` — extraído del budget en el componente llamador
- `includeVAT: boolean` — si true, calcula IVA al 21% via `calculateBudgetTotal(budget)`
- No se sube a Supabase — se descarga directo en el cliente (llamado desde `Budgets.tsx`)

## Flujo completo para facturas (pdfService NO sube, lo hace invoicesService)

```
generateInvoicePDF(invoice)            → Blob
supabase.storage.from("invoices-pdf").upload(fileName, blob)
supabase.storage.from("invoices-pdf").getPublicUrl(fileName)
supabase.from("invoices").update({ pdf_url })
```

El nombre de fichero se genera con `buildInvoicePdfFileName(invoice_number, created_at, client_name, budget_reference)`.

## Layout — cómo funciona

- Variable `yPosition` (mm) se incrementa tras cada sección
- Logo: `doc.addImage(logoImage, "PNG", 20, yPosition, 35, 30)` — `logoImage` importado de `@/assets/logo.png`
- Textos alineados a la derecha usan `{ align: "right" }` con `x = pageWidth - 20`
- Salto de página: `if (yPosition > pageHeight - 50) { doc.addPage(); yPosition = 20; }`
- Tras `autoTable`: `yPosition = doc.lastAutoTable.finalY + 10` (requiere `@ts-expect-error`)

## Colores por sección

| Sección | Fondo | Borde |
|---|---|---|
| Cliente | `(232,245,233)` verde claro | `(129,199,132)` |
| Concepto | `(255,248,225)` amarillo | `(255,193,7)` |
| Observaciones (factura) | `(227,242,253)` azul | `(100,181,246)` |
| Factura rectificativa | `(255,235,238)` rojo claro | `(244,67,54)` |
| Factura de rotura | `(255,243,224)` naranja | `(255,167,38)` |
| Comentarios cliente (presupuesto) | `(227,242,253)` azul | `(100,181,246)` |
| Notas internas (presupuesto) | `(255,243,224)` naranja | `(255,167,38)` |

## Tabla de líneas (autoTable)

```typescript
autoTable(doc, {
  startY: yPosition,
  head: [["Unidades", "Nombre", "Precio Ud.", "Dto.", "Total"]],
  body: tableData,
  theme: "grid",
  margin: { left: 20, right: 20, bottom: 45 },  // bottom: 45 evita pisar el footer
});
```

Anchos de columna fijos: `[20, 75, 25, 20, 30]` mm (total 170mm = pageWidth 210 - márgenes 40).

### Columnas destacadas

- **Dto.**: `line.descuento ? \`${line.descuento}%\` : "-"` — los extras siempre muestran `"-"`
- **Total**: usa `line.totalPrice` (precio real con unidades y descuento ya aplicado), NO calcular `unitPrice * units`

### Extras en la tabla

Cada `BudgetLine` tiene `extras: Extra[]`. Si `extra.checked === true`, se inserta como fila inmediatamente después de su línea padre.

```typescript
// Extra { checked, extraName, units, price }
// total de un extra = extra.units * extra.price (los extras no tienen totalPrice ni descuento)
const tableData: string[][] = [];
budgetLines.forEach((line) => {
  tableData.push([units.toString(), line.elemento, formatCurrency(unitPrice), line.descuento ? `${line.descuento}%` : "-", formatCurrency(line.totalPrice)]);
  line.extras?.forEach((extra) => {
    if (extra.checked) {
      tableData.push([extra.units.toString(), extra.extraName, formatCurrency(extra.price), "-", formatCurrency(extra.units * extra.price)]);
    }
  });
});
```

Se aplica igual en `generateInvoicePDF` y `generateBudgetPDF`.

## Footer

`business.additional_data` centrado a `pageHeight - 15 - additionalDataHeight`. Solo se renderiza si existe.

## Precios especiales por fecha (priceExceptionList)

Cada `BudgetLine` tiene `priceExceptionList: { id, price, date }[]`.

Si la fecha del evento coincide con alguna entrada, el precio unitario de esa línea se sustituye por `exception.price`. El total se recalcula como `exception.price * units`.

**CRÍTICO — timezone**: las fechas de evento se guardan en UTC con hora española (`2026-06-05T22:00:00Z` = 6 de junio en España). Las excepciones también en UTC pero con el día local correcto (`2026-06-06T10:00:00Z`). Comparar con `substring(0,10)` o `.toISOString()` falla porque son días UTC distintos. La comparación DEBE usar `getFullYear/getMonth/getDate` (hora local) via `toLocalDateString` en `pdfService.ts`.

El helper en `pdfService.ts`:
```typescript
const toLocalDateString = (dateStr: string): string => { /* getFullYear/getMonth/getDate */ }
const getEffectiveUnitPrice = (line, eventDate?) => { ... }
```

- En `generateBudgetPDF`: usa `budget.eventDate`
- En `generateInvoicePDF`: usa `invoice.event_date` (columna en Supabase, almacenada al crear la factura)

**Importante**: `event_date` debe estar en la tabla `invoices` de Supabase. Se propaga en:
- Creación normal: desde `selectedBudget.eventDate` en `Budgets.tsx`
- Factura rectificativa: copiada de la factura original
- Actualización: se preserva del registro existente (no necesita pasarse de nuevo)

## Checklist al modificar o añadir un PDF

- [ ] Leer `src/services/pdfService.ts` completo antes de editar
- [ ] Respetar la paleta de colores por tipo de sección
- [ ] Comprobar salto de página tras autoTable (`pageHeight - 50`)
- [ ] Si añades sección nueva: incrementar `yPosition` correctamente o el contenido se solapará
- [ ] No llamar a `generateInvoicePDF` sin haber hecho el join completo del invoice (business, invoices_type, taxes_type)
- [ ] El IVA del presupuesto siempre es 21% hardcodeado; el de factura viene de `taxes_type.tax`
- [ ] Bucket de Supabase: `invoices-pdf` (solo facturas, presupuestos no se suben)
