import { type FC } from "react";
import type { Budget } from "@/types/budgets";
import { formatCurrency } from "@/helpers";
import { CAIXA_ACCOUNT, INITIAL_PAYMENT_FACTOR } from "@/constants";
import Button from "@/components/shared/Button";

interface TransferPanelProps {
  budget: Budget;
  isLoading: boolean;
  onConfirm: () => void;
}

export const TransferPanel: FC<TransferPanelProps> = ({ budget, isLoading, onConfirm }) => {
  const baseAmount = budget.price.subTotalWithExtras + budget.price.costSend;
  const transferAmount = baseAmount * INITIAL_PAYMENT_FACTOR;

  return (
    <div className="rounded-xl border border-blue-100 bg-blue-50 p-5 flex flex-col gap-4">
      <p className="text-sm text-gray-700">
        Realiza una transferencia de{" "}
        <span className="font-semibold text-blue-700">{formatCurrency(transferAmount)}</span>
        {" "}(25% del pedido) en concepto de reserva a:
      </p>
      <div className="rounded-lg bg-white px-4 py-3 shadow-sm">
        <p className="text-xs font-medium text-gray-500">IBAN</p>
        <p className="mt-0.5 font-mono text-sm font-semibold text-gray-900">{CAIXA_ACCOUNT}</p>
      </div>
      <p className="text-xs text-gray-500">
        Indica tu nombre y apellidos en el concepto de la transferencia.
      </p>
      <Button
        title="Confirmar pago por transferencia"
        onClick={onConfirm}
        variant="primary"
        type="button"
        disabled={isLoading}
      />
    </div>
  );
};
