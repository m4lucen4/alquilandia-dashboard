import { type FC, useEffect, useMemo } from "react";
import { useForm, useFieldArray, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import InputField from "@/components/shared/InputField";
import SelectField from "@/components/shared/SelectField";
import Button from "@/components/shared/Button";
import { BreakageLineRow } from "./BreakageLineRow";
import { formatCurrency } from "@/helpers";
import { getBreakableBudgetLines } from "@/helpers/budgets";
import type { Budget } from "@/types/budgets";
import type { Business } from "@/types/business";
import type { TaxesType } from "@/types/taxesTypes";
import type { InvoicesType } from "@/types/invoicesTypes";

const breakageLineSchema = z
  .object({
    lineId: z.string(),
    elemento: z.string(),
    contractedUnits: z.number(),
    unitCost: z.number(),
    brokenUnits: z.number().int().min(0, "No puede ser negativo"),
  })
  .refine((l) => l.brokenUnits <= l.contractedUnits, {
    message: "No puedes romper más unidades de las contratadas",
    path: ["brokenUnits"],
  });

const breakageFormSchema = z
  .object({
    businessId: z.string().min(1, "Selecciona una empresa"),
    taxesTypeId: z.string().min(1, "Selecciona un tipo de impuesto"),
    createdAt: z.string().min(1, "Selecciona una fecha"),
    additionalData: z.string().optional(),
    lines: z.array(breakageLineSchema),
  })
  .refine((data) => data.lines.some((l) => l.brokenUnits > 0), {
    message: "Marca al menos una unidad rota en alguna línea",
    path: ["lines"],
  });

export type BreakageFormValues = z.infer<typeof breakageFormSchema>;

interface ModalGenerateBreakageInvoiceProps {
  isOpen: boolean;
  onClose: () => void;
  budget: Budget | null;
  businesses: Business[];
  taxesTypes: TaxesType[];
  breakageInvoiceType: InvoicesType | undefined;
  isGeneratingInvoice: boolean;
  isReducingInventory: boolean;
  isDownloadingAnnex: boolean;
  reduceInventoryResult: { ok: boolean; message: string } | null;
  onDismissReduceInventoryResult: () => void;
  onGenerateInvoice: (values: BreakageFormValues) => void;
  onReduceInventory: (values: BreakageFormValues) => void;
  onDownloadAnnex: (values: BreakageFormValues) => void;
}

export const ModalGenerateBreakageInvoice: FC<ModalGenerateBreakageInvoiceProps> = ({
  isOpen,
  onClose,
  budget,
  businesses,
  taxesTypes,
  breakageInvoiceType,
  isGeneratingInvoice,
  isReducingInventory,
  isDownloadingAnnex,
  reduceInventoryResult,
  onDismissReduceInventoryResult,
  onGenerateInvoice,
  onReduceInventory,
  onDownloadAnnex,
}) => {
  const {
    control,
    handleSubmit,
    reset,
    trigger,
    getValues,
    formState: { errors },
  } = useForm<BreakageFormValues>({
    resolver: zodResolver(breakageFormSchema),
    defaultValues: {
      businessId: "",
      taxesTypeId: "",
      createdAt: "",
      additionalData: "",
      lines: [],
    },
  });

  const { fields } = useFieldArray({ control, name: "lines" });

  useEffect(() => {
    if (isOpen && budget) {
      const defaultBusiness = businesses.find((b) => b.is_default);
      reset({
        businessId: defaultBusiness?.id ?? "",
        taxesTypeId: "",
        createdAt: new Date().toISOString().split("T")[0],
        additionalData: "",
        lines: getBreakableBudgetLines(budget).map((l) => ({
          lineId: l.id,
          elemento: l.elemento,
          contractedUnits: l.units,
          unitCost: l.preciocoste,
          brokenUnits: 0,
        })),
      });
    }
    if (!isOpen) reset();
  }, [isOpen, budget, businesses, reset]);

  const businessOptions = useMemo(
    () => businesses.map((b) => ({ value: b.id, label: b.name })),
    [businesses],
  );

  const taxTypeOptions = useMemo(
    () => taxesTypes.map((t) => ({ value: t.id, label: `${t.name} (${t.tax}%)` })),
    [taxesTypes],
  );

  const watchedLines = useWatch({ control, name: "lines" });
  const watchedTaxesTypeId = useWatch({ control, name: "taxesTypeId" });
  const summary = useMemo(() => {
    const subTotal = (watchedLines || []).reduce(
      (acc, l) => acc + (l.brokenUnits || 0) * (l.unitCost || 0),
      0,
    );
    const taxRate = taxesTypes.find((t) => t.id === watchedTaxesTypeId)?.tax ?? 0;
    const vat = subTotal * (taxRate / 100);
    return { subTotal, vat, total: subTotal + vat };
  }, [watchedLines, watchedTaxesTypeId, taxesTypes]);

  const handleReduceInventory = async () => {
    const valid = await trigger("lines");
    if (!valid) return;
    onReduceInventory(getValues());
  };

  const handleDownloadAnnex = async () => {
    const valid = await trigger(["businessId", "taxesTypeId", "createdAt", "lines"]);
    if (!valid) return;
    onDownloadAnnex(getValues());
  };

  const onSubmit = (values: BreakageFormValues) => {
    if (!breakageInvoiceType) return;
    onGenerateInvoice(values);
  };

  if (!isOpen || !budget) return null;

  const isBusy = isGeneratingInvoice || isReducingInventory || isDownloadingAnnex;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={isBusy ? undefined : onClose}
        aria-hidden="true"
      />

      <div
        className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl"
        role="dialog"
        aria-labelledby="modal-breakage-title"
      >
        <button
          type="button"
          onClick={onClose}
          disabled={isBusy}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          aria-label="Cerrar modal"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="p-6 sm:p-8">
            <h3
              id="modal-breakage-title"
              className="mb-2 text-xl font-semibold text-gray-900"
            >
              Costes de rotura
            </h3>
            <p className="mb-6 text-sm text-gray-600">
              Presupuesto{" "}
              <span className="font-semibold">#{budget.budgetReference}</span>
              . Marca las unidades rotas/dañadas por artículo. Se cobrará el
              precio de coste de reposición, no el precio de venta.
            </p>

            <div className="max-h-[60vh] space-y-4 overflow-y-auto pr-1">
              <div className="grid grid-cols-2 gap-4">
                <Controller
                  name="businessId"
                  control={control}
                  render={({ field }) => (
                    <SelectField
                      label="Empresa"
                      name={field.name}
                      value={field.value}
                      onChange={field.onChange}
                      options={businessOptions}
                      required
                      error={errors.businessId?.message}
                      emptyMessage="No hay empresas disponibles. Crea una en Ajustes."
                    />
                  )}
                />

                <Controller
                  name="createdAt"
                  control={control}
                  render={({ field }) => (
                    <InputField
                      label="Fecha"
                      name={field.name}
                      type="date"
                      value={field.value}
                      onChange={field.onChange}
                      required
                      error={errors.createdAt?.message}
                    />
                  )}
                />
              </div>

              <Controller
                name="taxesTypeId"
                control={control}
                render={({ field }) => (
                  <SelectField
                    label="Tipo de Impuesto"
                    name={field.name}
                    value={field.value}
                    onChange={field.onChange}
                    options={taxTypeOptions}
                    required
                    error={errors.taxesTypeId?.message}
                    emptyMessage="No hay tipos de impuesto disponibles. Crea uno en Ajustes."
                  />
                )}
              />

              {!breakageInvoiceType && (
                <p className="text-sm font-semibold text-red-600">
                  ⚠ No existe el tipo de factura &quot;Factura de rotura&quot;.
                  Créalo en Ajustes → Tipos de factura para poder generar la
                  factura real. Puedes seguir reduciendo inventario o
                  descargando el anexo sin ese requisito.
                </p>
              )}

              <div className="rounded-md border border-gray-200">
                <div className="divide-y divide-gray-100 px-4">
                  {fields.map((field, index) => (
                    <BreakageLineRow
                      key={field.id}
                      control={control}
                      index={index}
                      elemento={field.elemento}
                      contractedUnits={field.contractedUnits}
                      unitCost={field.unitCost}
                      errors={errors}
                    />
                  ))}
                </div>
              </div>
              {errors.lines?.message && (
                <p className="text-sm text-red-600">{errors.lines.message}</p>
              )}

              <Controller
                name="additionalData"
                control={control}
                render={({ field }) => (
                  <InputField
                    label="Datos adicionales (opcional)"
                    name={field.name}
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    as="textarea"
                    rows={3}
                    placeholder="Información adicional que aparecerá en la factura..."
                  />
                )}
              />

              <div className="rounded-md bg-gray-50 p-4 text-sm ring-1 ring-gray-200">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal (coste):</span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(summary.subTotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">IVA:</span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(summary.vat)}
                  </span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Total:</span>
                  <span>{formatCurrency(summary.total)}</span>
                </div>
              </div>

              <p className="text-xs text-gray-500">
                Estas tres acciones son independientes: puedes generar el
                anexo, reducir el inventario y facturar en cualquier orden.
              </p>
            </div>
          </div>

          <div className="border-t border-gray-100 bg-gray-50 px-6 py-4 sm:px-8">
            {reduceInventoryResult && (
              <div
                className={`mb-3 flex items-start justify-between gap-3 rounded-md p-3 text-sm ring-1 ${
                  reduceInventoryResult.ok
                    ? "bg-green-50 text-green-800 ring-green-200"
                    : "bg-red-50 text-red-800 ring-red-200"
                }`}
              >
                <span>{reduceInventoryResult.message}</span>
                <button
                  type="button"
                  onClick={onDismissReduceInventoryResult}
                  className="shrink-0 font-medium underline"
                >
                  Cerrar
                </button>
              </div>
            )}
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button
                title="Cancelar"
                onClick={onClose}
                variant="secondary"
                type="button"
                disabled={isBusy}
              />
              <Button
                title="Reducir inventario"
                onClick={handleReduceInventory}
                variant="secondary"
                type="button"
                loading={isReducingInventory}
                disabled={isBusy}
              />
              <Button
                title="Descargar anexo"
                onClick={handleDownloadAnnex}
                variant="secondary"
                type="button"
                loading={isDownloadingAnnex}
                disabled={isBusy}
              />
              <Button
                title="Generar factura de rotura"
                onClick={() => {}}
                variant="primary"
                type="submit"
                loading={isGeneratingInvoice}
                disabled={isBusy || !breakageInvoiceType}
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
