import { type FC, useMemo } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { DocumentCheckIcon } from "@heroicons/react/24/outline";
import type { Budget } from "../../types/budgets";
import { formatDate } from "@/helpers/dates";
import { formatCurrency, getStatusBadgeConfig } from "@/helpers";
import { BudgetsActionsMenu } from "./BudgetsActionsMenu";
import { Table } from "@/components/shared/Table";

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
      }}
    />
  );
};
