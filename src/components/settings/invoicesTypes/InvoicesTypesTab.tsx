import { type FC, useEffect, useMemo, useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { PencilIcon, TrashIcon, PlusIcon } from "@heroicons/react/24/outline";
import { Modal } from "@/components/shared/Modal";
import { Alert } from "@/components/shared/Alert";
import { Table } from "@/components/shared/Table";
import Button from "@/components/shared/Button";
import { InvoicesTypesForm } from "./InvoicesTypesForm";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  fetchAllInvoicesTypes,
  createInvoicesType,
  updateInvoicesType,
  deleteInvoicesType,
} from "@/redux/actions/invoicesTypes";
import { clearInvoicesTypesErrors } from "@/redux/slices/invoicesTypesSlice";
import type { InvoicesType, InvoicesTypeFormData } from "@/types/invoicesTypes";

type ModalMode = "create" | "edit" | "delete" | null;

export const InvoicesTypesTab: FC = () => {
  const dispatch = useAppDispatch();
  const {
    invoicesTypes,
    fetchInvoicesTypesRequest,
    createInvoicesTypeRequest,
    updateInvoicesTypeRequest,
    deleteInvoicesTypeRequest,
  } = useAppSelector((state) => state.invoicesTypes);

  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selected, setSelected] = useState<InvoicesType | null>(null);

  useEffect(() => {
    dispatch(fetchAllInvoicesTypes());
  }, [dispatch]);

  const handleCreate = () => {
    setSelected(null);
    setModalMode("create");
  };

  const handleEdit = (invoicesType: InvoicesType) => {
    setSelected(invoicesType);
    setModalMode("edit");
  };

  const handleDeleteClick = (invoicesType: InvoicesType) => {
    setSelected(invoicesType);
    setModalMode("delete");
  };

  const handleFormSubmit = async (formData: InvoicesTypeFormData) => {
    try {
      if (modalMode === "create") {
        await dispatch(createInvoicesType(formData)).unwrap();
      } else if (modalMode === "edit" && selected) {
        await dispatch(
          updateInvoicesType({ id: selected.id, updates: formData }),
        ).unwrap();
      }
      setModalMode(null);
      setSelected(null);
    } catch {
      // error stored in Redux state, shown via errorMessage
    }
  };

  const handleModalAccept = () => {
    if (modalMode === "delete") {
      if (!selected) return;
      dispatch(deleteInvoicesType(selected.id))
        .unwrap()
        .then(() => {
          setModalMode(null);
          setSelected(null);
        })
        .catch(() => {});
    } else {
      const form = document.querySelector("form") as HTMLFormElement;
      form?.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
    }
  };

  const handleCloseModal = () => {
    setModalMode(null);
    setSelected(null);
  };

  const isSaving =
    createInvoicesTypeRequest.inProgress ||
    updateInvoicesTypeRequest.inProgress ||
    deleteInvoicesTypeRequest.inProgress;

  const errorMessage =
    (!fetchInvoicesTypesRequest.ok && fetchInvoicesTypesRequest.messages) ||
    (!createInvoicesTypeRequest.ok && createInvoicesTypeRequest.messages) ||
    (!updateInvoicesTypeRequest.ok && updateInvoicesTypeRequest.messages) ||
    (!deleteInvoicesTypeRequest.ok && deleteInvoicesTypeRequest.messages) ||
    null;

  const columns = useMemo<ColumnDef<InvoicesType>[]>(
    () => [
      {
        accessorKey: "invoices",
        header: "Nombre",
        cell: (info) => (
          <span className="font-medium text-gray-900">{info.getValue() as string}</span>
        ),
      },
      {
        accessorKey: "percentage",
        header: "Porcentaje (%)",
        cell: (info) => (
          <span className="text-gray-600">{(info.getValue() as number).toFixed(2)}%</span>
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
                onClick={() => handleEdit(invoicesType)}
                variant="secondary"
                size="sm"
                icon={<PencilIcon className="h-4 w-4" />}
              />
              <Button
                title="Eliminar"
                onClick={() => handleDeleteClick(invoicesType)}
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

  return (
    <>
      {errorMessage && (
        <Alert
          title="Error"
          description={errorMessage}
          onClose={() => dispatch(clearInvoicesTypesErrors())}
        />
      )}

      {(modalMode === "create" || modalMode === "edit") && (
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
            invoicesType={selected}
            onSubmit={handleFormSubmit}
            isLoading={isSaving}
          />
        </Modal>
      )}

      {modalMode === "delete" && selected && (
        <Modal
          title="Eliminar Tipo de Factura"
          onAccept={handleModalAccept}
          onClose={handleCloseModal}
          acceptText="Eliminar"
          cancelText="Cancelar"
        >
          <p className="text-gray-600">
            ¿Estás seguro de que deseas eliminar el tipo de factura{" "}
            <span className="font-semibold">{selected.invoices}</span>? Esta acción no
            se puede deshacer.
          </p>
        </Modal>
      )}

      <div className="mb-4">
        <Button
          title="Nuevo Tipo de Factura"
          onClick={handleCreate}
          disabled={isSaving}
          icon={<PlusIcon className="h-5 w-5" />}
        />
      </div>

      <Table
        data={invoicesTypes}
        columns={columns}
        isLoading={fetchInvoicesTypesRequest.inProgress}
        emptyMessage='No hay registros. Haz clic en "Nuevo Tipo de Factura" para comenzar.'
      />
    </>
  );
};
