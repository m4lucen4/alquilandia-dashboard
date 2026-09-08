import { type FC, useState } from "react";
import { EyeIcon } from "@heroicons/react/24/outline";
import Button from "@/components/shared/Button";
import { Pagination } from "@/components/shared/Pagination";
import { formatDate } from "@/helpers/dates";
import {
  aggregateExtraBudgetRows,
  getProductBudgetUnits,
} from "@/helpers/visualStock";
import type { Budget } from "@/types/budgets";
import type {
  VisualStockExtra,
  VisualStockExtraBudget,
  VisualStockProduct,
} from "@/types/visualStock";

interface VisualStockResultsProps {
  tab: "products" | "extras";
  products: VisualStockProduct[];
  extras: VisualStockExtra[];
  isLoading: boolean;
  hasSearched: boolean;
  resetKey?: number;
  onViewBudget: (budget: Budget) => void;
}

const PAGE_SIZE = 20;

const isVisualStockProduct = (
  item: VisualStockProduct | VisualStockExtra,
): item is VisualStockProduct => "name" in item;

const isVisualStockExtraBudget = (
  budget: Budget | VisualStockExtraBudget,
): budget is VisualStockExtraBudget => "extraUnits" in budget;

const BudgetRows: FC<{
  budgets: Budget[];
  product?: VisualStockProduct;
  extraName?: string;
  onViewBudget: (budget: Budget) => void;
}> = ({ budgets, product, extraName, onViewBudget }) => {
  const rows = extraName ? aggregateExtraBudgetRows(budgets, extraName) : budgets;

  return (
    <table className="min-w-full divide-y divide-gray-200 bg-white text-left">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-3 py-2 text-xs font-medium text-gray-500">Nº presupuesto</th>
          <th className="px-3 py-2 text-xs font-medium text-gray-500">Dirección</th>
          <th className="px-3 py-2 text-xs font-medium text-gray-500">Unidades</th>
          <th className="px-3 py-2 text-xs font-medium text-gray-500">Día del evento</th>
          <th className="px-3 py-2 text-xs font-medium text-gray-500">
            <span className="sr-only">Ver detalle</span>
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {rows.map((budget) => {
          const units = extraName
            ? (isVisualStockExtraBudget(budget) ? budget.extraUnits : 0)
            : (budget.budgetLines ?? []).reduce(
                (total, line) =>
                  total +
                  getProductBudgetUnits(
                    line,
                    product?.name ?? "",
                    product?.products ?? [],
                  ),
                0,
              );

          return (
            <tr key={`${budget.id}-${budget.budgetReference}`}>
              <td className="px-3 py-2 text-sm text-gray-900">{budget.budgetReference}</td>
              <td className="px-3 py-2 text-sm text-gray-600">
                {budget.address || "Recogida en almacén"}
              </td>
              <td className="px-3 py-2 text-sm text-gray-600">{units}</td>
              <td className="px-3 py-2 text-sm text-gray-600">
                {formatDate(budget.eventDate)}
              </td>
              <td className="px-3 py-2 text-right">
                <Button
                  title="Ver detalle"
                  onClick={() => onViewBudget(budget)}
                  variant="secondary"
                  size="sm"
                  icon={<EyeIcon className="size-4" />}
                />
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export const VisualStockResults: FC<VisualStockResultsProps> = ({
  tab,
  products,
  extras,
  isLoading,
  hasSearched,
  resetKey = 0,
  onViewBudget,
}) => {
  const isProducts = tab === "products";
  const data = isProducts ? products : extras;
  const [pagination, setPagination] = useState(() => ({
    data,
    pageIndex: 0,
    resetKey,
    tab,
  }));
  const totalPages = Math.ceil(data.length / PAGE_SIZE);
  const isCurrentPagination = pagination.data === data && pagination.resetKey === resetKey && pagination.tab === tab;
  const currentPage = isCurrentPagination
    ? Math.min(pagination.pageIndex, Math.max(totalPages - 1, 0))
    : 0;
  const pageData = data.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);
  const columnsClassName = isProducts
    ? "grid-cols-[minmax(12rem,1fr)_7rem_8rem] min-w-[32rem]"
    : "grid-cols-[minmax(12rem,1fr)_7rem] min-w-[24rem]";

  if (!hasSearched) {
    return <p className="rounded-lg bg-blue-50 p-4 text-sm text-blue-800">Introduzca un rango de fecha.</p>;
  }

  if (isLoading) {
    return <p className="rounded-lg bg-gray-50 p-4 text-sm text-gray-600">Cargando stock visual…</p>;
  }

  if (data.length === 0) {
    return <p className="rounded-lg bg-amber-50 p-4 text-sm text-amber-800">No hay resultados para el rango de fechas seleccionado.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th colSpan={isProducts ? 3 : 2} className="p-0 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              <div className={`grid px-4 py-3 ${columnsClassName}`}>
                <span>Nombre</span>
                <span>Unidades</span>
                {isProducts && <span>Uds. inventario</span>}
              </div>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {pageData.map((item) => {
            const product = isVisualStockProduct(item) ? item : undefined;
            const extra = isVisualStockProduct(item) ? undefined : item;

            return (
              <tr key={item.id}>
                <td colSpan={product ? 3 : 2} className="p-0">
                  <details className="group">
                    <summary className={`grid cursor-pointer items-center px-4 py-3 text-sm marker:hidden hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-blue-600 ${columnsClassName}`}>
                      <span className="min-w-0 wrap-break-word font-medium text-gray-900">{product?.name ?? extra?.extraName}</span>
                      <span className="whitespace-nowrap tabular-nums text-gray-600">{item.units}</span>
                      {product && <span className="whitespace-nowrap tabular-nums text-gray-600">{product.unidades}</span>}
                    </summary>
                    <div className="overflow-x-auto border-t border-gray-200 bg-gray-50 p-3">
                      <BudgetRows
                        budgets={item.budgets}
                        product={product}
                        extraName={extra?.extraName}
                        onViewBudget={onViewBudget}
                      />
                    </div>
                  </details>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={PAGE_SIZE}
          totalItems={data.length}
          onPageChange={(pageIndex) => setPagination({ data, pageIndex, resetKey, tab })}
          onPageSizeChange={() => {}}
          canPreviousPage={currentPage > 0}
          canNextPage={currentPage < totalPages - 1}
          showPageSize={false}
        />
      )}
    </div>
  );
};
