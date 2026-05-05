import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  createInventoryCategory as createInventoryCategoryService,
  editInventoryCategory as editInventoryCategoryService,
  getPaginatedInventoryCategories,
  deleteInventoryCategory as deleteInventoryCategoryService,
  getInventoryCategories,
  getInventoryCategoriesOptions,
  getInventoryCategoryDetails,
} from "@/services/inventoryCategoriesService";
import type {
  FetchPaginatedInventoryCategoriesParams,
  InventoryCategoryFormData,
} from "@/types/inventoryCategories";

export const createInventoryCategoryThunk = createAsyncThunk(
  "inventoryCategories/create",
  async (body: InventoryCategoryFormData, { rejectWithValue }) => {
    try {
      return await createInventoryCategoryService(body);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error al crear la categoría";
      return rejectWithValue(message);
    }
  }
);

export const editInventoryCategoryThunk = createAsyncThunk(
  "inventoryCategories/edit",
  async (
    { id, body }: { id: string; body: InventoryCategoryFormData },
    { rejectWithValue }
  ) => {
    try {
      return await editInventoryCategoryService(id, body);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error al editar la categoría";
      return rejectWithValue(message);
    }
  }
);

export const fetchPaginatedInventoryCategories = createAsyncThunk(
  "inventoryCategories/fetchPaginated",
  async (
    { pageSize, pageToFetch, filtersQuery }: FetchPaginatedInventoryCategoriesParams,
    { rejectWithValue }
  ) => {
    try {
      return await getPaginatedInventoryCategories(pageSize, pageToFetch, filtersQuery);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error al obtener las categorías";
      return rejectWithValue(message);
    }
  }
);

export const deleteInventoryCategoryThunk = createAsyncThunk(
  "inventoryCategories/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await deleteInventoryCategoryService(id);
      return id;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error al eliminar la categoría";
      return rejectWithValue(message);
    }
  }
);

export const fetchInventoryCategories = createAsyncThunk(
  "inventoryCategories/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      return await getInventoryCategories();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error al obtener las categorías";
      return rejectWithValue(message);
    }
  }
);

export const fetchInventoryCategoriesOptions = createAsyncThunk(
  "inventoryCategories/fetchOptions",
  async (_, { rejectWithValue }) => {
    try {
      return await getInventoryCategoriesOptions();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error al obtener las opciones de categorías";
      return rejectWithValue(message);
    }
  }
);

export const fetchInventoryCategoryDetails = createAsyncThunk(
  "inventoryCategories/fetchDetails",
  async (id: string, { rejectWithValue }) => {
    try {
      return await getInventoryCategoryDetails(id);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error al obtener los detalles de la categoría";
      return rejectWithValue(message);
    }
  }
);
