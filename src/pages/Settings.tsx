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
import { BusinessForm } from "@/components/settings/BusinessForm";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  fetchAllBusiness,
  createBusiness,
  updateBusiness,
  deleteBusiness,
} from "@/redux/actions/business";
import {
  clearBusinessErrors,
  clearCreateBusinessSuccess,
  clearUpdateBusinessSuccess,
  clearDeleteBusinessSuccess,
} from "@/redux/slices/businessSlice";
import type { Business, BusinessFormData } from "@/types/business";

type ModalMode = "create" | "edit" | "delete" | null;

export const Settings: FC = () => {
  const dispatch = useAppDispatch();
  const {
    businesses,
    fetchBusinessRequest,
    createBusinessRequest,
    updateBusinessRequest,
    deleteBusinessRequest,
  } = useAppSelector((state) => state.business);

  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(
    null,
  );

  // Cargar empresas al montar el componente
  useEffect(() => {
    dispatch(fetchAllBusiness());
  }, [dispatch]);

  // Cerrar modal y limpiar éxitos después de operaciones exitosas
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

  const handleCreate = () => {
    setSelectedBusiness(null);
    setModalMode("create");
  };

  const handleEdit = (business: Business) => {
    setSelectedBusiness(business);
    setModalMode("edit");
  };

  const handleDeleteClick = (business: Business) => {
    setSelectedBusiness(business);
    setModalMode("delete");
  };

  const handleFormSubmit = (formData: BusinessFormData) => {
    if (modalMode === "create") {
      dispatch(createBusiness(formData));
    } else if (modalMode === "edit" && selectedBusiness) {
      dispatch(updateBusiness({ id: selectedBusiness.id, updates: formData }));
    }
  };

  const handleDelete = () => {
    if (!selectedBusiness) return;
    dispatch(deleteBusiness(selectedBusiness.id));
  };

  const handleModalAccept = () => {
    if (modalMode === "delete") {
      handleDelete();
    } else {
      // Trigger form submission programmatically
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
  };

  const columns = useMemo<ColumnDef<Business>[]>(
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
        accessorKey: "address",
        header: "Dirección",
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
              <button
                onClick={() => handleEdit(business)}
                className="rounded-md p-2 text-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Editar empresa"
              >
                <PencilIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => handleDeleteClick(business)}
                className="rounded-md p-2 text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500"
                aria-label="Eliminar empresa"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          );
        },
      },
    ],
    [],
  );

  const table = useReactTable({
    data: businesses,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const isLoading = fetchBusinessRequest.inProgress;
  const isSaving =
    createBusinessRequest.inProgress ||
    updateBusinessRequest.inProgress ||
    deleteBusinessRequest.inProgress;

  // Determinar si hay errores
  const errorMessage =
    (!fetchBusinessRequest.ok && fetchBusinessRequest.messages) ||
    (!createBusinessRequest.ok && createBusinessRequest.messages) ||
    (!updateBusinessRequest.ok && updateBusinessRequest.messages) ||
    (!deleteBusinessRequest.ok && deleteBusinessRequest.messages) ||
    null;

  // Determinar si hay mensajes de éxito
  const successMessage =
    (createBusinessRequest.ok && createBusinessRequest.messages) ||
    (updateBusinessRequest.ok && updateBusinessRequest.messages) ||
    (deleteBusinessRequest.ok && deleteBusinessRequest.messages) ||
    null;

  return (
    <>
      {/* Alertas */}
      {errorMessage && (
        <Alert
          title="Error"
          description={errorMessage}
          onClose={() => dispatch(clearBusinessErrors())}
        />
      )}

      {successMessage && (
        <Alert
          title="Éxito"
          description={successMessage}
          onClose={() => {
            dispatch(clearCreateBusinessSuccess());
            dispatch(clearUpdateBusinessSuccess());
            dispatch(clearDeleteBusinessSuccess());
          }}
        />
      )}

      {/* Modal Crear/Editar */}
      {(modalMode === "create" || modalMode === "edit") && (
        <Modal
          title={modalMode === "create" ? "Nueva Empresa" : "Editar Empresa"}
          onAccept={handleModalAccept}
          onClose={handleCloseModal}
          acceptText="Guardar"
          cancelText="Cancelar"
        >
          <BusinessForm
            business={selectedBusiness}
            onSubmit={handleFormSubmit}
            isLoading={isSaving}
          />
        </Modal>
      )}

      {/* Modal Eliminar */}
      {modalMode === "delete" && selectedBusiness && (
        <Modal
          title="Eliminar Empresa"
          onAccept={handleModalAccept}
          onClose={handleCloseModal}
          acceptText="Eliminar"
          cancelText="Cancelar"
        >
          <p className="text-gray-600">
            ¿Estás seguro de que deseas eliminar la empresa{" "}
            <span className="font-semibold">{selectedBusiness.name}</span>? Esta
            acción no se puede deshacer.
          </p>
        </Modal>
      )}

      {/* Page Content */}
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <PageHeader
            title="Ajustes"
            description="Gestiona los datos fiscales de las empresas"
          />
          <button
            onClick={handleCreate}
            disabled={isSaving}
            className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            <PlusIcon className="h-5 w-5" />
            Nueva Empresa
          </button>
        </div>

        {/* Table */}
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
                      <span className="ml-3">Cargando empresas...</span>
                    </div>
                  </td>
                </tr>
              ) : businesses.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-3 py-12 text-center text-sm text-gray-500"
                  >
                    No hay empresas registradas. Haz clic en "Nueva Empresa"
                    para comenzar.
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
    </>
  );
};
