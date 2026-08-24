import { type FC, useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import type { BudgetLine, Extra } from "@/types/budgets";
import type { Discount } from "@/types/discounts";
import { formatCurrency } from "@/helpers";
import { ExtrasModal } from "../step3/ExtrasModal";
import type { ProductCardFormValues } from "../step3/ProductCard";

interface SummaryLineRowProps {
  line: BudgetLine;
  maxUnits: number;
  discounts: Discount[];
  showDiscount: boolean;
  isSaving: boolean;
  onUpdate: (lineId: string, patch: { units?: number; descuento?: number; extras?: Extra[] }) => void;
  onRemove: (lineId: string) => void;
}

export const SummaryLineRow: FC<SummaryLineRowProps> = ({
  line,
  maxUnits,
  discounts,
  showDiscount,
  isSaving,
  onUpdate,
  onRemove,
}) => {
  const [showExtras, setShowExtras] = useState(false);

  const defaultExtras: Extra[] = (line.extras ?? []).map((e) => ({
    id: e.id,
    extraName: e.extraName,
    price: e.price,
    checked: e.checked,
    units: e.units,
  }));

  const { register, control, getValues, setValue, watch } = useForm<ProductCardFormValues>({
    defaultValues: {
      units: line.units,
      descuento: line.descuento,
      extras: defaultExtras,
    },
  });

  useFieldArray({ control, name: "extras" });

  const currentUnits = watch("units");
  const currentExtras = watch("extras");
  const checkedExtrasCount = currentExtras.filter((e) => e.checked).length;

  const unitPrice = line.precioUd;
  const displayTotal = unitPrice * currentUnits * (1 - line.descuento / 100);

  const handleUnitsChange = (val: number) => {
    const clamped = Math.min(Math.max(1, val), maxUnits);
    setValue("units", clamped);
    onUpdate(line.id, { units: clamped });
  };

  const handleDescuentoChange = (val: number) => {
    onUpdate(line.id, { descuento: val });
  };

  const handleExtrasClose = () => {
    setShowExtras(false);
    const extras = getValues("extras");
    onUpdate(line.id, { extras });
  };

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-gray-100 bg-gray-50 p-4">
      {/* Nombre + precio + quitar */}
      <div className="flex items-start justify-between gap-2">
        <span className="flex-1 text-sm font-semibold text-gray-900 leading-tight">
          {line.elemento}
        </span>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-sm font-bold text-blue-600">
            {formatCurrency(displayTotal)}
          </span>
          <button
            type="button"
            onClick={() => onRemove(line.id)}
            disabled={isSaving}
            aria-label={`Quitar ${line.elemento}`}
            className="text-red-400 hover:text-red-600 disabled:opacity-40"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Precio unitario */}
      <p className="text-xs text-gray-500">{formatCurrency(unitPrice)} / ud.</p>

      {/* Controles */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Unidades */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => handleUnitsChange(currentUnits - 1)}
            disabled={isSaving || currentUnits <= 1}
            className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-40"
          >
            −
          </button>
          <input
            type="number"
            min={1}
            max={maxUnits}
            disabled={isSaving}
            className="w-14 rounded-md border border-gray-300 px-2 py-1 text-center text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
            value={currentUnits}
            onChange={(e) => setValue("units", Number(e.target.value))}
            onBlur={(e) => handleUnitsChange(Number(e.target.value))}
            onKeyDown={(e) => {
              if (e.key === "Enter") (e.target as HTMLInputElement).blur();
            }}
          />
          <button
            type="button"
            onClick={() => handleUnitsChange(currentUnits + 1)}
            disabled={isSaving || currentUnits >= maxUnits}
            className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-40"
          >
            +
          </button>
          <span className="text-xs text-gray-400">/ {maxUnits} disp.</span>
        </div>

        {/* Extras */}
        {(line.extras ?? []).length > 0 && (
          <button
            type="button"
            onClick={() => setShowExtras(true)}
            className="flex items-center gap-1 text-xs text-blue-600 underline hover:text-blue-800"
          >
            Extras
            {checkedExtrasCount > 0 && (
              <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] text-white">
                {checkedExtrasCount}
              </span>
            )}
          </button>
        )}

        {/* Descuento por línea (solo admin) */}
        {showDiscount && (
          <Controller
            name="descuento"
            control={control}
            render={({ field }) => (
              <select
                {...field}
                disabled={isSaving}
                onChange={(e) => {
                  field.onChange(Number(e.target.value));
                  handleDescuentoChange(Number(e.target.value));
                }}
                className="rounded-md border border-gray-300 px-2 py-1 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
              >
                <option value={0}>Sin dto.</option>
                {discounts.map((d) => (
                  <option key={d.id} value={d.porcentaje}>
                    {d.concepto} ({d.porcentaje}%)
                  </option>
                ))}
              </select>
            )}
          />
        )}

        {line.descuento > 0 && (
          <span className="text-xs text-green-600">−{line.descuento}%</span>
        )}
      </div>

      {showExtras && (
        <ExtrasModal
          control={control}
          register={register}
          onClose={handleExtrasClose}
        />
      )}
    </div>
  );
};
