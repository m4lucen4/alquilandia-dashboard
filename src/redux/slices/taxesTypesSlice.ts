import { createSlice } from "@reduxjs/toolkit";
import {
  fetchAllTaxesTypes,
  createTaxesType,
  updateTaxesType,
  deleteTaxesType,
} from "../actions/taxesTypes";
import type { TaxesTypesState } from "@/types/taxesTypes";

const initialState: TaxesTypesState = {
  taxesTypes: [],
  fetchTaxesTypesRequest: {
    inProgress: false,
    messages: "",
    ok: false,
  },
  createTaxesTypeRequest: {
    inProgress: false,
    messages: "",
    ok: false,
  },
  updateTaxesTypeRequest: {
    inProgress: false,
    messages: "",
    ok: false,
  },
  deleteTaxesTypeRequest: {
    inProgress: false,
    messages: "",
    ok: false,
  },
};

const taxesTypesSlice = createSlice({
  name: "taxesTypes",
  initialState,
  reducers: {
    clearTaxesTypesErrors: (state) => {
      state.fetchTaxesTypesRequest = initialState.fetchTaxesTypesRequest;
      state.createTaxesTypeRequest = initialState.createTaxesTypeRequest;
      state.updateTaxesTypeRequest = initialState.updateTaxesTypeRequest;
      state.deleteTaxesTypeRequest = initialState.deleteTaxesTypeRequest;
    },
    clearCreateTaxesTypeSuccess: (state) => {
      state.createTaxesTypeRequest = initialState.createTaxesTypeRequest;
    },
    clearUpdateTaxesTypeSuccess: (state) => {
      state.updateTaxesTypeRequest = initialState.updateTaxesTypeRequest;
    },
    clearDeleteTaxesTypeSuccess: (state) => {
      state.deleteTaxesTypeRequest = initialState.deleteTaxesTypeRequest;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All Taxes Types
      .addCase(fetchAllTaxesTypes.pending, (state) => {
        state.fetchTaxesTypesRequest = {
          inProgress: true,
          messages: "",
          ok: false,
        };
      })
      .addCase(fetchAllTaxesTypes.fulfilled, (state, action) => {
        state.taxesTypes = action.payload;
        state.fetchTaxesTypesRequest = {
          inProgress: false,
          messages: "",
          ok: true,
        };
      })
      .addCase(fetchAllTaxesTypes.rejected, (state, action) => {
        state.fetchTaxesTypesRequest = {
          inProgress: false,
          messages: (action.payload as string) || "Error al obtener tipos de impuestos",
          ok: false,
        };
      })
      // Create Taxes Type
      .addCase(createTaxesType.pending, (state) => {
        state.createTaxesTypeRequest = {
          inProgress: true,
          messages: "",
          ok: false,
        };
      })
      .addCase(createTaxesType.fulfilled, (state, action) => {
        state.taxesTypes.push(action.payload);
        state.createTaxesTypeRequest = {
          inProgress: false,
          messages: "Tipo de impuesto creado correctamente",
          ok: true,
        };
      })
      .addCase(createTaxesType.rejected, (state, action) => {
        state.createTaxesTypeRequest = {
          inProgress: false,
          messages: (action.payload as string) || "Error al crear tipo de impuesto",
          ok: false,
        };
      })
      // Update Taxes Type
      .addCase(updateTaxesType.pending, (state) => {
        state.updateTaxesTypeRequest = {
          inProgress: true,
          messages: "",
          ok: false,
        };
      })
      .addCase(updateTaxesType.fulfilled, (state, action) => {
        const index = state.taxesTypes.findIndex(
          (t) => t.id === action.payload.id
        );
        if (index !== -1) {
          state.taxesTypes[index] = action.payload;
        }
        state.updateTaxesTypeRequest = {
          inProgress: false,
          messages: "Tipo de impuesto actualizado correctamente",
          ok: true,
        };
      })
      .addCase(updateTaxesType.rejected, (state, action) => {
        state.updateTaxesTypeRequest = {
          inProgress: false,
          messages: (action.payload as string) || "Error al actualizar tipo de impuesto",
          ok: false,
        };
      })
      // Delete Taxes Type
      .addCase(deleteTaxesType.pending, (state) => {
        state.deleteTaxesTypeRequest = {
          inProgress: true,
          messages: "",
          ok: false,
        };
      })
      .addCase(deleteTaxesType.fulfilled, (state, action) => {
        state.taxesTypes = state.taxesTypes.filter(
          (t) => t.id !== action.payload
        );
        state.deleteTaxesTypeRequest = {
          inProgress: false,
          messages: "Tipo de impuesto eliminado correctamente",
          ok: true,
        };
      })
      .addCase(deleteTaxesType.rejected, (state, action) => {
        state.deleteTaxesTypeRequest = {
          inProgress: false,
          messages: (action.payload as string) || "Error al eliminar tipo de impuesto",
          ok: false,
        };
      });
  },
});

export const {
  clearTaxesTypesErrors,
  clearCreateTaxesTypeSuccess,
  clearUpdateTaxesTypeSuccess,
  clearDeleteTaxesTypeSuccess,
} = taxesTypesSlice.actions;

export default taxesTypesSlice.reducer;
