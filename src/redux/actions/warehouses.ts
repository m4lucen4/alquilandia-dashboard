import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  getAllWarehouses,
  createWarehouse as createWarehouseService,
  updateWarehouse as updateWarehouseService,
  deleteWarehouse as deleteWarehouseService,
} from "@/services/warehousesService";
import type { WarehouseFormData } from "@/types/warehouses";

export const fetchAllWarehouses = createAsyncThunk(
  "warehouses/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      return await getAllWarehouses();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error al obtener los almacenes";
      return rejectWithValue(message);
    }
  },
);

export const createWarehouseThunk = createAsyncThunk(
  "warehouses/create",
  async (warehouse: WarehouseFormData, { rejectWithValue }) => {
    try {
      return await createWarehouseService(warehouse);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error al crear el almacén";
      return rejectWithValue(message);
    }
  },
);

export const updateWarehouseThunk = createAsyncThunk(
  "warehouses/update",
  async (
    { id, updates }: { id: string; updates: WarehouseFormData },
    { rejectWithValue },
  ) => {
    try {
      return await updateWarehouseService(id, updates);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error al actualizar el almacén";
      return rejectWithValue(message);
    }
  },
);

export const deleteWarehouseThunk = createAsyncThunk(
  "warehouses/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await deleteWarehouseService(id);
      return id;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error al eliminar el almacén";
      return rejectWithValue(message);
    }
  },
);
