import { type FC, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";
import { DocumentCheckIcon } from "@heroicons/react/24/outline";
import type { Budget } from "../../types/budgets";
import { formatDate } from "@/helpers/dates";
import { formatCurrency, getStatusBadgeConfig } from "@/helpers";
import { BudgetsActionsMenu } from "./BudgetsActionsMenu";
import { Pagination } from "./Pagination";

interface BudgetsTableProps {
  budgets: Budget[];
  total: number;
  pageIndex: number;
  pageSize: number;
  isLoading: boolean;
  loadingInvoice: boolean;
  budgetHasInvoice: (budgetReference: number) => boolean;
  onPageChange: (pageIndex: number) => void;
  onGenerateInvoice: (budget: Budget) => void;
  onViewInvoice: (budget: Budget) => void;
}

export const BudgetsTable: FC<BudgetsTableProps> = ({
  budgets,
  total,
  pageIndex,
  pageSize,
  isLoading,
  loadingInvoice,
  budgetHasInvoice,
  onPageChange,
  onGenerateInvoice,
  onViewInvoice,
}) => {
  const columns = useMemo<ColumnDef<Budget>[]>(
    () => [
      {
        accessorKey: "budgetReference",
        header: "Nº Presupuesto",
        cell: (info) => {
          const budgetRef = info.getValue() as number;
          const hasInvoice = budgetHasInvoice(budgetRef);
          return (
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900">#{budgetRef}</span>
              {hasInvoice && (
                <DocumentCheckIcon
                  className="h-5 w-5 text-green-600"
                  title="Factura generada"
                />
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "client",
        header: "Cliente",
        cell: (info) => {
          const budget = info.row.original;
          const clientName = budget.client || budget.user?.FullName || "-";
          return <span className="text-gray-900">{clientName}</span>;
        },
      },
      {
        accessorKey: "eventDate",
        header: "Fecha Evento",
        cell: (info) => (
          <span className="text-gray-600">
            {formatDate(info.getValue() as string)}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Estado",
        cell: (info) => {
          const config = getStatusBadgeConfig(info.getValue() as string);
          return (
            <span
              className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${config.className}`}
            >
              {config.label}
            </span>
          );
        },
      },
      {
        accessorKey: "price.total",
        header: "Total",
        cell: (info) => {
          const budget = info.row.original;
          return (
            <span className="font-semibold text-gray-900">
              {formatCurrency(budget.price?.total || 0)}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: "Acciones",
        cell: (info) => {
          const budget = info.row.original;
          return (
            <BudgetsActionsMenu
              budget={budget}
              hasInvoice={budgetHasInvoice(budget.budgetReference)}
              loadingInvoice={loadingInvoice}
              onGenerateInvoice={onGenerateInvoice}
              onViewInvoice={onViewInvoice}
            />
          );
        },
      },
    ],
    [budgetHasInvoice, loadingInvoice, onGenerateInvoice, onViewInvoice],
  );

  const table = useReactTable({
    data: budgets,
    columns,
    pageCount: Math.ceil(total / pageSize),
    state: {
      pagination: {
        pageIndex,
        pageSize,
      },
    },
    onPaginationChange: (updater) => {
      const newPagination =
        typeof updater === "function"
          ? updater({ pageIndex, pageSize })
          : updater;
      onPageChange(newPagination.pageIndex);
    },
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  });

  return (
    <div className="mt-8 flow-root">
      <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
          <div className="overflow-hidden shadow ring-1 ring-black/5 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="px-3 py-12 text-center text-sm text-gray-500"
                    >
                      <div className="flex items-center justify-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                        <span className="ml-3">Cargando presupuestos...</span>
                      </div>
                    </td>
                  </tr>
                ) : budgets.length === 0 ? (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="px-3 py-12 text-center text-sm text-gray-500"
                    >
                      No se encontraron presupuestos
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50">
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className="whitespace-nowrap px-3 py-4 text-sm"
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {budgets.length > 0 && (
            <Pagination
              currentPage={pageIndex}
              totalPages={table.getPageCount()}
              pageSize={pageSize}
              totalItems={total}
              onPageChange={onPageChange}
              canPreviousPage={table.getCanPreviousPage()}
              canNextPage={table.getCanNextPage()}
            />
          )}
        </div>
      </div>
    </div>
  );
};
