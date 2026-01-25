import { createSlice } from "@reduxjs/toolkit";
import type { InvoicesState } from "@/types/invoices";
import { createInvoice } from "../actions/invoices";

const initialState: InvoicesState = {
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
