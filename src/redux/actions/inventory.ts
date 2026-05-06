import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  createInventory as createInventoryService,
  editInventory as editInventoryService,
  getPaginatedInventory,
  getInventoryDetails,
  deleteInventory as deleteInventoryService,
  exportInventoryToCSV,
  getProductBlocks,
  editWarehouseUnits,
  editWarehouseWarningLimitUnits,
  transferWarehouseAndInventory as transferWarehouseAndInventoryService,
} from "@/services/inventoryService";
import type {
  InventoryFormData,
  FetchPaginatedInventoryParams,
  FetchProductBlocksParams,
} from "@/types/inventory";

export const createInventoryThunk = createAsyncThunk(
  "inventory/create",
  async (body: InventoryFormData, { rejectWithValue }) => {
    try {
      return await createInventoryService(body);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error al crear el inventario";
      return rejectWithValue(message);
    }
  }
);

export const editInventoryThunk = createAsyncThunk(
  "inventory/edit",
  async (
    { id, body }: { id: string; body: InventoryFormData },
    { rejectWithValue }
  ) => {
    try {
      return await editInventoryService(id, body);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error al editar el inventario";
      return rejectWithValue(message);
    }
  }
);

export const fetchPaginatedInventoryThunk = createAsyncThunk(
  "inventory/fetchPaginated",
  async (
    { pageSize, pageToFetch, filtersQuery }: FetchPaginatedInventoryParams,
    { rejectWithValue }
  ) => {
    try {
      return await getPaginatedInventory(pageSize, pageToFetch, filtersQuery);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error al obtener el inventario";
      return rejectWithValue(message);
    }
  }
);

export const fetchInventoryDetailsThunk = createAsyncThunk(
  "inventory/fetchDetails",
  async (id: string, { rejectWithValue }) => {
    try {
      return await getInventoryDetails(id);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Error al obtener los detalles del inventario";
      return rejectWithValue(message);
    }
  }
);

export const deleteInventoryThunk = createAsyncThunk(
  "inventory/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await deleteInventoryService(id);
      return id;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error al eliminar el inventario";
      return rejectWithValue(message);
    }
  }
);

export const exportInventoryToCSVThunk = createAsyncThunk(
  "inventory/exportCSV",
  async (filtersQuery: string, { rejectWithValue }) => {
    try {
      return await exportInventoryToCSV(filtersQuery);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error al exportar el inventario";
      return rejectWithValue(message);
    }
  }
);

export const fetchProductBlocksThunk = createAsyncThunk(
  "inventory/fetchProductBlocks",
  async ({ id, queryParams }: FetchProductBlocksParams, { rejectWithValue }) => {
    try {
      return await getProductBlocks(id, queryParams);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Error al obtener los bloques de producto";
      return rejectWithValue(message);
    }
  }
);

export const editWarehouseUnitsThunk = createAsyncThunk(
  "inventory/editWarehouseUnits",
  async ({ id, units }: { id: string; units: number }, { rejectWithValue }) => {
    try {
      await editWarehouseUnits(id, units);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Error al editar las unidades de almacén";
      return rejectWithValue(message);
    }
  }
);

export const editWarehouseWarningLimitThunk = createAsyncThunk(
  "inventory/editWarehouseWarningLimit",
  async ({ id, units }: { id: string; units: number }, { rejectWithValue }) => {
    try {
      await editWarehouseWarningLimitUnits(id, units);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Error al editar el límite de alerta del almacén";
      return rejectWithValue(message);
    }
  }
);

export const transferWarehouseAndInventoryThunk = createAsyncThunk(
  "inventory/transferWarehouseAndInventory",
  async (
    {
      id,
      unitsToTransfer,
      fromWarehouseToInventory = false,
    }: { id: string; unitsToTransfer: number; fromWarehouseToInventory?: boolean },
    { rejectWithValue }
  ) => {
    try {
      await transferWarehouseAndInventoryService(id, unitsToTransfer, fromWarehouseToInventory);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error al transferir unidades";
      return rejectWithValue(message);
    }
  }
);
