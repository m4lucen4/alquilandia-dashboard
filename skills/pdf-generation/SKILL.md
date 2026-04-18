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
| Factura rectificativa | `(255,235,238)` rojo claro | `(244,67,54)` |
| Comentarios cliente | `(227,242,253)` azul | `(100,181,246)` |
| Notas internas | `(255,243,224)` naranja | `(255,167,38)` |

## Tabla de líneas (autoTable)

```typescript
autoTable(doc, {
  startY: yPosition,
  head: [["#", "Nombre", "Unidades", "Precio Ud.", "Total"]],
  body: tableData,
  theme: "grid",
  margin: { left: 20, right: 20, bottom: 45 },  // bottom: 45 evita pisar el footer
});
```

Anchos de columna fijos: `[10, 80, 20, 30, 30]` mm.

## Footer

`business.additional_data` centrado a `pageHeight - 15 - additionalDataHeight`. Solo se renderiza si existe.

## Checklist al modificar o añadir un PDF

- [ ] Leer `src/services/pdfService.ts` completo antes de editar
- [ ] Respetar la paleta de colores por tipo de sección
- [ ] Comprobar salto de página tras autoTable (`pageHeight - 50`)
- [ ] Si añades sección nueva: incrementar `yPosition` correctamente o el contenido se solapará
- [ ] No llamar a `generateInvoicePDF` sin haber hecho el join completo del invoice (business, invoices_type, taxes_type)
- [ ] El IVA del presupuesto siempre es 21% hardcodeado; el de factura viene de `taxes_type.tax`
- [ ] Bucket de Supabase: `invoices-pdf` (solo facturas, presupuestos no se suben)
