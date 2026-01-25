import { createSlice } from "@reduxjs/toolkit";
import type { InvoicesState } from "@/types/invoices";
import { fetchAllInvoices, createInvoice } from "../actions/invoices";

const initialState: InvoicesState = {
  invoices: [],
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
    },
    resetCreateInvoiceRequest: (state) => {
      state.createInvoiceRequest = {
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
        state.invoices = action.payload;
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
      });
  },
});

export const { clearInvoicesErrors, resetCreateInvoiceRequest } =
  invoicesSlice.actions;
export default invoicesSlice.reducer;
