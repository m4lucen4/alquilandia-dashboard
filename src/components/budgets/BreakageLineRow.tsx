import { type FC } from "react";
import { Controller, type Control, type FieldErrors } from "react-hook-form";
import { formatCurrency } from "@/helpers";
import type { BreakageFormValues } from "./ModalGenerateBreakageInvoice";

interface BreakageLineRowProps {
  control: Control<BreakageFormValues>;
  index: number;
  elemento: string;
  contractedUnits: number;
  unitCost: number;
  errors: FieldErrors<BreakageFormValues>;
}

export const BreakageLineRow: FC<BreakageLineRowProps> = ({
  control,
  index,
  elemento,
  contractedUnits,
  unitCost,
  errors,
}) => {
  const lineError = errors.lines?.[index]?.brokenUnits?.message;

  return (
    <div className="border-b border-gray-100 py-3 last:border-b-0">
      <div className="flex items-center justify-between gap-4">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-gray-900">{elemento}</p>
        <p className="text-xs text-gray-500">
          {contractedUnits} ud. contratadas · coste {formatCurrency(unitCost)}/ud
        </p>
      </div>

      <Controller
        name={`lines.${index}.brokenUnits`}
        control={control}
        render={({ field }) => (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => field.onChange(Math.max(0, (field.value || 0) - 1))}
              disabled={(field.value || 0) <= 0}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label={`Restar unidad rota de ${elemento}`}
            >
              −
            </button>
            <input
              type="number"
              min={0}
              max={contractedUnits}
              value={field.value ?? 0}
              onChange={(e) => field.onChange(Number(e.target.value))}
              className="w-16 rounded-md border border-gray-300 px-2 py-1 text-center text-sm"
              aria-label={`Unidades rotas de ${elemento}`}
            />
            <button
              type="button"
              onClick={() =>
                field.onChange(Math.min(contractedUnits, (field.value || 0) + 1))
              }
              disabled={(field.value || 0) >= contractedUnits}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label={`Sumar unidad rota de ${elemento}`}
            >
              +
            </button>
          </div>
        )}
      />
      </div>

      {lineError && (
        <p className="mt-1 text-right text-xs text-red-600">{lineError}</p>
      )}
    </div>
  );
};
