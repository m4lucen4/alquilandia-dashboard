import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  getAllInvoicesTypes,
  createInvoicesType as createInvoicesTypeService,
  updateInvoicesType as updateInvoicesTypeService,
  deleteInvoicesType as deleteInvoicesTypeService,
} from "@/services/invoicesTypesService";
import type { InvoicesTypeFormData } from "@/types/invoicesTypes";

// Thunk para obtener todos los tipos de facturas
export const fetchAllInvoicesTypes = createAsyncThunk(
  "invoicesTypes/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const invoicesTypes = await getAllInvoicesTypes();
      return invoicesTypes;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error al obtener tipos de facturas";
      return rejectWithValue(errorMessage);
    }
  }
);

// Thunk para crear un tipo de factura
export const createInvoicesType = createAsyncThunk(
  "invoicesTypes/create",
  async (invoicesType: InvoicesTypeFormData, { rejectWithValue }) => {
    try {
      const newInvoicesType = await createInvoicesTypeService(invoicesType);
      return newInvoicesType;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error al crear tipo de factura";
      return rejectWithValue(errorMessage);
    }
  }
);

// Thunk para actualizar un tipo de factura
export const updateInvoicesType = createAsyncThunk(
  "invoicesTypes/update",
  async (
    { id, updates }: { id: string; updates: InvoicesTypeFormData },
    { rejectWithValue }
  ) => {
    try {
      const updatedInvoicesType = await updateInvoicesTypeService(id, updates);
      return updatedInvoicesType;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error al actualizar tipo de factura";
      return rejectWithValue(errorMessage);
    }
  }
);

// Thunk para eliminar un tipo de factura
export const deleteInvoicesType = createAsyncThunk(
  "invoicesTypes/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await deleteInvoicesTypeService(id);
      return id;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error al eliminar tipo de factura";
      return rejectWithValue(errorMessage);
    }
  }
);
