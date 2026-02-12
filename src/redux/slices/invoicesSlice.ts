import { createSlice } from "@reduxjs/toolkit";
import type { InvoicesState } from "@/types/invoices";
import {
  fetchAllInvoices,
  createInvoice,
  createCorrectiveInvoice,
  updateInvoice,
} from "../actions/invoices";

const initialState: InvoicesState = {
  invoices: [],
  total: 0,
  fetchInvoicesRequest: {
    inProgress: false,
    ok: false,
    messages: "",
  },
  createInvoiceRequest: {
    inProgress: false,
    ok: false,
    messages: "",
  },
  createCorrectiveInvoiceRequest: {
    inProgress: false,
    ok: false,
    messages: "",
  },
  updateInvoiceRequest: {
    inProgress: false,
    ok: false,
    messages: "",
  },
};

const invoicesSlice = createSlice({
  name: "invoices",
  initialState,
  reducers: {
    clearInvoicesErrors: (state) => {
      state.fetchInvoicesRequest.messages = "";
      state.fetchInvoicesRequest.ok = false;
      state.createInvoiceRequest.messages = "";
      state.createInvoiceRequest.ok = false;
      state.createCorrectiveInvoiceRequest.messages = "";
      state.createCorrectiveInvoiceRequest.ok = false;
      state.updateInvoiceRequest.messages = "";
      state.updateInvoiceRequest.ok = false;
    },
    resetCreateInvoiceRequest: (state) => {
      state.createInvoiceRequest = {
        inProgress: false,
        ok: false,
        messages: "",
      };
    },
    resetCreateCorrectiveInvoiceRequest: (state) => {
      state.createCorrectiveInvoiceRequest = {
        inProgress: false,
        ok: false,
        messages: "",
      };
    },
    resetUpdateInvoiceRequest: (state) => {
      state.updateInvoiceRequest = {
        inProgress: false,
        ok: false,
        messages: "",
      };
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all invoices
      .addCase(fetchAllInvoices.pending, (state) => {
        state.fetchInvoicesRequest.inProgress = true;
        state.fetchInvoicesRequest.ok = false;
        state.fetchInvoicesRequest.messages = "";
      })
      .addCase(fetchAllInvoices.fulfilled, (state, action) => {
        state.fetchInvoicesRequest.inProgress = false;
        state.fetchInvoicesRequest.ok = true;
        state.fetchInvoicesRequest.messages = "";
        state.invoices = action.payload.invoices;
        state.total = action.payload.total;
      })
      .addCase(fetchAllInvoices.rejected, (state, action) => {
        state.fetchInvoicesRequest.inProgress = false;
        state.fetchInvoicesRequest.ok = false;
        state.fetchInvoicesRequest.messages =
          (action.payload as string) || "Error al cargar las facturas";
      })
      // Create invoice
      .addCase(createInvoice.pending, (state) => {
        state.createInvoiceRequest.inProgress = true;
        state.createInvoiceRequest.ok = false;
        state.createInvoiceRequest.messages = "";
      })
      .addCase(createInvoice.fulfilled, (state) => {
        state.createInvoiceRequest.inProgress = false;
        state.createInvoiceRequest.ok = true;
        state.createInvoiceRequest.messages = "Factura generada exitosamente";
      })
      .addCase(createInvoice.rejected, (state, action) => {
        state.createInvoiceRequest.inProgress = false;
        state.createInvoiceRequest.ok = false;
        state.createInvoiceRequest.messages =
          (action.payload as string) || "Error al generar la factura";
      })
      // Create corrective invoice
      .addCase(createCorrectiveInvoice.pending, (state) => {
        state.createCorrectiveInvoiceRequest.inProgress = true;
        state.createCorrectiveInvoiceRequest.ok = false;
        state.createCorrectiveInvoiceRequest.messages = "";
      })
      .addCase(createCorrectiveInvoice.fulfilled, (state) => {
        state.createCorrectiveInvoiceRequest.inProgress = false;
        state.createCorrectiveInvoiceRequest.ok = true;
        state.createCorrectiveInvoiceRequest.messages =
          "Factura rectificativa generada exitosamente";
      })
      .addCase(createCorrectiveInvoice.rejected, (state, action) => {
        state.createCorrectiveInvoiceRequest.inProgress = false;
        state.createCorrectiveInvoiceRequest.ok = false;
        state.createCorrectiveInvoiceRequest.messages =
          (action.payload as string) ||
          "Error al generar la factura rectificativa";
      })
      // Update invoice
      .addCase(updateInvoice.pending, (state) => {
        state.updateInvoiceRequest.inProgress = true;
        state.updateInvoiceRequest.ok = false;
        state.updateInvoiceRequest.messages = "";
      })
      .addCase(updateInvoice.fulfilled, (state) => {
        state.updateInvoiceRequest.inProgress = false;
        state.updateInvoiceRequest.ok = true;
        state.updateInvoiceRequest.messages =
          "Factura actualizada exitosamente";
      })
      .addCase(updateInvoice.rejected, (state, action) => {
        state.updateInvoiceRequest.inProgress = false;
        state.updateInvoiceRequest.ok = false;
        state.updateInvoiceRequest.messages =
          (action.payload as string) || "Error al actualizar la factura";
      });
  },
});

export const {
  clearInvoicesErrors,
  resetCreateInvoiceRequest,
  resetCreateCorrectiveInvoiceRequest,
  resetUpdateInvoiceRequest,
} = invoicesSlice.actions;
export default invoicesSlice.reducer;
