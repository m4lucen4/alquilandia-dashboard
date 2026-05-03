import { type FC, useEffect, useMemo, useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { PencilIcon, TrashIcon, PlusIcon } from "@heroicons/react/24/outline";
import { Modal } from "@/components/shared/Modal";
import { Alert } from "@/components/shared/Alert";
import { Table } from "@/components/shared/Table";
import Button from "@/components/shared/Button";
import { BusinessForm } from "./BusinessForm";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  fetchAllBusiness,
  createBusiness,
  updateBusiness,
  deleteBusiness,
} from "@/redux/actions/business";
import { clearBusinessErrors } from "@/redux/slices/businessSlice";
import type { Business, BusinessFormData } from "@/types/business";

type ModalMode = "create" | "edit" | "delete" | null;

export const BusinessTab: FC = () => {
  const dispatch = useAppDispatch();
  const {
    businesses,
    fetchBusinessRequest,
    createBusinessRequest,
    updateBusinessRequest,
    deleteBusinessRequest,
  } = useAppSelector((state) => state.business);

  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selected, setSelected] = useState<Business | null>(null);

  useEffect(() => {
    dispatch(fetchAllBusiness());
  }, [dispatch]);

  const handleCreate = () => {
    setSelected(null);
    setModalMode("create");
  };

  const handleEdit = (business: Business) => {
    setSelected(business);
    setModalMode("edit");
  };

  const handleDeleteClick = (business: Business) => {
    setSelected(business);
    setModalMode("delete");
  };

  const handleFormSubmit = async (formData: BusinessFormData) => {
    try {
      if (modalMode === "create") {
        await dispatch(createBusiness(formData)).unwrap();
      } else if (modalMode === "edit" && selected) {
        await dispatch(updateBusiness({ id: selected.id, updates: formData })).unwrap();
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
      dispatch(deleteBusiness(selected.id))
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
    createBusinessRequest.inProgress ||
    updateBusinessRequest.inProgress ||
    deleteBusinessRequest.inProgress;

  const errorMessage =
    (!fetchBusinessRequest.ok && fetchBusinessRequest.messages) ||
    (!createBusinessRequest.ok && createBusinessRequest.messages) ||
    (!updateBusinessRequest.ok && updateBusinessRequest.messages) ||
    (!deleteBusinessRequest.ok && deleteBusinessRequest.messages) ||
    null;

  const columns = useMemo<ColumnDef<Business>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Nombre",
        cell: (info) => (
          <span className="font-medium text-gray-900">{info.getValue() as string}</span>
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
                onClick={() => handleEdit(business)}
                variant="secondary"
                size="sm"
                icon={<PencilIcon className="h-4 w-4" />}
              />
              <Button
                title="Eliminar"
                onClick={() => handleDeleteClick(business)}
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
          onClose={() => dispatch(clearBusinessErrors())}
        />
      )}

      {(modalMode === "create" || modalMode === "edit") && (
        <Modal
          title={modalMode === "create" ? "Nueva Empresa" : "Editar Empresa"}
          onAccept={handleModalAccept}
          onClose={handleCloseModal}
          acceptText="Guardar"
          cancelText="Cancelar"
        >
          <BusinessForm
            business={selected}
            onSubmit={handleFormSubmit}
            isLoading={isSaving}
          />
        </Modal>
      )}

      {modalMode === "delete" && selected && (
        <Modal
          title="Eliminar Empresa"
          onAccept={handleModalAccept}
          onClose={handleCloseModal}
          acceptText="Eliminar"
          cancelText="Cancelar"
        >
          <p className="text-gray-600">
            ¿Estás seguro de que deseas eliminar la empresa{" "}
            <span className="font-semibold">{selected.name}</span>? Esta acción no se
            puede deshacer.
          </p>
        </Modal>
      )}

      <div className="mb-4">
        <Button
          title="Nueva Empresa"
          onClick={handleCreate}
          disabled={isSaving}
          icon={<PlusIcon className="h-5 w-5" />}
        />
      </div>

      <Table
        data={businesses}
        columns={columns}
        isLoading={fetchBusinessRequest.inProgress}
        emptyMessage='No hay registros. Haz clic en "Nueva Empresa" para comenzar.'
      />
    </>
  );
};
