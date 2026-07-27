import { type FC, useMemo } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import type { User } from "../../types/budgets";
import { formatDate } from "@/helpers/dates";
import { Table } from "@/components/shared/Table";
import { UsersActionsMenu } from "./UsersActionsMenu";

interface UsersTableProps {
  users: User[];
  total: number;
  pageIndex: number;
  pageSize: number;
  isLoading: boolean;
  selectedIds: Set<string>;
  isAdmin: boolean;
  onPageChange: (pageIndex: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onSelectionChange: (id: string, checked: boolean) => void;
  onEditUser: (user: User) => void;
  onGenerateBudget: (user: User) => void;
}

export const UsersTable: FC<UsersTableProps> = ({
  users,
  total,
  pageIndex,
  pageSize,
  isLoading,
  selectedIds,
  isAdmin,
  onPageChange,
  onPageSizeChange,
  onSelectionChange,
  onEditUser,
  onGenerateBudget,
}) => {
  const columns = useMemo<ColumnDef<User>[]>(
    () => [
      {
        id: "select",
        header: "",
        cell: (info) => {
          const user = info.row.original;
          return (
            <input
              type="checkbox"
              checked={selectedIds.has(user.id)}
              onChange={(e) => onSelectionChange(user.id, e.target.checked)}
              className="h-4 w-4 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-600"
              aria-label={`Seleccionar ${user.email}`}
            />
          );
        },
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: (info) => (
          <span className="text-gray-900">{info.getValue() as string}</span>
        ),
      },
      {
        id: "name",
        header: "Nombre",
        cell: (info) => {
          const user = info.row.original;
          return (
            <span className="text-gray-900">
              {user.FullName ||
                `${user.firstName} ${user.lastName}`.trim() ||
                "-"}
            </span>
          );
        },
      },
      {
        accessorKey: "dnif",
        header: "DNI",
        cell: (info) => (
          <span className="text-gray-600">
            {(info.getValue() as string) || "-"}
          </span>
        ),
      },
      {
        accessorKey: "phone",
        header: "Teléfono",
        cell: (info) => (
          <span className="text-gray-600">
            {(info.getValue() as string) || "-"}
          </span>
        ),
      },
      {
        accessorKey: "discount",
        header: "Descuento",
        cell: (info) => {
          const discount = info.getValue() as number;
          return (
            <span className="text-gray-600">
              {discount ? `${discount}%` : "-"}
            </span>
          );
        },
      },
      {
        accessorKey: "registered",
        header: "Fecha de alta",
        cell: (info) => (
          <span className="text-gray-600">
            {formatDate(info.getValue() as string)}
          </span>
        ),
      },
      {
        id: "actions",
        header: "Acciones",
        cell: (info) => (
          <UsersActionsMenu
            user={info.row.original}
            isAdmin={isAdmin}
            onEditUser={onEditUser}
            onGenerateBudget={onGenerateBudget}
          />
        ),
      },
    ],
    [selectedIds, isAdmin, onSelectionChange, onEditUser, onGenerateBudget],
  );

  return (
    <Table
      data={users}
      columns={columns}
      isLoading={isLoading}
      loadingMessage="Cargando usuarios..."
      emptyMessage="No se encontraron usuarios"
      getRowClassName={(user) => (user.problematic ? "bg-red-50" : "")}
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
