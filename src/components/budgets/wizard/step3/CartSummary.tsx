import { type FC } from "react";
import type { Budget, BudgetLine } from "@/types/budgets";
import { formatCurrency } from "@/helpers";

interface CartSummaryProps {
  budget: Budget;
  isSaving: boolean;
  onUpdateUnits: (lineId: string, units: number) => void;
  onRemoveLine: (lineId: string) => void;
  getMaxUnits: (line: BudgetLine) => number;
}

const sectionTitleClasses = "text-sm font-semibold text-gray-700";
const totalRowClasses = "flex justify-between text-sm";
const totalFinalRowClasses = "flex justify-between border-t border-gray-200 pt-2 font-bold text-base";

export const CartSummary: FC<CartSummaryProps> = ({
  budget,
  isSaving,
  onUpdateUnits,
  onRemoveLine,
  getMaxUnits,
}) => {
  const lines = budget.budgetLines ?? [];
  const { price } = budget;

  if (lines.length === 0) {
    return (
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <p className={sectionTitleClasses}>Carrito</p>
        <p className="mt-3 text-sm text-gray-400">Aún no has añadido artículos.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm flex flex-col gap-4">
      <p className={sectionTitleClasses}>Carrito ({lines.length})</p>

      {/* Líneas */}
      <ul className="divide-y divide-gray-100">
        {lines.map((line) => {
          const maxUnits = getMaxUnits(line);
          const checkedExtras = (line.extras ?? []).filter((e) => e.checked).length;

          return (
            <li key={line.id} className="py-3 flex flex-col gap-1.5">
              <div className="flex items-start justify-between gap-2">
                <span className="text-sm font-medium text-gray-900 leading-tight flex-1">
                  {line.elemento}
                </span>
                <button
                  type="button"
                  onClick={() => onRemoveLine(line.id)}
                  disabled={isSaving}
                  className="shrink-0 text-red-400 hover:text-red-600 disabled:opacity-40"
                  aria-label={`Quitar ${line.elemento}`}
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-500">Uds.</label>
                <input
                  type="number"
                  min={1}
                  max={maxUnits}
                  defaultValue={line.units}
                  disabled={isSaving}
                  className="w-14 rounded-md border border-gray-300 px-2 py-0.5 text-center text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
                  onBlur={(e) => {
                    const val = Math.min(Math.max(1, Number(e.target.value)), maxUnits);
                    if (val !== line.units) onUpdateUnits(line.id, val);
                    e.target.value = String(val);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                  }}
                />
                {checkedExtras > 0 && (
                  <span className="text-xs text-blue-600">{checkedExtras} extra{checkedExtras === 1 ? "" : "s"}</span>
                )}
                {line.descuento > 0 && (
                  <span className="text-xs text-green-600">-{line.descuento}%</span>
                )}
                <span className="ml-auto text-sm font-semibold text-gray-800">
                  {formatCurrency(line.totalPrice)}
                </span>
              </div>
            </li>
          );
        })}
      </ul>

      {/* Totales */}
      <div className="flex flex-col gap-1.5 border-t border-gray-200 pt-3">
        <div className={totalRowClasses}>
          <span className="text-gray-600">Artículos</span>
          <span>{formatCurrency(price.subTotal)}</span>
        </div>
        {price.extras > 0 && (
          <div className={totalRowClasses}>
            <span className="text-gray-600">Extras</span>
            <span>{formatCurrency(price.extras)}</span>
          </div>
        )}
        {price.userDiscount > 0 && (
          <div className={`${totalRowClasses} text-green-600`}>
            <span>Dto. cliente ({price.userDiscountPercentage}%)</span>
            <span>−{formatCurrency(price.userDiscount)}</span>
          </div>
        )}
        <div className={totalFinalRowClasses}>
          <span>Subtotal sin IVA</span>
          <span className="text-blue-600">
            {formatCurrency(price.subTotalWithExtras - price.userDiscount)}
          </span>
        </div>
      </div>
    </div>
  );
};
