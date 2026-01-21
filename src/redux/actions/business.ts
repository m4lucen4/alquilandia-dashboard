import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  getAllBusiness,
  createBusiness as createBusinessService,
  updateBusiness as updateBusinessService,
  deleteBusiness as deleteBusinessService,
} from "@/services/businessService";
import type { BusinessFormData } from "@/types/business";

// Thunk para obtener todas las empresas
export const fetchAllBusiness = createAsyncThunk(
  "business/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const businesses = await getAllBusiness();
      return businesses;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error al obtener empresas";
      return rejectWithValue(errorMessage);
    }
  }
);

// Thunk para crear una empresa
export const createBusiness = createAsyncThunk(
  "business/create",
  async (business: BusinessFormData, { rejectWithValue }) => {
    try {
      const newBusiness = await createBusinessService(business);
      return newBusiness;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error al crear empresa";
      return rejectWithValue(errorMessage);
    }
  }
);

// Thunk para actualizar una empresa
export const updateBusiness = createAsyncThunk(
  "business/update",
  async (
    { id, updates }: { id: string; updates: BusinessFormData },
    { rejectWithValue }
  ) => {
    try {
      const updatedBusiness = await updateBusinessService(id, updates);
      return updatedBusiness;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error al actualizar empresa";
      return rejectWithValue(errorMessage);
    }
  }
);

// Thunk para eliminar una empresa
export const deleteBusiness = createAsyncThunk(
  "business/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await deleteBusinessService(id);
      return id;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error al eliminar empresa";
      return rejectWithValue(errorMessage);
    }
  }
);
