import { type FC, useCallback, useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import {
  fetchPaginatedInventoryThunk,
  createInventoryThunk,
  editInventoryThunk,
  deleteInventoryThunk,
} from "../redux/actions/inventory";
import { clearInventoryTable, clearDeleteInventorySuccess } from "../redux/slices/inventorySlice";
import { fetchInventoryCategories } from "../redux/actions/inventoryCategories";
import { Alert } from "../components/shared/Alert";
import { PageHeader } from "@/components/shared/PageHeader";
import { InventoryTable } from "../components/inventory/InventoryTable";
import { ModalImagesInventory } from "../components/inventory/ModalImagesInventory";
import {
  ModalCreateInventory,
  type CreateInventoryFormValues,
} from "../components/inventory/ModalCreateInventory";
import {
  ModalEditInventory,
  type EditInventoryFormValues,
} from "../components/inventory/ModalEditInventory";
import { Modal } from "../components/shared/Modal";
import Button from "@/components/shared/Button";
import { InventoryFilters } from "../components/inventory/InventoryFilters";
import { PlusIcon } from "@heroicons/react/24/outline";
import type { Inventory } from "../types/inventory";
import { useInventorySearch } from "../hooks/useInventorySearch";

export const InventoryPage: FC = () => {
  const dispatch = useAppDispatch();
  const inventoryState = useAppSelector((state) => state.inventory);
  const inventoryItems = inventoryState?.inventoryItems ?? [];
  const inventoryTotal = inventoryState?.inventoryTotal ?? 0;
  const fetchPaginatedInventoryRequest =
    inventoryState?.fetchPaginatedInventoryRequest ?? {
      inProgress: false,
      messages: "",
      ok: false,
    };
  const createInventoryRequest =
    inventoryState?.createInventoryRequest ?? {
      inProgress: false,
      messages: "",
      ok: false,
    };
  const editInventoryRequest =
    inventoryState?.editInventoryRequest ?? {
      inProgress: false,
      messages: "",
      ok: false,
    };
  const deleteInventoryRequest =
    inventoryState?.deleteInventoryRequest ?? {
      inProgress: false,
      messages: "",
      ok: false,
    };
  const rawCategoriesList = useAppSelector(
    (state) => state.inventoryCategories.inventoryCategoriesList,
  );
  const inventoryCategoriesOptions = Array.isArray(rawCategoriesList)
    ? rawCategoriesList
    : [];

  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const {
    filterVisibility,
    setFilterVisibility,
    filterPrincipal,
    setFilterPrincipal,
    filterCategoriaId,
    setFilterCategoriaId,
    filterElemento,
    setFilterElemento,
    appliedFilters,
    handleSearch,
    handleClearFilters,
    buildFiltersQuery,
  } = useInventorySearch();

  const principalOptions = useMemo(() => {
    const seen = new Set<string>();
    return inventoryCategoriesOptions
      .filter((c) => {
        if (!c.principal || seen.has(c.principal)) return false;
        seen.add(c.principal);
        return true;
      })
      .map((c) => c.principal)
      .sort();
  }, [inventoryCategoriesOptions]);

  const subcategoriaOptions = useMemo(() => {
    if (!filterPrincipal) return [];
    return inventoryCategoriesOptions
      .filter((c) => c.principal === filterPrincipal)
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [inventoryCategoriesOptions, filterPrincipal]);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isImagesModalOpen, setIsImagesModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const [selectedItem, setSelectedItem] = useState<Inventory | null>(null);
  const [itemToDelete, setItemToDelete] = useState<Inventory | null>(null);

  useEffect(() => {
    dispatch(fetchInventoryCategories());
  }, [dispatch]);

  useEffect(() => {
    const filtersQuery = buildFiltersQuery();
    dispatch(
      fetchPaginatedInventoryThunk({
        pageSize,
        pageToFetch: pageIndex + 1,
        filtersQuery,
      }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, pageIndex, pageSize, appliedFilters]);

  useEffect(() => {
    return () => {
      dispatch(clearInventoryTable());
    };
  }, [dispatch]);

  const handleCreateInventory = useCallback(
    async (formData: CreateInventoryFormValues) => {
      try {
        await dispatch(
          createInventoryThunk({
            elemento: formData.elemento,
            categoria: formData.categoria,
            unidades: formData.unidades,
            precioUd: formData.precioUd,
            precioCoste: formData.precioCoste,
            costeTotal: formData.costeTotal,
            private: formData.private,
            observaciones: formData.observaciones,
            images: formData.images,
          }),
        ).unwrap();
        setIsCreateModalOpen(false);
        dispatch(
          fetchPaginatedInventoryThunk({
            pageSize,
            pageToFetch: pageIndex + 1,
            filtersQuery: buildFiltersQuery(),
          }),
        );
      } catch {
        // error visible via createInventoryRequest.messages
      }
    },
    [dispatch, pageSize, pageIndex, buildFiltersQuery],
  );

  const handleOpenEdit = useCallback((item: Inventory) => {
    setSelectedItem(item);
    setIsEditModalOpen(true);
  }, []);

  const handleEditInventory = useCallback(
    async (formData: EditInventoryFormValues) => {
      if (!selectedItem) return;
      try {
        await dispatch(
          editInventoryThunk({
            id: selectedItem.id,
            body: {
              elemento: formData.elemento,
              categoria: formData.categoria,
              unidades: formData.unidades,
              precioUd: formData.precioUd,
              precioCoste: formData.precioCoste,
              costeTotal: formData.costeTotal,
              private: formData.private,
              observaciones: formData.observaciones,
              images: formData.images,
            },
          }),
        ).unwrap();
        setIsEditModalOpen(false);
        setSelectedItem(null);
        dispatch(
          fetchPaginatedInventoryThunk({
            pageSize,
            pageToFetch: pageIndex + 1,
            filtersQuery: buildFiltersQuery(),
          }),
        );
      } catch {
        // error visible via editInventoryRequest.messages
      }
    },
    [dispatch, selectedItem, pageSize, pageIndex, buildFiltersQuery],
  );

  const handleOpenImages = useCallback((item: Inventory) => {
    setSelectedItem(item);
    setIsImagesModalOpen(true);
  }, []);

  const handleOpenDelete = useCallback((item: Inventory) => {
    setItemToDelete(item);
    setIsDeleteConfirmOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!itemToDelete) return;
    try {
      await dispatch(deleteInventoryThunk(itemToDelete.id)).unwrap();
      setIsDeleteConfirmOpen(false);
      setItemToDelete(null);
    } catch {
      // error visible via deleteInventoryRequest.messages
    }
  }, [dispatch, itemToDelete]);

  const handlePageSizeChange = useCallback((newPageSize: number) => {
    setPageSize(newPageSize);
    setPageIndex(0);
  }, []);

  const shouldShowFetchError =
    fetchPaginatedInventoryRequest.messages &&
    !fetchPaginatedInventoryRequest.inProgress &&
    !fetchPaginatedInventoryRequest.ok;

  const shouldShowCreateError =
    createInventoryRequest.messages &&
    !createInventoryRequest.inProgress &&
    !createInventoryRequest.ok;

  const shouldShowEditError =
    editInventoryRequest.messages &&
    !editInventoryRequest.inProgress &&
    !editInventoryRequest.ok;

  const shouldShowDeleteError =
    deleteInventoryRequest.messages &&
    !deleteInventoryRequest.inProgress &&
    !deleteInventoryRequest.ok;

  return (
    <>
      {shouldShowFetchError && (
        <Alert
          title="Error al cargar el inventario"
          description={fetchPaginatedInventoryRequest.messages}
          onClose={() => dispatch(clearInventoryTable())}
        />
      )}

      {shouldShowCreateError && (
        <Alert
          title="Error al crear el artículo"
          description={createInventoryRequest.messages}
          onClose={() => dispatch(clearInventoryTable())}
        />
      )}

      {shouldShowEditError && (
        <Alert
          title="Error al editar el artículo"
          description={editInventoryRequest.messages}
          onClose={() => dispatch(clearInventoryTable())}
        />
      )}

      {shouldShowDeleteError && (
        <Alert
          title="Error al eliminar el artículo"
          description={deleteInventoryRequest.messages}
          onClose={() => dispatch(clearDeleteInventorySuccess())}
        />
      )}

      {isDeleteConfirmOpen && itemToDelete && (
        <Modal
          title="Eliminar artículo"
          onAccept={handleConfirmDelete}
          onClose={() => {
            setIsDeleteConfirmOpen(false);
            setItemToDelete(null);
          }}
          acceptText="Eliminar"
          cancelText="Cancelar"
        >
          <p>
            ¿Estás seguro de que quieres eliminar{" "}
            <strong>{itemToDelete.elemento}</strong>? Esta acción no se puede
            deshacer.
          </p>
        </Modal>
      )}

      <ModalImagesInventory
        isOpen={isImagesModalOpen}
        item={selectedItem}
        onClose={() => {
          setIsImagesModalOpen(false);
          setSelectedItem(null);
        }}
      />

      <ModalCreateInventory
        isOpen={isCreateModalOpen}
        isCreating={createInventoryRequest.inProgress}
        categoryOptions={inventoryCategoriesOptions}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateInventory}
      />

      <ModalEditInventory
        key={selectedItem?.id}
        isOpen={isEditModalOpen}
        isEditing={editInventoryRequest.inProgress}
        item={selectedItem}
        categoryOptions={inventoryCategoriesOptions}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedItem(null);
        }}
        onSubmit={handleEditInventory}
      />

      <div className="px-4 py-8 sm:px-6 lg:px-8">
        <PageHeader
          title="Inventario"
          description="Listado de artículos disponibles"
        />

        <div className="mt-6 mb-4 flex items-center justify-between gap-3">
          <Button
            title="Nuevo artículo"
            onClick={() => setIsCreateModalOpen(true)}
            variant="secondary"
            icon={<PlusIcon className="h-4 w-4" />}
            disabled
          />
        </div>

        <div className="mb-4">
          <InventoryFilters
            filterVisibility={filterVisibility}
            filterPrincipal={filterPrincipal}
            filterCategoriaId={filterCategoriaId}
            filterElemento={filterElemento}
            principalOptions={principalOptions}
            subcategoriaOptions={subcategoriaOptions}
            appliedFilters={appliedFilters}
            isLoading={fetchPaginatedInventoryRequest.inProgress}
            onVisibilityChange={setFilterVisibility}
            onPrincipalChange={setFilterPrincipal}
            onCategoriaIdChange={setFilterCategoriaId}
            onElementoChange={setFilterElemento}
            onSearch={() => {
              handleSearch();
              setPageIndex(0);
            }}
            onClearFilters={() => {
              handleClearFilters();
              setPageIndex(0);
            }}
          />
        </div>

        <InventoryTable
          items={inventoryItems}
          total={inventoryTotal}
          pageIndex={pageIndex}
          pageSize={pageSize}
          isLoading={fetchPaginatedInventoryRequest.inProgress}
          onPageChange={setPageIndex}
          onPageSizeChange={handlePageSizeChange}
          onViewImages={handleOpenImages}
          onEdit={handleOpenEdit}
          onDelete={handleOpenDelete}
        />
      </div>
    </>
  );
};
