import { type FC, useMemo, useState, useCallback } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";
import { ArrowDownTrayIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  fetchAllInvoices,
  createCorrectiveInvoice,
} from "@/redux/actions/invoices";
import {
  clearInvoicesErrors,
  resetCreateCorrectiveInvoiceRequest,
} from "@/redux/slices/invoicesSlice";
import { PageHeader } from "@/components/shared/PageHeader";
import { ModalCreateCorrectiveInvoice } from "@/components/invoices/ModalCreateCorrectiveInvoice";
import { AlertInvoices } from "@/components/invoices/AlertInvoices";
import { SearchInvoices } from "@/components/invoices/SearchInvoices";
import { useInvoiceSearch } from "@/hooks/useInvoiceSearch";
import type { Invoice } from "@/types/invoices";
import { formatDate } from "@/helpers/dates";
import { formatCurrency, formatInvoiceNumber } from "@/helpers";

export const Invoices: FC = () => {
  const dispatch = useAppDispatch();
  const { invoices, fetchInvoicesRequest, createCorrectiveInvoiceRequest } =
    useAppSelector((state) => state.invoices);

  const {
    selectedBusinessId,
    budgetNumber,
    appliedFilters,
    businesses,
    isLoading,
    handleSearch,
    handleClearFilters,
    handleBusinessChange,
    handleBudgetNumberChange,
  } = useInvoiceSearch();

  // Corrective invoice modal states
  const [isCorrectiveModalOpen, setIsCorrectiveModalOpen] = useState(false);
  const [selectedInvoiceForCorrective, setSelectedInvoiceForCorrective] =
    useState<Invoice | null>(null);

  const handleCloseAlert = () => {
    dispatch(clearInvoicesErrors());
  };

  const handleOpenCorrectiveModal = useCallback((invoice: Invoice) => {
    setSelectedInvoiceForCorrective(invoice);
    setIsCorrectiveModalOpen(true);
  }, []);

  const handleCloseCorrectiveModal = useCallback(() => {
    setIsCorrectiveModalOpen(false);
    setSelectedInvoiceForCorrective(null);
    dispatch(resetCreateCorrectiveInvoiceRequest());
  }, [dispatch]);

  const handleCreateCorrective = useCallback(
    async (reason: string) => {
      if (!selectedInvoiceForCorrective) return;

      const result = await dispatch(
        createCorrectiveInvoice({
          original_invoice_id: selectedInvoiceForCorrective.id,
          corrective_reason: reason,
        }),
      );

      if (createCorrectiveInvoice.fulfilled.match(result)) {
        handleCloseCorrectiveModal();
        // Refresh invoices list
        dispatch(
          fetchAllInvoices({
            businessId: appliedFilters.businessId || undefined,
            budgetReference: appliedFilters.budgetNumber || undefined,
          }),
        );
      }
    },
    [
      selectedInvoiceForCorrective,
      dispatch,
      appliedFilters,
      handleCloseCorrectiveModal,
    ],
  );

  const columns = useMemo<ColumnDef<Invoice>[]>(
    () => [
      {
        accessorKey: "invoice_number",
        header: "Nº Factura",
        cell: (info) => {
          const invoice = info.row.original;
          const invoiceTypeName = invoice.invoices_type?.invoices;

          return (
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900">
                {formatInvoiceNumber(
                  info.getValue() as number,
                  invoice.created_at,
                )}
              </span>
              {invoice.is_corrective ? (
                <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
                  Rectificativa
                </span>
              ) : (
                invoiceTypeName && (
                  <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                    {invoiceTypeName}
                  </span>
                )
              )}
            </div>
          );
        },
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
          return (
            <div className="flex items-center gap-2">
              {invoice.pdf_url ? (
                <a
                  href={invoice.pdf_url}
                  download={`factura_${formatInvoiceNumber(invoice.invoice_number, invoice.created_at).replace("/", "_")}.pdf`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  title="Descargar PDF"
                >
                  <ArrowDownTrayIcon className="h-4 w-4" />
                </a>
              ) : (
                <span className="text-xs text-gray-400">Sin PDF</span>
              )}

              {/* Corrective invoice button - only show if not already corrective */}
              {!invoice.is_corrective && (
                <button
                  onClick={() => handleOpenCorrectiveModal(invoice)}
                  className="inline-flex items-center gap-1 rounded-md bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                  title="Crear factura rectificativa"
                >
                  <ArrowPathIcon className="h-4 w-4" />
                </button>
              )}
            </div>
          );
        },
      },
    ],
    [handleOpenCorrectiveModal],
  );

  const table = useReactTable({
    data: invoices,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <>
      <AlertInvoices
        fetchInvoicesRequest={fetchInvoicesRequest}
        createCorrectiveInvoiceRequest={createCorrectiveInvoiceRequest}
        onClose={handleCloseAlert}
      />

      <ModalCreateCorrectiveInvoice
        isOpen={isCorrectiveModalOpen}
        onClose={handleCloseCorrectiveModal}
        onConfirm={handleCreateCorrective}
        invoice={selectedInvoiceForCorrective}
        isCreating={createCorrectiveInvoiceRequest.inProgress}
      />

      <div className="px-4 py-8 sm:px-6 lg:px-8">
        <PageHeader title="Facturas" description="Gestiona tus facturas" />

        {/* Filtros */}
        <SearchInvoices
          selectedBusinessId={selectedBusinessId}
          budgetNumber={budgetNumber}
          appliedFilters={appliedFilters}
          businesses={businesses}
          isLoading={isLoading}
          onBusinessChange={handleBusinessChange}
          onBudgetNumberChange={handleBudgetNumberChange}
          onSearch={handleSearch}
          onClearFilters={handleClearFilters}
        />

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
