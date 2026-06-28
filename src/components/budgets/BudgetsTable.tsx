import { type FC, useMemo } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { DocumentCheckIcon } from "@heroicons/react/24/outline";
import type { Budget } from "../../types/budgets";
import { formatDate } from "@/helpers/dates";
import { formatCurrency, getStatusBadgeConfig } from "@/helpers";
import { BudgetsActionsMenu } from "./BudgetsActionsMenu";
import { Table } from "@/components/shared/Table";
import { calculateBudgetTotal } from "@/helpers/budgets";

interface BudgetsTableProps {
  budgets: Budget[];
  total: number;
  pageIndex: number;
  pageSize: number;
  isLoading: boolean;
  loadingInvoice: boolean;
  loadingBudget: boolean;
  budgetHasInvoice: (budgetReference: number) => boolean;
  onPageChange: (pageIndex: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onGenerateInvoice: (budget: Budget) => void;
  onViewInvoice: (budget: Budget) => void;
  onViewBudget: (budget: Budget) => void;
  onGenerateBudgetPdf: (budget: Budget) => void;
}

export const BudgetsTable: FC<BudgetsTableProps> = ({
  budgets,
  total,
  pageIndex,
  pageSize,
  isLoading,
  loadingInvoice,
  loadingBudget,
  budgetHasInvoice,
  onPageChange,
  onPageSizeChange,
  onGenerateInvoice,
  onViewInvoice,
  onViewBudget,
  onGenerateBudgetPdf,
}) => {
  const columns = useMemo<ColumnDef<Budget>[]>(
    () => [
      {
        accessorKey: "budgetReference",
        header: "Nº Presupuesto",
        cell: (info) => {
          const budgetRef = info.getValue() as number;
          const hasInvoice = budgetHasInvoice(budgetRef);
          const budget = info.row.original;
          return (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onViewBudget(budget)}
                className="font-medium text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
              >
                #{budgetRef}
              </button>
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
          const { total } = calculateBudgetTotal(budget);
          return (
            <span className="font-semibold text-gray-900">
              {formatCurrency(total)}
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
              loadingBudget={loadingBudget}
              onGenerateInvoice={onGenerateInvoice}
              onViewInvoice={onViewInvoice}
              onViewBudget={onViewBudget}
              onGenerateBudgetPdf={onGenerateBudgetPdf}
            />
          );
        },
      },
    ],
    [
      budgetHasInvoice,
      loadingInvoice,
      loadingBudget,
      onGenerateInvoice,
      onViewInvoice,
      onViewBudget,
      onGenerateBudgetPdf,
    ],
  );

  return (
    <Table
      data={budgets}
      columns={columns}
      isLoading={isLoading}
      loadingMessage="Cargando presupuestos..."
      emptyMessage="No se encontraron presupuestos"
      pagination={{
        pageIndex,
        pageSize,
        total,
        onPageChange,
        onPageSizeChange,
      }}
    />
  );
};
