import { type FC, useEffect, useMemo, useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { PencilIcon, TrashIcon, PlusIcon } from "@heroicons/react/24/outline";
import { Modal } from "@/components/shared/Modal";
import { Alert } from "@/components/shared/Alert";
import { Table } from "@/components/shared/Table";
import Button from "@/components/shared/Button";
import { WarehouseForm, type WarehouseFormValues } from "./WarehouseForm";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  fetchAllWarehouses,
  createWarehouseThunk,
  updateWarehouseThunk,
  deleteWarehouseThunk,
} from "@/redux/actions/warehouses";
import { clearWarehousesErrors } from "@/redux/slices/warehousesSlice";
import type { Warehouse } from "@/types/warehouses";

type ModalMode = "create" | "edit" | "delete" | null;

export const LogisticsTab: FC = () => {
  const dispatch = useAppDispatch();
  const {
    warehouses,
    fetchWarehousesRequest,
    createWarehouseRequest,
    updateWarehouseRequest,
    deleteWarehouseRequest,
  } = useAppSelector((state) => state.warehouses);

  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selected, setSelected] = useState<Warehouse | null>(null);

  useEffect(() => {
    dispatch(fetchAllWarehouses());
  }, [dispatch]);

  const handleCreate = () => {
    setSelected(null);
    setModalMode("create");
  };

  const handleEdit = (warehouse: Warehouse) => {
    setSelected(warehouse);
    setModalMode("edit");
  };

  const handleDeleteClick = (warehouse: Warehouse) => {
    setSelected(warehouse);
    setModalMode("delete");
  };

  const handleFormSubmit = async (formData: WarehouseFormValues) => {
    try {
      if (modalMode === "create") {
        await dispatch(createWarehouseThunk(formData)).unwrap();
      } else if (modalMode === "edit" && selected) {
        await dispatch(
          updateWarehouseThunk({ id: selected.id, updates: formData }),
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
      dispatch(deleteWarehouseThunk(selected.id))
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
    createWarehouseRequest.inProgress ||
    updateWarehouseRequest.inProgress ||
    deleteWarehouseRequest.inProgress;

  const errorMessage =
    (!fetchWarehousesRequest.ok && fetchWarehousesRequest.messages) ||
    (!createWarehouseRequest.ok && createWarehouseRequest.messages) ||
    (!updateWarehouseRequest.ok && updateWarehouseRequest.messages) ||
    (!deleteWarehouseRequest.ok && deleteWarehouseRequest.messages) ||
    null;

  const columns = useMemo<ColumnDef<Warehouse>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Nombre",
        cell: (info) => (
          <span className="font-medium text-gray-900">{info.getValue() as string}</span>
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
          const warehouse = info.row.original;
          return (
            <div className="flex items-center gap-2">
              <Button
                title="Editar"
                onClick={() => handleEdit(warehouse)}
                variant="secondary"
                size="sm"
                icon={<PencilIcon className="h-4 w-4" />}
              />
              <Button
                title="Eliminar"
                onClick={() => handleDeleteClick(warehouse)}
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
          onClose={() => dispatch(clearWarehousesErrors())}
        />
      )}

      {(modalMode === "create" || modalMode === "edit") && (
        <Modal
          title={modalMode === "create" ? "Nuevo Almacén" : "Editar Almacén"}
          onAccept={handleModalAccept}
          onClose={handleCloseModal}
          acceptText="Guardar"
          cancelText="Cancelar"
        >
          <WarehouseForm
            warehouse={selected}
            onSubmit={handleFormSubmit}
            isLoading={isSaving}
          />
        </Modal>
      )}

      {modalMode === "delete" && selected && (
        <Modal
          title="Eliminar Almacén"
          onAccept={handleModalAccept}
          onClose={handleCloseModal}
          acceptText="Eliminar"
          cancelText="Cancelar"
        >
          <p className="text-gray-600">
            ¿Estás seguro de que deseas eliminar el almacén{" "}
            <span className="font-semibold">{selected.name}</span>? Esta acción no se
            puede deshacer.
          </p>
        </Modal>
      )}

      <div className="mb-4">
        <Button
          title="Nuevo Almacén"
          onClick={handleCreate}
          disabled={isSaving}
          icon={<PlusIcon className="h-5 w-5" />}
        />
      </div>

      <Table
        data={warehouses}
        columns={columns}
        isLoading={fetchWarehousesRequest.inProgress}
        emptyMessage='No hay almacenes registrados. Haz clic en "Nuevo Almacén" para comenzar.'
      />
    </>
  );
};
