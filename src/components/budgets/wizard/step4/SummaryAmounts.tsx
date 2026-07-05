import { type FC } from "react";
import type { Budget } from "@/types/budgets";
import { formatCurrency, getAppliedDiscount } from "@/helpers";
import { MIN_BUDGET_AMOUNT } from "@/constants";

interface SummaryAmountsProps {
  budget: Budget;
}

const rowClasses = "flex justify-between text-sm";
const labelClasses = "text-gray-600";

export const SummaryAmounts: FC<SummaryAmountsProps> = ({ budget }) => {
  const { price, nosend } = budget;
  const applied = getAppliedDiscount(budget);
  const userPct = price.userDiscountPercentage;

  const showMinAmountWarning = price.subTotalWithExtras <= MIN_BUDGET_AMOUNT && price.subTotalWithExtras > 0;

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm flex flex-col gap-2">
      <h2 className="mb-2 text-base font-semibold text-gray-900">Resumen de importes</h2>

      {showMinAmountWarning && (
        <p className="mb-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
          El importe mínimo de pedido es {formatCurrency(MIN_BUDGET_AMOUNT)}.
        </p>
      )}

      <div className={rowClasses}>
        <span className={labelClasses}>Artículos</span>
        <span>{formatCurrency(price.subTotal)}</span>
      </div>

      {price.extras > 0 && (
        <div className={rowClasses}>
          <span className={labelClasses}>Extras</span>
          <span>{formatCurrency(price.extras)}</span>
        </div>
      )}

      <div className={rowClasses}>
        <span className={labelClasses}>
          {nosend ? "Recogida en tienda" : "Coste de envío"}
        </span>
        <span>{formatCurrency(price.costSend)}</span>
      </div>

      {applied > 0 && (
        <div className={`${rowClasses} text-green-600`}>
          <span>Descuento cliente ({userPct}%)</span>
          <span>−{formatCurrency(applied)}</span>
        </div>
      )}

      <div className="mt-2 border-t border-gray-200 pt-2">
        <div className={`${rowClasses} font-medium`}>
          <span className={labelClasses}>Subtotal</span>
          <span>{formatCurrency(price.subTotalWithExtras + price.costSend - applied)}</span>
        </div>
      </div>

      {price.withIVA && (
        <div className={rowClasses}>
          <span className={labelClasses}>IVA (21%)</span>
          <span>{formatCurrency(price.vat)}</span>
        </div>
      )}

      <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-base">
        <span>Total</span>
        <span className="text-blue-600">{formatCurrency(price.total)}</span>
      </div>
    </div>
  );
};
