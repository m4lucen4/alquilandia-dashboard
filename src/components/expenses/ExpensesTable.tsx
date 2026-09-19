import { type FC, useMemo } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { Table } from "@/components/shared/Table";
import type { Expense } from "@/types/expenses";
import { ExpensesActionsMenu } from "./ExpensesActionsMenu";

interface Props {
  expenses: Expense[];
  total: number;
  pageIndex: number;
  pageSize: number;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
}

const dateFormatter = new Intl.DateTimeFormat("es-ES");

export const ExpensesTable: FC<Props> = ({ expenses, total, pageIndex, pageSize, isLoading, onPageChange, onPageSizeChange, onEdit, onDelete }) => {
  const columns = useMemo<ColumnDef<Expense>[]>(() => [
    {
      accessorKey: "proveedor",
      header: "Proveedor",
      cell: ({ getValue }) => <div className="max-w-48 whitespace-normal wrap-break-word">{getValue<string>()}</div>,
    },
    {
      accessorKey: "principal",
      header: "Principal",
      cell: ({ getValue }) => <div className="max-w-48 whitespace-normal wrap-break-word">{getValue<string>()}</div>,
    },
    {
      accessorKey: "secundario",
      header: "Secundario",
      cell: ({ getValue }) => <div className="max-w-48 whitespace-normal wrap-break-word">{getValue<string>()}</div>,
    },
    { accessorKey: "baseImponible", header: "Base imponible", cell: ({ getValue }) => `${getValue<number>().toFixed(2)} €` },
    { accessorKey: "impuesto", header: "Impuesto", cell: ({ getValue }) => `${getValue<number>()}%` },
    { accessorKey: "total", header: "Total", cell: ({ getValue }) => `${getValue<number>().toFixed(2)} €` },
    { accessorKey: "fecha", header: "Fecha", cell: ({ getValue }) => dateFormatter.format(new Date(getValue<string>())) },
    { id: "actions", header: "Acciones", cell: ({ row }) => <ExpensesActionsMenu expense={row.original} onEdit={onEdit} onDelete={onDelete} /> },
  ], [onDelete, onEdit]);
  return <Table data={expenses} columns={columns} isLoading={isLoading} pagination={{ pageIndex, pageSize, total, onPageChange, onPageSizeChange }} />;
};
