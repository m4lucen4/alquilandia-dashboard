import { type FC, useEffect, useMemo, useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { PencilIcon, TrashIcon, PlusIcon } from "@heroicons/react/24/outline";
import { Modal } from "@/components/shared/Modal";
import { Alert } from "@/components/shared/Alert";
import { Table } from "@/components/shared/Table";
import Button from "@/components/shared/Button";
import {
  InventoryCategoryForm,
  type InventoryCategoryFormValues,
} from "./InventoryCategoryForm";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  fetchInventoryCategories,
  createInventoryCategoryThunk,
  editInventoryCategoryThunk,
  deleteInventoryCategoryThunk,
} from "@/redux/actions/inventoryCategories";
import {
  clearInventoryCategoriesTable,
} from "@/redux/slices/inventoryCategoriesSlice";
import type { InventoryCategory } from "@/types/inventoryCategories";

type ModalMode = "create" | "edit" | "delete" | null;

export const InventoryCategoriesTab: FC = () => {
  const dispatch = useAppDispatch();
  const {
    inventoryCategoriesList,
    fetchInventoryCategoriesRequest,
    createInventoryCategoryRequest,
    editInventoryCategoryRequest,
    deleteInventoryCategoryRequest,
  } = useAppSelector((state) => state.inventoryCategories);

  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selected, setSelected] = useState<InventoryCategory | null>(null);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    dispatch(fetchInventoryCategories());
  }, [dispatch]);

  const handleCreate = () => {
    setSelected(null);
    setModalMode("create");
  };

  const handleEdit = (category: InventoryCategory) => {
    setSelected(category);
    setModalMode("edit");
  };

  const handleDeleteClick = (category: InventoryCategory) => {
    setSelected(category);
    setModalMode("delete");
  };

  const handleFormSubmit = async (formData: InventoryCategoryFormValues) => {
    try {
      if (modalMode === "create") {
        await dispatch(createInventoryCategoryThunk(formData)).unwrap();
      } else if (modalMode === "edit" && selected) {
        await dispatch(
          editInventoryCategoryThunk({ id: selected.id, body: formData }),
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
      dispatch(deleteInventoryCategoryThunk(selected.id))
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
    createInventoryCategoryRequest.inProgress ||
    editInventoryCategoryRequest.inProgress ||
    deleteInventoryCategoryRequest.inProgress;

  const errorMessage =
    (!fetchInventoryCategoriesRequest.ok && fetchInventoryCategoriesRequest.messages) ||
    (!createInventoryCategoryRequest.ok && createInventoryCategoryRequest.messages) ||
    (!editInventoryCategoryRequest.ok && editInventoryCategoryRequest.messages) ||
    (!deleteInventoryCategoryRequest.ok && deleteInventoryCategoryRequest.messages) ||
    null;

  const filteredCategories = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return inventoryCategoriesList;
    return inventoryCategoriesList.filter(
      (c) =>
        c.principal.toLowerCase().includes(q) ||
        c.nombre.toLowerCase().includes(q),
    );
  }, [inventoryCategoriesList, filter]);

  const columns = useMemo<ColumnDef<InventoryCategory>[]>(
    () => [
      {
        accessorKey: "principal",
        header: "Principal",
        cell: (info) => (
          <span className="font-medium text-gray-900">{info.getValue() as string}</span>
        ),
      },
      {
        accessorKey: "nombre",
        header: "Nombre",
        cell: (info) => (
          <span className="text-gray-600">{info.getValue() as string}</span>
        ),
      },
      {
        id: "actions",
        header: "Acciones",
        cell: (info) => {
          const category = info.row.original;
          return (
            <div className="flex items-center gap-2">
              <Button
                title="Editar"
                onClick={() => handleEdit(category)}
                variant="secondary"
                size="sm"
                icon={<PencilIcon className="h-4 w-4" />}
              />
              <Button
                title="Eliminar"
                onClick={() => handleDeleteClick(category)}
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
          onClose={() => dispatch(clearInventoryCategoriesTable())}
        />
      )}

      {(modalMode === "create" || modalMode === "edit") && (
        <Modal
          title={
            modalMode === "create" ? "Nueva Categoría" : "Editar Categoría"
          }
          onAccept={handleModalAccept}
          onClose={handleCloseModal}
          acceptText="Guardar"
          cancelText="Cancelar"
        >
          <InventoryCategoryForm
            category={selected}
            onSubmit={handleFormSubmit}
            isLoading={isSaving}
          />
        </Modal>
      )}

      {modalMode === "delete" && selected && (
        <Modal
          title="Eliminar Categoría"
          onAccept={handleModalAccept}
          onClose={handleCloseModal}
          acceptText="Eliminar"
          cancelText="Cancelar"
        >
          <p className="text-gray-600">
            ¿Estás seguro de que deseas eliminar la categoría{" "}
            <span className="font-semibold">{selected.nombre}</span>? Esta acción no se
            puede deshacer.
          </p>
        </Modal>
      )}

      <div className="mb-4 flex items-center gap-3">
        <Button
          title="Nueva Categoría"
          onClick={handleCreate}
          disabled={isSaving}
          icon={<PlusIcon className="h-5 w-5" />}
        />
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Buscar por principal o nombre..."
          className="w-72 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <Table
        data={filteredCategories}
        columns={columns}
        isLoading={fetchInventoryCategoriesRequest.inProgress}
        emptyMessage='No hay categorías registradas. Haz clic en "Nueva Categoría" para comenzar.'
      />
    </>
  );
};
