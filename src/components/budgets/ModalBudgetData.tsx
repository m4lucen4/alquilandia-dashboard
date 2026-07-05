import { type FC } from "react";
import { Modal } from "../shared/Modal";
import Button from "../shared/Button";
import type { Budget, User } from "../../types/budgets";
import { formatDate } from "@/helpers/dates";
import { formatCurrency, getStatusBadgeConfig } from "@/helpers";
import { calculateBudgetTotal, getEffectiveUnitPrice } from "@/helpers/budgets";

interface ModalBudgetDataProps {
  isOpen: boolean;
  onClose: () => void;
  budget: Budget | null;
  user: User | null;
  onRescue?: () => void;
}

export const ModalBudgetData: FC<ModalBudgetDataProps> = ({
  isOpen,
  onClose,
  budget,
  user,
  onRescue,
}) => {
  if (!isOpen || !budget) return null;

  const clientName =
    user?.FullName ||
    `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
    budget.client ||
    "-";

  const statusConfig = getStatusBadgeConfig(budget.status);

  return (
    <Modal
      title={`Presupuesto #${budget.budgetReference}${budget.technician?.role === "TECHNICIAN" && budget.technician?.firstName ? ` (Atendido por: ${budget.technician.firstName})` : ""}`}
      onAccept={onClose}
      onClose={onClose}
      acceptText="Cerrar"
      cancelText=""
    >
      <div className="space-y-5">
        {/* Client & event info */}
        <div className="grid grid-cols-2 gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
              Cliente
            </p>
            <p className="mt-0.5 font-medium text-gray-900">{clientName}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
              Email
            </p>
            <p className="mt-0.5 text-gray-900">{user?.email || "-"}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
              Teléfono
            </p>
            <p className="mt-0.5 text-gray-900">
              {user?.phone || "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
              Dirección cliente
            </p>
            <p className="mt-0.5 text-gray-900">
              {user?.address || "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
              Fecha evento
            </p>
            <p className="mt-0.5 text-gray-900">
              {formatDate(budget.eventDate)}
            </p>
          </div>
          <div className="col-span-2">
            <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
              Dirección evento
            </p>
            <p className="mt-0.5 text-gray-900">
              {budget.address || "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
              Estado
            </p>
            <span
              className={`mt-0.5 inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${statusConfig.className}`}
            >
              {statusConfig.label}
            </span>
          </div>
        </div>

        {/* Budget lines */}
        {budget.budgetLines && budget.budgetLines.length > 0 && (
          <div className="max-h-64 overflow-y-auto rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    Elemento
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    Uds.
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    Precio Ud.
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    Dto.
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {budget.budgetLines.flatMap((line) => {
                  const unitPrice = getEffectiveUnitPrice(line, budget.eventDate);
                  const units = line.units || 1;
                  const rows = [
                    <tr key={line.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {line.nombre || line.elemento || "-"}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-center text-sm text-gray-600">
                        {units}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-900">
                        {formatCurrency(unitPrice)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-center text-sm text-gray-600">
                        {line.descuento ? `${line.descuento}%` : "-"}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-semibold text-gray-900">
                        {formatCurrency(line.totalPrice)}
                      </td>
                    </tr>,
                  ];
                  line.extras?.forEach((extra) => {
                    if (extra.checked) {
                      rows.push(
                        <tr key={`${line.id}-extra-${extra.extraName}`} className="bg-gray-50 hover:bg-gray-100">
                          <td className="px-4 py-2 pl-8 text-sm text-gray-500 italic">
                            {extra.extraName || "-"}
                          </td>
                          <td className="whitespace-nowrap px-4 py-2 text-center text-sm text-gray-500">
                            {extra.units}
                          </td>
                          <td className="whitespace-nowrap px-4 py-2 text-right text-sm text-gray-500">
                            {formatCurrency(extra.price)}
                          </td>
                          <td className="whitespace-nowrap px-4 py-2 text-center text-sm text-gray-500">
                            -
                          </td>
                          <td className="whitespace-nowrap px-4 py-2 text-right text-sm text-gray-500">
                            {formatCurrency(extra.units * extra.price)}
                          </td>
                        </tr>,
                      );
                    }
                  });
                  return rows;
                })}
              </tbody>
            </table>
          </div>
        )}

        {onRescue && (
          <div className="flex justify-end pt-2">
            <Button
              title="Rescatar presupuesto"
              onClick={onRescue}
              variant="secondary"
            />
          </div>
        )}

        {/* Price summary */}
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm">
          {(() => {
            const { iva, total } = calculateBudgetTotal(budget);
            const subTotal = budget.price?.subTotal || 0;
            const extras = budget.price?.extras || 0;
            const costSend = budget.price?.costSend || 0;
            const userDiscount = budget.price?.userDiscount || 0;
            const couponDiscount = budget.totalCouponDiscount || 0;

            return (
              <div className="space-y-1.5">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subTotal)}</span>
                </div>
                {extras > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Extras</span>
                    <span>{formatCurrency(extras)}</span>
                  </div>
                )}
                {costSend > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Envío</span>
                    <span>{formatCurrency(costSend)}</span>
                  </div>
                )}
                {userDiscount > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Descuento</span>
                    <span>-{formatCurrency(userDiscount)}</span>
                  </div>
                )}
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Cupón de descuento</span>
                    <span>-{formatCurrency(couponDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>IVA (21%)</span>
                  <span>{formatCurrency(iva)}</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-1.5 text-base font-semibold text-gray-900">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </Modal>
  );
};
