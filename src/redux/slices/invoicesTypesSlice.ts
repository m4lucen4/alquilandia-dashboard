import { createSlice } from "@reduxjs/toolkit";
import {
  fetchAllInvoicesTypes,
  createInvoicesType,
  updateInvoicesType,
  deleteInvoicesType,
} from "../actions/invoicesTypes";
import type { InvoicesTypesState } from "@/types/invoicesTypes";

const initialState: InvoicesTypesState = {
  invoicesTypes: [],
  fetchInvoicesTypesRequest: {
    inProgress: false,
    messages: "",
    ok: false,
  },
  createInvoicesTypeRequest: {
    inProgress: false,
    messages: "",
    ok: false,
  },
  updateInvoicesTypeRequest: {
    inProgress: false,
    messages: "",
    ok: false,
  },
  deleteInvoicesTypeRequest: {
    inProgress: false,
    messages: "",
    ok: false,
  },
};

const invoicesTypesSlice = createSlice({
  name: "invoicesTypes",
  initialState,
  reducers: {
    clearInvoicesTypesErrors: (state) => {
      state.fetchInvoicesTypesRequest = initialState.fetchInvoicesTypesRequest;
      state.createInvoicesTypeRequest = initialState.createInvoicesTypeRequest;
      state.updateInvoicesTypeRequest = initialState.updateInvoicesTypeRequest;
      state.deleteInvoicesTypeRequest = initialState.deleteInvoicesTypeRequest;
    },
    clearCreateInvoicesTypeSuccess: (state) => {
      state.createInvoicesTypeRequest = initialState.createInvoicesTypeRequest;
    },
    clearUpdateInvoicesTypeSuccess: (state) => {
      state.updateInvoicesTypeRequest = initialState.updateInvoicesTypeRequest;
    },
    clearDeleteInvoicesTypeSuccess: (state) => {
      state.deleteInvoicesTypeRequest = initialState.deleteInvoicesTypeRequest;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All Invoices Types
      .addCase(fetchAllInvoicesTypes.pending, (state) => {
        state.fetchInvoicesTypesRequest = {
          inProgress: true,
          messages: "",
          ok: false,
        };
      })
      .addCase(fetchAllInvoicesTypes.fulfilled, (state, action) => {
        state.invoicesTypes = action.payload;
        state.fetchInvoicesTypesRequest = {
          inProgress: false,
          messages: "",
          ok: true,
        };
      })
      .addCase(fetchAllInvoicesTypes.rejected, (state, action) => {
        state.fetchInvoicesTypesRequest = {
          inProgress: false,
          messages: (action.payload as string) || "Error al obtener tipos de facturas",
          ok: false,
        };
      })
      // Create Invoices Type
      .addCase(createInvoicesType.pending, (state) => {
        state.createInvoicesTypeRequest = {
          inProgress: true,
          messages: "",
          ok: false,
        };
      })
      .addCase(createInvoicesType.fulfilled, (state, action) => {
        state.invoicesTypes.push(action.payload);
        state.createInvoicesTypeRequest = {
          inProgress: false,
          messages: "Tipo de factura creado correctamente",
          ok: true,
        };
      })
      .addCase(createInvoicesType.rejected, (state, action) => {
        state.createInvoicesTypeRequest = {
          inProgress: false,
          messages: (action.payload as string) || "Error al crear tipo de factura",
          ok: false,
        };
      })
      // Update Invoices Type
      .addCase(updateInvoicesType.pending, (state) => {
        state.updateInvoicesTypeRequest = {
          inProgress: true,
          messages: "",
          ok: false,
        };
      })
      .addCase(updateInvoicesType.fulfilled, (state, action) => {
        const index = state.invoicesTypes.findIndex(
          (t) => t.id === action.payload.id
        );
        if (index !== -1) {
          state.invoicesTypes[index] = action.payload;
        }
        state.updateInvoicesTypeRequest = {
          inProgress: false,
          messages: "Tipo de factura actualizado correctamente",
          ok: true,
        };
      })
      .addCase(updateInvoicesType.rejected, (state, action) => {
        state.updateInvoicesTypeRequest = {
          inProgress: false,
          messages: (action.payload as string) || "Error al actualizar tipo de factura",
          ok: false,
        };
      })
      // Delete Invoices Type
      .addCase(deleteInvoicesType.pending, (state) => {
        state.deleteInvoicesTypeRequest = {
          inProgress: true,
          messages: "",
          ok: false,
        };
      })
      .addCase(deleteInvoicesType.fulfilled, (state, action) => {
        state.invoicesTypes = state.invoicesTypes.filter(
          (t) => t.id !== action.payload
        );
        state.deleteInvoicesTypeRequest = {
          inProgress: false,
          messages: "Tipo de factura eliminado correctamente",
          ok: true,
        };
      })
      .addCase(deleteInvoicesType.rejected, (state, action) => {
        state.deleteInvoicesTypeRequest = {
          inProgress: false,
          messages: (action.payload as string) || "Error al eliminar tipo de factura",
          ok: false,
        };
      });
  },
});

export const {
  clearInvoicesTypesErrors,
  clearCreateInvoicesTypeSuccess,
  clearUpdateInvoicesTypeSuccess,
  clearDeleteInvoicesTypeSuccess,
} = invoicesTypesSlice.actions;

export default invoicesTypesSlice.reducer;
