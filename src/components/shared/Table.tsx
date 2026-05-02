import { type FC } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";
import { Pagination } from "@/components/shared/Pagination";

interface TableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData>[];
  isLoading: boolean;
  loadingMessage?: string;
  emptyMessage?: string;
  getRowClassName?: (row: TData) => string;
  pagination?: {
    pageIndex: number;
    pageSize: number;
    total: number;
    onPageChange: (pageIndex: number) => void;
    onPageSizeChange: (pageSize: number) => void;
  };
}

export const Table = <TData,>({
  data,
  columns,
  isLoading,
  loadingMessage = "Cargando...",
  emptyMessage = "No se encontraron resultados",
  getRowClassName,
  pagination,
}: TableProps<TData>): ReturnType<FC> => {
  const table = useReactTable({
    data,
    columns,
    ...(pagination && {
      pageCount: Math.ceil(pagination.total / pagination.pageSize),
      state: {
        pagination: {
          pageIndex: pagination.pageIndex,
          pageSize: pagination.pageSize,
        },
      },
      onPaginationChange: (updater) => {
        const newPagination =
          typeof updater === "function"
            ? updater({
                pageIndex: pagination.pageIndex,
                pageSize: pagination.pageSize,
              })
            : updater;
        pagination.onPageChange(newPagination.pageIndex);
      },
      manualPagination: true,
    }),
    getCoreRowModel: getCoreRowModel(),
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
                        <span className="ml-3">{loadingMessage}</span>
                      </div>
                    </td>
                  </tr>
                ) : data.length === 0 ? (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="px-3 py-12 text-center text-sm text-gray-500"
                    >
                      {emptyMessage}
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      className={`hover:bg-gray-50 ${getRowClassName ? getRowClassName(row.original) : ""}`}
                    >
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
          {pagination && data.length > 0 && (
            <Pagination
              currentPage={pagination.pageIndex}
              totalPages={table.getPageCount()}
              pageSize={pagination.pageSize}
              totalItems={pagination.total}
              onPageChange={pagination.onPageChange}
              canPreviousPage={table.getCanPreviousPage()}
              onPageSizeChange={pagination.onPageSizeChange}
              canNextPage={table.getCanNextPage()}
            />
          )}
        </div>
      </div>
    </div>
  );
};
