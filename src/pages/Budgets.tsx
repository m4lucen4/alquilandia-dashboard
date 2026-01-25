import { type FC, useEffect, useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { fetchBudgets } from "../redux/actions/budgets";
import { clearBudgetsErrors } from "../redux/slices/budgetsSlice";
import { fetchAllBusiness } from "../redux/actions/business";
import { fetchAllTaxesTypes } from "../redux/actions/taxesTypes";
import { fetchAllInvoicesTypes } from "../redux/actions/invoicesTypes";
import { createInvoice } from "../redux/actions/invoices";
import {
  clearInvoicesErrors,
  resetCreateInvoiceRequest,
} from "../redux/slices/invoicesSlice";
import { Alert } from "../components/shared/Alert";
import { Modal } from "../components/shared/Modal";
import { Pagination } from "../components/budgets/Pagination";
import type { Budget } from "../types/budgets";
import { formatDate } from "@/helpers/dates";
import { formatCurrency } from "@/helpers";
import { PageHeader } from "@/components/shared/PageHeader";

export const Budgets: FC = () => {
  const dispatch = useAppDispatch();
  const { budgets, total, fetchBudgetsRequest } = useAppSelector(
    (state) => state.budgets,
  );
  const { businesses } = useAppSelector((state) => state.business);
  const { taxesTypes } = useAppSelector((state) => state.taxesTypes);
  const { invoicesTypes } = useAppSelector((state) => state.invoicesTypes);
  const { createInvoiceRequest } = useAppSelector((state) => state.invoices);

  const [pageIndex, setPageIndex] = useState(0);
  const pageSize = 10;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>("");
  const [selectedInvoicesTypeId, setSelectedInvoicesTypeId] =
    useState<string>("");
  const [selectedTaxesTypeId, setSelectedTaxesTypeId] = useState<string>("");

  // Estados para filtros de búsqueda
  const [budgetNumber, setBudgetNumber] = useState("");
  const [clientName, setClientName] = useState("");
  const [appliedFilters, setAppliedFilters] = useState({
    budgetNumber: "",
    clientName: "",
  });

  // Cargar empresas, tipos de impuestos y tipos de facturas al montar el componente
  useEffect(() => {
    Promise.all([
      businesses.length === 0 && dispatch(fetchAllBusiness()),
      taxesTypes.length === 0 && dispatch(fetchAllTaxesTypes()),
      invoicesTypes.length === 0 && dispatch(fetchAllInvoicesTypes()),
    ]);
  }, [dispatch, businesses.length, taxesTypes.length, invoicesTypes.length]);

  useEffect(() => {
    // Construir query de filtros
    const filters: string[] = [];

    if (appliedFilters.budgetNumber) {
      filters.push(`budgetReference=${appliedFilters.budgetNumber}`);
    }

    if (appliedFilters.clientName) {
      filters.push(`client=${encodeURIComponent(appliedFilters.clientName)}`);
    }

    const filtersQuery = filters.join("&");

    dispatch(
      fetchBudgets({
        pageSize,
        pageToFetch: pageIndex + 1,
        filtersQuery,
      }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageIndex, appliedFilters]);

  const handleCloseAlert = () => {
    dispatch(clearBudgetsErrors());
  };

  const handleCloseInvoiceAlert = () => {
    dispatch(clearInvoicesErrors());
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBudget(null);
    setSelectedBusinessId("");
    setSelectedInvoicesTypeId("");
    setSelectedTaxesTypeId("");
    dispatch(resetCreateInvoiceRequest());
  };

  const handleGenerateInvoice = async () => {
    if (
      !selectedBudget ||
      !selectedBusinessId ||
      !selectedInvoicesTypeId ||
      !selectedTaxesTypeId
    ) {
      return;
    }

    const result = await dispatch(
      createInvoice({
        business_id: selectedBusinessId,
        invoices_type_id: selectedInvoicesTypeId,
        taxes_type_id: selectedTaxesTypeId,
        budget_reference: selectedBudget.budgetReference,
        budgetlines: selectedBudget.budgetLines,
        price: selectedBudget.price,
      }),
    );

    if (createInvoice.fulfilled.match(result)) {
      handleCloseModal();
    }
  };

  const handleSearch = () => {
    setAppliedFilters({
      budgetNumber: budgetNumber.trim(),
      clientName: clientName.trim(),
    });
    setPageIndex(0); // Reset a la primera página cuando se busca
  };

  const handleClearFilters = () => {
    setBudgetNumber("");
    setClientName("");
    setAppliedFilters({
      budgetNumber: "",
      clientName: "",
    });
    setPageIndex(0); // Reset a la primera página
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      pending: {
        label: "PAID_PENDING",
        className: "bg-yellow-100 text-yellow-800",
      },
      confirmed: {
        label: "Confirmado",
        className: "bg-green-100 text-green-800",
      },
      cancelled: {
        label: "Cancelado",
        className: "bg-red-100 text-red-800",
      },
      completed: {
        label: "Completado",
        className: "bg-blue-100 text-blue-800",
      },
    };

    const config = statusConfig[status] || {
      label: status,
      className: "bg-gray-100 text-gray-800",
    };

    return (
      <span
        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${config.className}`}
      >
        {config.label}
      </span>
    );
  };

  const columns = useMemo<ColumnDef<Budget>[]>(
    () => [
      {
        accessorKey: "budgetReference",
        header: "Nº Presupuesto",
        cell: (info) => (
          <span className="font-medium text-gray-900">
            #{info.getValue() as number}
          </span>
        ),
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
        cell: (info) => getStatusBadge(info.getValue() as string),
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
            <Menu as="div" className="relative inline-block text-left">
              <MenuButton className="flex items-center rounded-full p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                <span className="sr-only">Abrir menú</span>
                <EllipsisVerticalIcon className="h-5 w-5" aria-hidden="true" />
              </MenuButton>

              <MenuItems
                transition
                className="absolute right-0 bottom-full z-10 mb-2 w-56 origin-bottom-right rounded-md bg-white shadow-lg ring-1 ring-black/5 transition focus:outline-none data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
              >
                <div className="py-1">
                  <MenuItem>
                    {({ focus }) => (
                      <button
                        onClick={() => {
                          setSelectedBudget(budget);
                          setIsModalOpen(true);
                        }}
                        className={`${
                          focus ? "bg-gray-100 text-gray-900" : "text-gray-700"
                        } block w-full px-4 py-2 text-left text-sm`}
                      >
                        Generar factura
                      </button>
                    )}
                  </MenuItem>
                </div>
              </MenuItems>
            </Menu>
          );
        },
      },
    ],
    [],
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
      setPageIndex(newPagination.pageIndex);
    },
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  });

  const shouldShowError =
    fetchBudgetsRequest.messages &&
    !fetchBudgetsRequest.inProgress &&
    !fetchBudgetsRequest.ok;

  return (
    <>
      {shouldShowError && (
        <Alert
          title="Error al cargar presupuestos"
          description={fetchBudgetsRequest.messages}
          onClose={handleCloseAlert}
        />
      )}

      {createInvoiceRequest.messages && !createInvoiceRequest.inProgress && (
        <Alert
          title={
            createInvoiceRequest.ok
              ? "Factura generada"
              : "Error al generar factura"
          }
          description={createInvoiceRequest.messages}
          onClose={handleCloseInvoiceAlert}
        />
      )}

      {isModalOpen && selectedBudget && (
        <Modal
          title="Generar Factura"
          onAccept={handleGenerateInvoice}
          onClose={handleCloseModal}
          acceptDisabled={
            !selectedBusinessId ||
            !selectedInvoicesTypeId ||
            !selectedTaxesTypeId ||
            createInvoiceRequest.inProgress
          }
        >
          <div className="space-y-4">
            <div>
              <p className="mb-4 text-sm text-gray-600">
                Selecciona los datos necesarios para generar la factura del
                presupuesto{" "}
                <span className="font-semibold">
                  #{selectedBudget.budgetReference}
                </span>
              </p>

              {/* Business Select */}
              <div className="mb-4">
                <label
                  htmlFor="business-select"
                  className="block text-sm font-medium text-gray-900"
                >
                  Empresa <span className="text-red-500">*</span>
                </label>
                <select
                  id="business-select"
                  value={selectedBusinessId}
                  onChange={(e) => setSelectedBusinessId(e.target.value)}
                  disabled={createInvoiceRequest.inProgress}
                  className="mt-2 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100"
                >
                  <option value="">Selecciona una empresa</option>
                  {businesses.map((business) => (
                    <option key={business.id} value={business.id}>
                      {business.name}
                    </option>
                  ))}
                </select>

                {businesses.length === 0 && (
                  <p className="mt-2 text-sm text-gray-500">
                    No hay empresas disponibles. Crea una empresa en Ajustes.
                  </p>
                )}
              </div>

              {/* Invoices Type Select */}
              <div className="mb-4">
                <label
                  htmlFor="invoices-type-select"
                  className="block text-sm font-medium text-gray-900"
                >
                  Tipo de Factura <span className="text-red-500">*</span>
                </label>
                <select
                  id="invoices-type-select"
                  value={selectedInvoicesTypeId}
                  onChange={(e) => setSelectedInvoicesTypeId(e.target.value)}
                  disabled={createInvoiceRequest.inProgress}
                  className="mt-2 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100"
                >
                  <option value="">Selecciona un tipo de factura</option>
                  {invoicesTypes.map((invoiceType) => (
                    <option key={invoiceType.id} value={invoiceType.id}>
                      {invoiceType.invoices} ({invoiceType.percentage}%)
                    </option>
                  ))}
                </select>

                {invoicesTypes.length === 0 && (
                  <p className="mt-2 text-sm text-gray-500">
                    No hay tipos de factura disponibles. Crea uno en Ajustes.
                  </p>
                )}
              </div>

              {/* Taxes Type Select */}
              <div>
                <label
                  htmlFor="taxes-type-select"
                  className="block text-sm font-medium text-gray-900"
                >
                  Tipo de Impuesto <span className="text-red-500">*</span>
                </label>
                <select
                  id="taxes-type-select"
                  value={selectedTaxesTypeId}
                  onChange={(e) => setSelectedTaxesTypeId(e.target.value)}
                  disabled={createInvoiceRequest.inProgress}
                  className="mt-2 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100"
                >
                  <option value="">Selecciona un tipo de impuesto</option>
                  {taxesTypes.map((taxType) => (
                    <option key={taxType.id} value={taxType.id}>
                      {taxType.name} ({taxType.tax}%)
                    </option>
                  ))}
                </select>

                {taxesTypes.length === 0 && (
                  <p className="mt-2 text-sm text-gray-500">
                    No hay tipos de impuesto disponibles. Crea uno en Ajustes.
                  </p>
                )}
              </div>

              {createInvoiceRequest.inProgress && (
                <div className="mt-4 flex items-center justify-center">
                  <div className="h-6 w-6 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                  <span className="ml-3 text-sm text-gray-600">
                    Generando factura...
                  </span>
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}

      <div className="px-4 py-8 sm:px-6 lg:px-8">
        <PageHeader
          title="Presupuestos"
          description="Gestiona tus presupuestos"
        />

        {/* Buscador */}
        <div className="mt-6 rounded-lg bg-white p-4 shadow ring-1 ring-black/5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

            {/* Input Cliente */}
            <div>
              <label
                htmlFor="clientName"
                className="block text-sm font-medium text-gray-700"
              >
                Cliente
              </label>
              <input
                type="text"
                id="clientName"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch();
                  }
                }}
                placeholder="Nombre del cliente"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Botones */}
            <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-2">
              <button
                type="button"
                onClick={handleSearch}
                disabled={fetchBudgetsRequest.inProgress}
                className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                Buscar
              </button>
              <button
                type="button"
                onClick={handleClearFilters}
                disabled={fetchBudgetsRequest.inProgress}
                className="flex-1 rounded-md bg-gray-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                Limpiar
              </button>
            </div>
          </div>

          {/* Indicador de filtros activos */}
          {(appliedFilters.budgetNumber || appliedFilters.clientName) && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-600">Filtros activos:</span>
              {appliedFilters.budgetNumber && (
                <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                  Nº {appliedFilters.budgetNumber}
                </span>
              )}
              {appliedFilters.clientName && (
                <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                  Cliente: {appliedFilters.clientName}
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
                    {fetchBudgetsRequest.inProgress ? (
                      <tr>
                        <td
                          colSpan={columns.length}
                          className="px-3 py-12 text-center text-sm text-gray-500"
                        >
                          <div className="flex items-center justify-center">
                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                            <span className="ml-3">
                              Cargando presupuestos...
                            </span>
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
                  onPageChange={setPageIndex}
                  canPreviousPage={table.getCanPreviousPage()}
                  canNextPage={table.getCanNextPage()}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
