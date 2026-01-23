import { type FC, useEffect, useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";
import { PencilIcon, TrashIcon, PlusIcon } from "@heroicons/react/24/outline";
import { Modal } from "@/components/shared/Modal";
import { Alert } from "@/components/shared/Alert";
import { PageHeader } from "@/components/shared/PageHeader";
import { BusinessForm } from "@/components/settings/business/BusinessForm";
import { TaxesTypesForm } from "@/components/settings/taxesTypes/TaxesTypesForm";
import { InvoicesTypesForm } from "@/components/settings/invoicesTypes/InvoicesTypesForm";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  fetchAllBusiness,
  createBusiness,
  updateBusiness,
  deleteBusiness,
} from "@/redux/actions/business";
import {
  fetchAllTaxesTypes,
  createTaxesType,
  updateTaxesType,
  deleteTaxesType,
} from "@/redux/actions/taxesTypes";
import {
  fetchAllInvoicesTypes,
  createInvoicesType,
  updateInvoicesType,
  deleteInvoicesType,
} from "@/redux/actions/invoicesTypes";
import {
  clearBusinessErrors,
  clearCreateBusinessSuccess,
  clearUpdateBusinessSuccess,
  clearDeleteBusinessSuccess,
} from "@/redux/slices/businessSlice";
import {
  clearTaxesTypesErrors,
  clearCreateTaxesTypeSuccess,
  clearUpdateTaxesTypeSuccess,
  clearDeleteTaxesTypeSuccess,
} from "@/redux/slices/taxesTypesSlice";
import {
  clearInvoicesTypesErrors,
  clearCreateInvoicesTypeSuccess,
  clearUpdateInvoicesTypeSuccess,
  clearDeleteInvoicesTypeSuccess,
} from "@/redux/slices/invoicesTypesSlice";
import type { Business, BusinessFormData } from "@/types/business";
import type { TaxesType, TaxesTypeFormData } from "@/types/taxesTypes";
import type { InvoicesType, InvoicesTypeFormData } from "@/types/invoicesTypes";
import Button from "@/components/shared/Button";

type ModalMode = "create" | "edit" | "delete" | null;
type TabType = "business" | "taxesTypes" | "invoicesTypes";

// Hoist tab configuration outside component (Section 6.3)
const TABS = [
  { id: "business" as const, label: "Empresas" },
  { id: "taxesTypes" as const, label: "Tipos de Impuestos" },
  { id: "invoicesTypes" as const, label: "Tipos de Facturas" },
] as const;

export const Settings: FC = () => {
  const dispatch = useAppDispatch();

  // Business state
  const {
    businesses,
    fetchBusinessRequest,
    createBusinessRequest,
    updateBusinessRequest,
    deleteBusinessRequest,
  } = useAppSelector((state) => state.business);

  // TaxesTypes state
  const {
    taxesTypes,
    fetchTaxesTypesRequest,
    createTaxesTypeRequest,
    updateTaxesTypeRequest,
    deleteTaxesTypeRequest,
  } = useAppSelector((state) => state.taxesTypes);

  // InvoicesTypes state
  const {
    invoicesTypes,
    fetchInvoicesTypesRequest,
    createInvoicesTypeRequest,
    updateInvoicesTypeRequest,
    deleteInvoicesTypeRequest,
  } = useAppSelector((state) => state.invoicesTypes);

  const [activeTab, setActiveTab] = useState<TabType>("business");
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(
    null,
  );
  const [selectedTaxesType, setSelectedTaxesType] = useState<TaxesType | null>(
    null,
  );
  const [selectedInvoicesType, setSelectedInvoicesType] =
    useState<InvoicesType | null>(null);

  // Load data on mount (Section 1.4: Promise.all for independent operations)
  useEffect(() => {
    Promise.all([
      dispatch(fetchAllBusiness()),
      dispatch(fetchAllTaxesTypes()),
      dispatch(fetchAllInvoicesTypes()),
    ]);
  }, [dispatch]);

  // Business effects
  useEffect(() => {
    if (createBusinessRequest.ok && !createBusinessRequest.inProgress) {
      setModalMode(null);
      setSelectedBusiness(null);
      setTimeout(() => dispatch(clearCreateBusinessSuccess()), 3000);
    }
  }, [createBusinessRequest, dispatch]);

  useEffect(() => {
    if (updateBusinessRequest.ok && !updateBusinessRequest.inProgress) {
      setModalMode(null);
      setSelectedBusiness(null);
      setTimeout(() => dispatch(clearUpdateBusinessSuccess()), 3000);
    }
  }, [updateBusinessRequest, dispatch]);

  useEffect(() => {
    if (deleteBusinessRequest.ok && !deleteBusinessRequest.inProgress) {
      setModalMode(null);
      setSelectedBusiness(null);
      setTimeout(() => dispatch(clearDeleteBusinessSuccess()), 3000);
    }
  }, [deleteBusinessRequest, dispatch]);

  // TaxesTypes effects
  useEffect(() => {
    if (createTaxesTypeRequest.ok && !createTaxesTypeRequest.inProgress) {
      setModalMode(null);
      setSelectedTaxesType(null);
      setTimeout(() => dispatch(clearCreateTaxesTypeSuccess()), 3000);
    }
  }, [createTaxesTypeRequest, dispatch]);

  useEffect(() => {
    if (updateTaxesTypeRequest.ok && !updateTaxesTypeRequest.inProgress) {
      setModalMode(null);
      setSelectedTaxesType(null);
      setTimeout(() => dispatch(clearUpdateTaxesTypeSuccess()), 3000);
    }
  }, [updateTaxesTypeRequest, dispatch]);

  useEffect(() => {
    if (deleteTaxesTypeRequest.ok && !deleteTaxesTypeRequest.inProgress) {
      setModalMode(null);
      setSelectedTaxesType(null);
      setTimeout(() => dispatch(clearDeleteTaxesTypeSuccess()), 3000);
    }
  }, [deleteTaxesTypeRequest, dispatch]);

  // InvoicesTypes effects
  useEffect(() => {
    if (createInvoicesTypeRequest.ok && !createInvoicesTypeRequest.inProgress) {
      setModalMode(null);
      setSelectedInvoicesType(null);
      setTimeout(() => dispatch(clearCreateInvoicesTypeSuccess()), 3000);
    }
  }, [createInvoicesTypeRequest, dispatch]);

  useEffect(() => {
    if (updateInvoicesTypeRequest.ok && !updateInvoicesTypeRequest.inProgress) {
      setModalMode(null);
      setSelectedInvoicesType(null);
      setTimeout(() => dispatch(clearUpdateInvoicesTypeSuccess()), 3000);
    }
  }, [updateInvoicesTypeRequest, dispatch]);

  useEffect(() => {
    if (deleteInvoicesTypeRequest.ok && !deleteInvoicesTypeRequest.inProgress) {
      setModalMode(null);
      setSelectedInvoicesType(null);
      setTimeout(() => dispatch(clearDeleteInvoicesTypeSuccess()), 3000);
    }
  }, [deleteInvoicesTypeRequest, dispatch]);

  // Business handlers
  const handleCreateBusiness = () => {
    setSelectedBusiness(null);
    setModalMode("create");
  };

  const handleEditBusiness = (business: Business) => {
    setSelectedBusiness(business);
    setModalMode("edit");
  };

  const handleDeleteBusinessClick = (business: Business) => {
    setSelectedBusiness(business);
    setModalMode("delete");
  };

  const handleBusinessFormSubmit = (formData: BusinessFormData) => {
    if (modalMode === "create") {
      dispatch(createBusiness(formData));
    } else if (modalMode === "edit" && selectedBusiness) {
      dispatch(updateBusiness({ id: selectedBusiness.id, updates: formData }));
    }
  };

  const handleDeleteBusiness = () => {
    if (!selectedBusiness) return;
    dispatch(deleteBusiness(selectedBusiness.id));
  };

  // TaxesTypes handlers
  const handleCreateTaxesType = () => {
    setSelectedTaxesType(null);
    setModalMode("create");
  };

  const handleEditTaxesType = (taxesType: TaxesType) => {
    setSelectedTaxesType(taxesType);
    setModalMode("edit");
  };

  const handleDeleteTaxesTypeClick = (taxesType: TaxesType) => {
    setSelectedTaxesType(taxesType);
    setModalMode("delete");
  };

  const handleTaxesTypeFormSubmit = (formData: TaxesTypeFormData) => {
    if (modalMode === "create") {
      dispatch(createTaxesType(formData));
    } else if (modalMode === "edit" && selectedTaxesType) {
      dispatch(
        updateTaxesType({ id: selectedTaxesType.id, updates: formData }),
      );
    }
  };

  const handleDeleteTaxesType = () => {
    if (!selectedTaxesType) return;
    dispatch(deleteTaxesType(selectedTaxesType.id));
  };

  // InvoicesTypes handlers
  const handleCreateInvoicesType = () => {
    setSelectedInvoicesType(null);
    setModalMode("create");
  };

  const handleEditInvoicesType = (invoicesType: InvoicesType) => {
    setSelectedInvoicesType(invoicesType);
    setModalMode("edit");
  };

  const handleDeleteInvoicesTypeClick = (invoicesType: InvoicesType) => {
    setSelectedInvoicesType(invoicesType);
    setModalMode("delete");
  };

  const handleInvoicesTypeFormSubmit = (formData: InvoicesTypeFormData) => {
    if (modalMode === "create") {
      dispatch(createInvoicesType(formData));
    } else if (modalMode === "edit" && selectedInvoicesType) {
      dispatch(
        updateInvoicesType({ id: selectedInvoicesType.id, updates: formData }),
      );
    }
  };

  const handleDeleteInvoicesType = () => {
    if (!selectedInvoicesType) return;
    dispatch(deleteInvoicesType(selectedInvoicesType.id));
  };

  const handleModalAccept = () => {
    if (modalMode === "delete") {
      if (activeTab === "business") {
        handleDeleteBusiness();
      } else if (activeTab === "taxesTypes") {
        handleDeleteTaxesType();
      } else {
        handleDeleteInvoicesType();
      }
    } else {
      const form = document.querySelector("form") as HTMLFormElement;
      if (form) {
        form.dispatchEvent(
          new Event("submit", { cancelable: true, bubbles: true }),
        );
      }
    }
  };

  const handleCloseModal = () => {
    setModalMode(null);
    setSelectedBusiness(null);
    setSelectedTaxesType(null);
    setSelectedInvoicesType(null);
  };

  // Business columns (Section 5.4: Extract to memoized components)
  const businessColumns = useMemo<ColumnDef<Business>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Nombre",
        cell: (info) => (
          <span className="font-medium text-gray-900">
            {info.getValue() as string}
          </span>
        ),
      },
      {
        accessorKey: "nif",
        header: "NIF",
        cell: (info) => (
          <span className="text-gray-600">{info.getValue() as string}</span>
        ),
      },
      {
        id: "actions",
        header: "Acciones",
        cell: (info) => {
          const business = info.row.original;
          return (
            <div className="flex items-center gap-2">
              <Button
                title="Editar"
                onClick={() => handleEditBusiness(business)}
                variant="secondary"
                size="sm"
                icon={<PencilIcon className="h-4 w-4" />}
              />
              <Button
                title="Eliminar"
                onClick={() => handleDeleteBusinessClick(business)}
                variant="secondary"
                size="sm"
                icon={<TrashIcon className="h-4 w-4" />}
              />
            </div>
          );
        },
      },
    ],
    [],
  );

  // TaxesTypes columns
  const taxesTypesColumns = useMemo<ColumnDef<TaxesType>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Nombre",
        cell: (info) => (
          <span className="font-medium text-gray-900">
            {info.getValue() as string}
          </span>
        ),
      },
      {
        accessorKey: "tax",
        header: "Impuesto (%)",
        cell: (info) => (
          <span className="text-gray-600">
            {(info.getValue() as number).toFixed(2)}%
          </span>
        ),
      },
      {
        id: "actions",
        header: "Acciones",
        cell: (info) => {
          const taxesType = info.row.original;
          return (
            <div className="flex items-center gap-2">
              <Button
                title="Editar"
                onClick={() => handleEditTaxesType(taxesType)}
                variant="secondary"
                size="sm"
                icon={<PencilIcon className="h-4 w-4" />}
              />
              <Button
                title="Eliminar"
                onClick={() => handleDeleteTaxesTypeClick(taxesType)}
                variant="secondary"
                size="sm"
                icon={<TrashIcon className="h-4 w-4" />}
              />
            </div>
          );
        },
      },
    ],
    [],
  );

  // InvoicesTypes columns
  const invoicesTypesColumns = useMemo<ColumnDef<InvoicesType>[]>(
    () => [
      {
        accessorKey: "invoices",
        header: "Nombre",
        cell: (info) => (
          <span className="font-medium text-gray-900">
            {info.getValue() as string}
          </span>
        ),
      },
      {
        accessorKey: "percentage",
        header: "Porcentaje (%)",
        cell: (info) => (
          <span className="text-gray-600">
            {(info.getValue() as number).toFixed(2)}%
          </span>
        ),
      },
      {
        id: "actions",
        header: "Acciones",
        cell: (info) => {
          const invoicesType = info.row.original;
          return (
            <div className="flex items-center gap-2">
              <Button
                title="Editar"
                onClick={() => handleEditInvoicesType(invoicesType)}
                variant="secondary"
                size="sm"
                icon={<PencilIcon className="h-4 w-4" />}
              />
              <Button
                title="Eliminar"
                onClick={() => handleDeleteInvoicesTypeClick(invoicesType)}
                variant="secondary"
                size="sm"
                icon={<TrashIcon className="h-4 w-4" />}
              />
            </div>
          );
        },
      },
    ],
    [],
  );

  const businessTable = useReactTable({
    data: businesses,
    columns: businessColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  const taxesTypesTable = useReactTable({
    data: taxesTypes,
    columns: taxesTypesColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  const invoicesTypesTable = useReactTable({
    data: invoicesTypes,
    columns: invoicesTypesColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  const isBusinessLoading = fetchBusinessRequest.inProgress;
  const isTaxesTypesLoading = fetchTaxesTypesRequest.inProgress;
  const isInvoicesTypesLoading = fetchInvoicesTypesRequest.inProgress;
  const isBusinessSaving =
    createBusinessRequest.inProgress ||
    updateBusinessRequest.inProgress ||
    deleteBusinessRequest.inProgress;
  const isTaxesTypesSaving =
    createTaxesTypeRequest.inProgress ||
    updateTaxesTypeRequest.inProgress ||
    deleteTaxesTypeRequest.inProgress;
  const isInvoicesTypesSaving =
    createInvoicesTypeRequest.inProgress ||
    updateInvoicesTypeRequest.inProgress ||
    deleteInvoicesTypeRequest.inProgress;

  // Determine error messages
  const businessErrorMessage =
    (!fetchBusinessRequest.ok && fetchBusinessRequest.messages) ||
    (!createBusinessRequest.ok && createBusinessRequest.messages) ||
    (!updateBusinessRequest.ok && updateBusinessRequest.messages) ||
    (!deleteBusinessRequest.ok && deleteBusinessRequest.messages) ||
    null;

  const taxesTypesErrorMessage =
    (!fetchTaxesTypesRequest.ok && fetchTaxesTypesRequest.messages) ||
    (!createTaxesTypeRequest.ok && createTaxesTypeRequest.messages) ||
    (!updateTaxesTypeRequest.ok && updateTaxesTypeRequest.messages) ||
    (!deleteTaxesTypeRequest.ok && deleteTaxesTypeRequest.messages) ||
    null;

  const invoicesTypesErrorMessage =
    (!fetchInvoicesTypesRequest.ok && fetchInvoicesTypesRequest.messages) ||
    (!createInvoicesTypeRequest.ok && createInvoicesTypeRequest.messages) ||
    (!updateInvoicesTypeRequest.ok && updateInvoicesTypeRequest.messages) ||
    (!deleteInvoicesTypeRequest.ok && deleteInvoicesTypeRequest.messages) ||
    null;

  const isLoading =
    activeTab === "business"
      ? isBusinessLoading
      : activeTab === "taxesTypes"
        ? isTaxesTypesLoading
        : isInvoicesTypesLoading;

  const isSaving =
    activeTab === "business"
      ? isBusinessSaving
      : activeTab === "taxesTypes"
        ? isTaxesTypesSaving
        : isInvoicesTypesSaving;

  // Helper function to render table based on active tab
  const renderTable = () => {
    if (activeTab === "business") {
      return (
        <>
          <thead className="bg-gray-50">
            {businessTable.getHeaderGroups().map((headerGroup) => (
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
                  colSpan={businessColumns.length}
                  className="px-3 py-12 text-center text-sm text-gray-500"
                >
                  <div className="flex items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                    <span className="ml-3">Cargando...</span>
                  </div>
                </td>
              </tr>
            ) : businesses.length === 0 ? (
              <tr>
                <td
                  colSpan={businessColumns.length}
                  className="px-3 py-12 text-center text-sm text-gray-500"
                >
                  No hay registros. Haz clic en el botón "Nueva Empresa" para
                  comenzar.
                </td>
              </tr>
            ) : (
              businessTable.getRowModel().rows.map((row) => (
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
        </>
      );
    } else if (activeTab === "taxesTypes") {
      return (
        <>
          <thead className="bg-gray-50">
            {taxesTypesTable.getHeaderGroups().map((headerGroup) => (
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
                  colSpan={taxesTypesColumns.length}
                  className="px-3 py-12 text-center text-sm text-gray-500"
                >
                  <div className="flex items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                    <span className="ml-3">Cargando...</span>
                  </div>
                </td>
              </tr>
            ) : taxesTypes.length === 0 ? (
              <tr>
                <td
                  colSpan={taxesTypesColumns.length}
                  className="px-3 py-12 text-center text-sm text-gray-500"
                >
                  No hay registros. Haz clic en el botón "Nuevo Tipo de
                  Impuesto" para comenzar.
                </td>
              </tr>
            ) : (
              taxesTypesTable.getRowModel().rows.map((row) => (
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
        </>
      );
    } else {
      return (
        <>
          <thead className="bg-gray-50">
            {invoicesTypesTable.getHeaderGroups().map((headerGroup) => (
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
                  colSpan={invoicesTypesColumns.length}
                  className="px-3 py-12 text-center text-sm text-gray-500"
                >
                  <div className="flex items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                    <span className="ml-3">Cargando...</span>
                  </div>
                </td>
              </tr>
            ) : invoicesTypes.length === 0 ? (
              <tr>
                <td
                  colSpan={invoicesTypesColumns.length}
                  className="px-3 py-12 text-center text-sm text-gray-500"
                >
                  No hay registros. Haz clic en el botón "Nuevo Tipo de Factura"
                  para comenzar.
                </td>
              </tr>
            ) : (
              invoicesTypesTable.getRowModel().rows.map((row) => (
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
        </>
      );
    }
  };

  return (
    <>
      {/* Alerts */}
      {businessErrorMessage && activeTab === "business" && (
        <Alert
          title="Error"
          description={businessErrorMessage}
          onClose={() => dispatch(clearBusinessErrors())}
        />
      )}

      {taxesTypesErrorMessage && activeTab === "taxesTypes" && (
        <Alert
          title="Error"
          description={taxesTypesErrorMessage}
          onClose={() => dispatch(clearTaxesTypesErrors())}
        />
      )}

      {invoicesTypesErrorMessage && activeTab === "invoicesTypes" && (
        <Alert
          title="Error"
          description={invoicesTypesErrorMessage}
          onClose={() => dispatch(clearInvoicesTypesErrors())}
        />
      )}

      {/* Modal Crear/Editar Business */}
      {activeTab === "business" &&
        (modalMode === "create" || modalMode === "edit") && (
          <Modal
            title={modalMode === "create" ? "Nueva Empresa" : "Editar Empresa"}
            onAccept={handleModalAccept}
            onClose={handleCloseModal}
            acceptText="Guardar"
            cancelText="Cancelar"
          >
            <BusinessForm
              business={selectedBusiness}
              onSubmit={handleBusinessFormSubmit}
              isLoading={isSaving}
            />
          </Modal>
        )}

      {/* Modal Eliminar Business */}
      {activeTab === "business" &&
        modalMode === "delete" &&
        selectedBusiness && (
          <Modal
            title="Eliminar Empresa"
            onAccept={handleModalAccept}
            onClose={handleCloseModal}
            acceptText="Eliminar"
            cancelText="Cancelar"
          >
            <p className="text-gray-600">
              ¿Estás seguro de que deseas eliminar la empresa{" "}
              <span className="font-semibold">{selectedBusiness.name}</span>?
              Esta acción no se puede deshacer.
            </p>
          </Modal>
        )}

      {/* Modal Crear/Editar TaxesType */}
      {activeTab === "taxesTypes" &&
        (modalMode === "create" || modalMode === "edit") && (
          <Modal
            title={
              modalMode === "create"
                ? "Nuevo Tipo de Impuesto"
                : "Editar Tipo de Impuesto"
            }
            onAccept={handleModalAccept}
            onClose={handleCloseModal}
            acceptText="Guardar"
            cancelText="Cancelar"
          >
            <TaxesTypesForm
              taxesType={selectedTaxesType}
              onSubmit={handleTaxesTypeFormSubmit}
              isLoading={isSaving}
            />
          </Modal>
        )}

      {/* Modal Eliminar TaxesType */}
      {activeTab === "taxesTypes" &&
        modalMode === "delete" &&
        selectedTaxesType && (
          <Modal
            title="Eliminar Tipo de Impuesto"
            onAccept={handleModalAccept}
            onClose={handleCloseModal}
            acceptText="Eliminar"
            cancelText="Cancelar"
          >
            <p className="text-gray-600">
              ¿Estás seguro de que deseas eliminar el tipo de impuesto{" "}
              <span className="font-semibold">{selectedTaxesType.name}</span>?
              Esta acción no se puede deshacer.
            </p>
          </Modal>
        )}

      {/* Modal Crear/Editar InvoicesType */}
      {activeTab === "invoicesTypes" &&
        (modalMode === "create" || modalMode === "edit") && (
          <Modal
            title={
              modalMode === "create"
                ? "Nuevo Tipo de Factura"
                : "Editar Tipo de Factura"
            }
            onAccept={handleModalAccept}
            onClose={handleCloseModal}
            acceptText="Guardar"
            cancelText="Cancelar"
          >
            <InvoicesTypesForm
              invoicesType={selectedInvoicesType}
              onSubmit={handleInvoicesTypeFormSubmit}
              isLoading={isSaving}
            />
          </Modal>
        )}

      {/* Modal Eliminar InvoicesType */}
      {activeTab === "invoicesTypes" &&
        modalMode === "delete" &&
        selectedInvoicesType && (
          <Modal
            title="Eliminar Tipo de Factura"
            onAccept={handleModalAccept}
            onClose={handleCloseModal}
            acceptText="Eliminar"
            cancelText="Cancelar"
          >
            <p className="text-gray-600">
              ¿Estás seguro de que deseas eliminar el tipo de factura{" "}
              <span className="font-semibold">
                {selectedInvoicesType.invoices}
              </span>
              ? Esta acción no se puede deshacer.
            </p>
          </Modal>
        )}

      {/* Page Content */}
      <div className="px-4 py-8 sm:px-6 lg:px-8">
        <PageHeader
          title="Ajustes"
          description="Gestiona los datos fiscales de las empresas, tipos de impuestos y tipos de facturas"
        />

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors
                  ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Create button */}
        <div className="mb-4">
          <Button
            title={
              activeTab === "business"
                ? "Nueva Empresa"
                : activeTab === "taxesTypes"
                  ? "Nuevo Tipo de Impuesto"
                  : "Nuevo Tipo de Factura"
            }
            onClick={
              activeTab === "business"
                ? handleCreateBusiness
                : activeTab === "taxesTypes"
                  ? handleCreateTaxesType
                  : handleCreateInvoicesType
            }
            disabled={isSaving}
            icon={<PlusIcon className="h-5 w-5" />}
          />
        </div>

        {/* Table */}
        <div className="overflow-hidden shadow ring-1 ring-black/5 sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            {renderTable()}
          </table>
        </div>
      </div>
    </>
  );
};
