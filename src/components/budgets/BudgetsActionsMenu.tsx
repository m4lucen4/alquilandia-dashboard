import { type FC } from "react";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";
import Button from "../shared/Button";
import type { Budget } from "../../types/budgets";

interface BudgetsActionsMenuProps {
  budget: Budget;
  hasInvoice: boolean;
  loadingInvoice: boolean;
  onGenerateInvoice: (budget: Budget) => void;
  onViewInvoice: (budget: Budget) => void;
  onViewBudget: (budget: Budget) => void;
  onGenerateBudgetPdf: (budget: Budget) => void;
}

export const BudgetsActionsMenu: FC<BudgetsActionsMenuProps> = ({
  budget,
  hasInvoice,
  loadingInvoice,
  onGenerateInvoice,
  onViewInvoice,
  onViewBudget,
  onGenerateBudgetPdf,
}) => {
  return (
    <Menu as="div" className="relative inline-block text-left">
      <MenuButton className="flex items-center rounded-full p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
        <span className="sr-only">Abrir menú</span>
        <EllipsisVerticalIcon className="h-5 w-5" aria-hidden="true" />
      </MenuButton>

      <MenuItems
        transition
        anchor={{ to: "bottom end", gap: 8 }}
        className="z-50 w-56 rounded-md bg-white shadow-lg ring-1 ring-black/5 transition focus:outline-none data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
      >
        <div className="py-1">
          <MenuItem>
            {({ focus }) => (
              <div className="px-2">
                <Button
                  title="Ver presupuesto"
                  onClick={() => onViewBudget(budget)}
                  variant="ghost"
                  size="sm"
                  block
                  className={focus ? "bg-gray-100" : ""}
                />
              </div>
            )}
          </MenuItem>

          <MenuItem>
            {({ focus }) => (
              <div className="px-2">
                <Button
                  title={
                    hasInvoice ? "Generar otra factura" : "Generar factura"
                  }
                  onClick={() => onGenerateInvoice(budget)}
                  variant="ghost"
                  size="sm"
                  block
                  className={focus ? "bg-gray-100" : ""}
                />
              </div>
            )}
          </MenuItem>

          <MenuItem>
            {({ focus }) => (
              <div className="px-2">
                <Button
                  title="Generar presupuesto PDF"
                  onClick={() => onGenerateBudgetPdf(budget)}
                  variant="ghost"
                  size="sm"
                  block
                  className={focus ? "bg-gray-100" : ""}
                />
              </div>
            )}
          </MenuItem>

          {hasInvoice && (
            <MenuItem>
              {({ focus }) => (
                <div className="px-2">
                  <Button
                    title={loadingInvoice ? "Cargando..." : "Ver datos factura"}
                    onClick={() => onViewInvoice(budget)}
                    variant="ghost"
                    size="sm"
                    block
                    disabled={loadingInvoice}
                    loading={loadingInvoice}
                    className={focus ? "bg-gray-100" : ""}
                  />
                </div>
              )}
            </MenuItem>
          )}
        </div>
      </MenuItems>
    </Menu>
  );
};
