import { type FC, useEffect, useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchAllInvoices } from "@/redux/actions/invoices";
import { fetchAllBusiness } from "@/redux/actions/business";
import { clearInvoicesErrors } from "@/redux/slices/invoicesSlice";
import { Alert } from "@/components/shared/Alert";
import { PageHeader } from "@/components/shared/PageHeader";
import type { Invoice } from "@/types/invoices";
import { formatDate } from "@/helpers/dates";
import { formatCurrency } from "@/helpers";

export const Invoices: FC = () => {
  const dispatch = useAppDispatch();
  const { invoices, fetchInvoicesRequest } = useAppSelector(
    (state) => state.invoices,
  );
  const { businesses } = useAppSelector((state) => state.business);

  // Filter states
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>("");
  const [budgetNumber, setBudgetNumber] = useState("");
  const [appliedFilters, setAppliedFilters] = useState({
    businessId: "",
    budgetNumber: "",
  });

  // Load businesses on mount
  useEffect(() => {
    if (businesses.length === 0) {
      dispatch(fetchAllBusiness());
    }
  }, [dispatch, businesses.length]);

  // Load invoices when filters change
  useEffect(() => {
    dispatch(
      fetchAllInvoices({
        businessId: appliedFilters.businessId || undefined,
        budgetReference: appliedFilters.budgetNumber || undefined,
      }),
    );
  }, [dispatch, appliedFilters]);

  const handleCloseAlert = () => {
    dispatch(clearInvoicesErrors());
  };

  const handleSearch = () => {
    setAppliedFilters({
      businessId: selectedBusinessId,
      budgetNumber: budgetNumber.trim(),
    });
  };

  const handleClearFilters = () => {
    setSelectedBusinessId("");
    setBudgetNumber("");
    setAppliedFilters({
      businessId: "",
      budgetNumber: "",
    });
  };

  const columns = useMemo<ColumnDef<Invoice>[]>(
    () => [
      {
        accessorKey: "invoice_number",
        header: "Nº Factura",
        cell: (info) => (
          <span className="font-medium text-gray-900">
            #{info.getValue() as number}
          </span>
        ),
      },
      {
        accessorKey: "budget_reference",
        header: "Nº Presupuesto",
        cell: (info) => (
          <span className="font-medium text-gray-900">
            #{info.getValue() as number}
          </span>
        ),
      },
      {
        accessorKey: "business.name",
        header: "Empresa",
        cell: (info) => {
          const invoice = info.row.original;
          const businessName = invoice.business?.name || "-";
          return <span className="text-gray-900">{businessName}</span>;
        },
      },
      {
        accessorKey: "price.total",
        header: "Total",
        cell: (info) => {
          const invoice = info.row.original;
          return (
            <span className="font-semibold text-gray-900">
              {formatCurrency(invoice.price?.total || 0)}
            </span>
          );
        },
      },
      {
        accessorKey: "created_at",
        header: "Fecha Creación",
        cell: (info) => (
          <span className="text-gray-600">
            {formatDate(info.getValue() as string)}
          </span>
        ),
      },
      {
        id: "actions",
        header: "Acciones",
        cell: (info) => {
          const invoice = info.row.original;
          return invoice.pdf_url ? (
            <a
              href={invoice.pdf_url}
              download={`factura_${invoice.invoice_number}.pdf`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              title="Descargar PDF"
            >
              <ArrowDownTrayIcon className="h-4 w-4" />
              PDF
            </a>
          ) : (
            <span className="text-xs text-gray-400">Sin PDF</span>
          );
        },
      },
    ],
    [],
  );

  const table = useReactTable({
    data: invoices,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const shouldShowError =
    fetchInvoicesRequest.messages &&
    !fetchInvoicesRequest.inProgress &&
    !fetchInvoicesRequest.ok;

  return (
    <>
      {shouldShowError && (
        <Alert
          title="Error al cargar facturas"
          description={fetchInvoicesRequest.messages}
          onClose={handleCloseAlert}
        />
      )}

      <div className="px-4 py-8 sm:px-6 lg:px-8">
        <PageHeader title="Facturas" description="Gestiona tus facturas" />

        {/* Filtros */}
        <div className="mt-6 rounded-lg bg-white p-4 shadow ring-1 ring-black/5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Select Empresa */}
            <div>
              <label
                htmlFor="business-filter"
                className="block text-sm font-medium text-gray-700"
              >
                Empresa
              </label>
              <select
                id="business-filter"
                value={selectedBusinessId}
                onChange={(e) => setSelectedBusinessId(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Todas las empresas</option>
                {businesses.map((business) => (
                  <option key={business.id} value={business.id}>
                    {business.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Input Número de Presupuesto */}
            <div>
              <label
                htmlFor="budgetNumber"
                className="block text-sm font-medium text-gray-700"
              >
                Nº Presupuesto
              </label>
              <input
                type="text"
                id="budgetNumber"
                value={budgetNumber}
                onChange={(e) => setBudgetNumber(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch();
                  }
                }}
                placeholder="Ej: 12345"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Botones */}
            <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-2">
              <button
                type="button"
                onClick={handleSearch}
                disabled={fetchInvoicesRequest.inProgress}
                className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                Buscar
              </button>
              <button
                type="button"
                onClick={handleClearFilters}
                disabled={fetchInvoicesRequest.inProgress}
                className="flex-1 rounded-md bg-gray-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                Limpiar
              </button>
            </div>
          </div>

          {/* Indicador de filtros activos */}
          {(appliedFilters.businessId || appliedFilters.budgetNumber) && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-600">Filtros activos:</span>
              {appliedFilters.businessId && (
                <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                  Empresa:{" "}
                  {businesses.find((b) => b.id === appliedFilters.businessId)
                    ?.name || appliedFilters.businessId}
                </span>
              )}
              {appliedFilters.budgetNumber && (
                <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                  Nº {appliedFilters.budgetNumber}
                </span>
              )}
            </div>
          )}
        </div>

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
                    {fetchInvoicesRequest.inProgress ? (
                      <tr>
                        <td
                          colSpan={columns.length}
                          className="px-3 py-12 text-center text-sm text-gray-500"
                        >
                          <div className="flex items-center justify-center">
                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                            <span className="ml-3">Cargando facturas...</span>
                          </div>
                        </td>
                      </tr>
                    ) : invoices.length === 0 ? (
                      <tr>
                        <td
                          colSpan={columns.length}
                          className="px-3 py-12 text-center text-sm text-gray-500"
                        >
                          No se encontraron facturas
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
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Invoices;
