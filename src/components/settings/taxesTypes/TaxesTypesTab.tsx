import { type FC, useEffect, useMemo, useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { PencilIcon, TrashIcon, PlusIcon } from "@heroicons/react/24/outline";
import { Modal } from "@/components/shared/Modal";
import { Alert } from "@/components/shared/Alert";
import { Table } from "@/components/shared/Table";
import Button from "@/components/shared/Button";
import { TaxesTypesForm } from "./TaxesTypesForm";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  fetchAllTaxesTypes,
  createTaxesType,
  updateTaxesType,
  deleteTaxesType,
} from "@/redux/actions/taxesTypes";
import { clearTaxesTypesErrors } from "@/redux/slices/taxesTypesSlice";
import type { TaxesType, TaxesTypeFormData } from "@/types/taxesTypes";

type ModalMode = "create" | "edit" | "delete" | null;

export const TaxesTypesTab: FC = () => {
  const dispatch = useAppDispatch();
  const {
    taxesTypes,
    fetchTaxesTypesRequest,
    createTaxesTypeRequest,
    updateTaxesTypeRequest,
    deleteTaxesTypeRequest,
  } = useAppSelector((state) => state.taxesTypes);

  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selected, setSelected] = useState<TaxesType | null>(null);

  useEffect(() => {
    dispatch(fetchAllTaxesTypes());
  }, [dispatch]);

  const handleCreate = () => {
    setSelected(null);
    setModalMode("create");
  };

  const handleEdit = (taxesType: TaxesType) => {
    setSelected(taxesType);
    setModalMode("edit");
  };

  const handleDeleteClick = (taxesType: TaxesType) => {
    setSelected(taxesType);
    setModalMode("delete");
  };

  const handleFormSubmit = async (formData: TaxesTypeFormData) => {
    try {
      if (modalMode === "create") {
        await dispatch(createTaxesType(formData)).unwrap();
      } else if (modalMode === "edit" && selected) {
        await dispatch(updateTaxesType({ id: selected.id, updates: formData })).unwrap();
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
      dispatch(deleteTaxesType(selected.id))
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
    createTaxesTypeRequest.inProgress ||
    updateTaxesTypeRequest.inProgress ||
    deleteTaxesTypeRequest.inProgress;

  const errorMessage =
    (!fetchTaxesTypesRequest.ok && fetchTaxesTypesRequest.messages) ||
    (!createTaxesTypeRequest.ok && createTaxesTypeRequest.messages) ||
    (!updateTaxesTypeRequest.ok && updateTaxesTypeRequest.messages) ||
    (!deleteTaxesTypeRequest.ok && deleteTaxesTypeRequest.messages) ||
    null;

  const columns = useMemo<ColumnDef<TaxesType>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Nombre",
        cell: (info) => (
          <span className="font-medium text-gray-900">{info.getValue() as string}</span>
        ),
      },
      {
        accessorKey: "tax",
        header: "Impuesto (%)",
        cell: (info) => (
          <span className="text-gray-600">{(info.getValue() as number).toFixed(2)}%</span>
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
                onClick={() => handleEdit(taxesType)}
                variant="secondary"
                size="sm"
                icon={<PencilIcon className="h-4 w-4" />}
              />
              <Button
                title="Eliminar"
                onClick={() => handleDeleteClick(taxesType)}
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
          onClose={() => dispatch(clearTaxesTypesErrors())}
        />
      )}

      {(modalMode === "create" || modalMode === "edit") && (
        <Modal
          title={
            modalMode === "create" ? "Nuevo Tipo de Impuesto" : "Editar Tipo de Impuesto"
          }
          onAccept={handleModalAccept}
          onClose={handleCloseModal}
          acceptText="Guardar"
          cancelText="Cancelar"
        >
          <TaxesTypesForm
            taxesType={selected}
            onSubmit={handleFormSubmit}
            isLoading={isSaving}
          />
        </Modal>
      )}

      {modalMode === "delete" && selected && (
        <Modal
          title="Eliminar Tipo de Impuesto"
          onAccept={handleModalAccept}
          onClose={handleCloseModal}
          acceptText="Eliminar"
          cancelText="Cancelar"
        >
          <p className="text-gray-600">
            ¿Estás seguro de que deseas eliminar el tipo de impuesto{" "}
            <span className="font-semibold">{selected.name}</span>? Esta acción no se
            puede deshacer.
          </p>
        </Modal>
      )}

      <div className="mb-4">
        <Button
          title="Nuevo Tipo de Impuesto"
          onClick={handleCreate}
          disabled={isSaving}
          icon={<PlusIcon className="h-5 w-5" />}
        />
      </div>

      <Table
        data={taxesTypes}
        columns={columns}
        isLoading={fetchTaxesTypesRequest.inProgress}
        emptyMessage='No hay registros. Haz clic en "Nuevo Tipo de Impuesto" para comenzar.'
      />
    </>
  );
};
