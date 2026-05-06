import { type FC, useMemo } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import type { Inventory } from "../../types/inventory";
import { Table } from "@/components/shared/Table";
import { InventoryActionsMenu } from "./InventoryActionsMenu";

interface InventoryTableProps {
  items: Inventory[];
  total: number;
  pageIndex: number;
  pageSize: number;
  isLoading: boolean;
  onPageChange: (pageIndex: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onViewImages: (item: Inventory) => void;
  onEdit: (item: Inventory) => void;
  onDelete: (item: Inventory) => void;
}

export const InventoryTable: FC<InventoryTableProps> = ({
  items,
  total,
  pageIndex,
  pageSize,
  isLoading,
  onPageChange,
  onPageSizeChange,
  onViewImages,
  onEdit,
  onDelete,
}) => {
  const columns = useMemo<ColumnDef<Inventory>[]>(
    () => [
      {
        id: "visibilidad",
        header: "Visibilidad",
        cell: (info) => {
          const isPrivate = info.row.original.private;
          return isPrivate ? (
            <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
              Privado
            </span>
          ) : (
            <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
              Público
            </span>
          );
        },
      },
      {
        id: "categoria",
        header: "Categoría",
        cell: (info) => (
          <span className="text-gray-600">
            {info.row.original.categoriaObj?.principal ?? "-"}
          </span>
        ),
      },
      {
        id: "subcategoria",
        header: "Subcategoría",
        cell: (info) => (
          <span className="text-gray-600">
            {info.row.original.categoriaObj?.nombre ?? "-"}
          </span>
        ),
      },
      {
        accessorKey: "elemento",
        header: "Elemento",
        cell: (info) => (
          <span className="block max-w-xs whitespace-normal break-words font-medium text-gray-900">
            {info.getValue() as string}
          </span>
        ),
      },
      {
        accessorKey: "unidades",
        header: "Uds.",
        cell: (info) => (
          <span className="text-gray-600">{info.getValue() as number}</span>
        ),
      },
      {
        accessorKey: "precioUd",
        header: "€/Ud.",
        cell: (info) => (
          <span className="text-gray-600">
            {(info.getValue() as number).toFixed(2)} €
          </span>
        ),
      },
      {
        id: "actions",
        header: "Acciones",
        cell: (info) => (
          <InventoryActionsMenu
            item={info.row.original}
            onViewImages={onViewImages}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ),
      },
    ],
    [onViewImages, onEdit, onDelete],
  );

  return (
    <Table
      data={items}
      columns={columns}
      isLoading={isLoading}
      loadingMessage="Cargando inventario..."
      emptyMessage="No se encontraron artículos"
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
