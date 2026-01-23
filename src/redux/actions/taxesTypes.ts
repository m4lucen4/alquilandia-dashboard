import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  getAllTaxesTypes,
  createTaxesType as createTaxesTypeService,
  updateTaxesType as updateTaxesTypeService,
  deleteTaxesType as deleteTaxesTypeService,
} from "@/services/taxesTypesService";
import type { TaxesTypeFormData } from "@/types/taxesTypes";

// Thunk para obtener todos los tipos de impuestos
export const fetchAllTaxesTypes = createAsyncThunk(
  "taxesTypes/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const taxesTypes = await getAllTaxesTypes();
      return taxesTypes;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error al obtener tipos de impuestos";
      return rejectWithValue(errorMessage);
    }
  }
);

// Thunk para crear un tipo de impuesto
export const createTaxesType = createAsyncThunk(
  "taxesTypes/create",
  async (taxesType: TaxesTypeFormData, { rejectWithValue }) => {
    try {
      const newTaxesType = await createTaxesTypeService(taxesType);
      return newTaxesType;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error al crear tipo de impuesto";
      return rejectWithValue(errorMessage);
    }
  }
);

// Thunk para actualizar un tipo de impuesto
export const updateTaxesType = createAsyncThunk(
  "taxesTypes/update",
  async (
    { id, updates }: { id: string; updates: TaxesTypeFormData },
    { rejectWithValue }
  ) => {
    try {
      const updatedTaxesType = await updateTaxesTypeService(id, updates);
      return updatedTaxesType;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error al actualizar tipo de impuesto";
      return rejectWithValue(errorMessage);
    }
  }
);

// Thunk para eliminar un tipo de impuesto
export const deleteTaxesType = createAsyncThunk(
  "taxesTypes/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await deleteTaxesTypeService(id);
      return id;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error al eliminar tipo de impuesto";
      return rejectWithValue(errorMessage);
    }
  }
);
