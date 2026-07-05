import { type FC } from "react";
import type { Budget } from "@/types/budgets";
import { formatCurrency, getAppliedDiscount } from "@/helpers";

interface CheckoutSummaryProps {
  budget: Budget;
}

function formatEventDate(iso: string): string {
  if (!iso || iso.startsWith("0001-")) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export const CheckoutSummary: FC<CheckoutSummaryProps> = ({ budget }) => {
  const { price, user, eventDate, budgetReference, budgetLines } = budget;
  const applied = getAppliedDiscount(budget);
  const clientName = `${user.firstName} ${user.lastName}`.trim();

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-base font-semibold text-gray-900">Resumen del presupuesto</h2>
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div>
          <dt className="text-xs font-medium text-gray-500">Nº presupuesto</dt>
          <dd className="mt-0.5 text-sm text-gray-900">#{budgetReference}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-gray-500">Cliente</dt>
          <dd className="mt-0.5 text-sm text-gray-900">{clientName || "—"}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-gray-500">Fecha del evento</dt>
          <dd className="mt-0.5 text-sm text-gray-900">{formatEventDate(eventDate)}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-gray-500">Artículos</dt>
          <dd className="mt-0.5 text-sm text-gray-900">{budgetLines?.length ?? 0}</dd>
        </div>
      </dl>

      <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
        <div className="flex flex-col gap-1 text-sm text-gray-600">
          {applied > 0 && (
            <span className="text-green-600">
              Descuento cliente ({price.userDiscountPercentage}%): −{formatCurrency(applied)}
            </span>
          )}
          {price.withIVA && (
            <span>IVA (21%): {formatCurrency(price.vat)}</span>
          )}
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Total</p>
          <p className="text-2xl font-bold text-blue-600">{formatCurrency(price.total)}</p>
        </div>
      </div>
    </div>
  );
};
