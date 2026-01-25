import { createAsyncThunk } from "@reduxjs/toolkit";
import { createInvoice as createInvoiceService } from "@/services/invoicesService";
import type { CreateInvoiceData } from "@/types/invoices";

/**
 * Creates a new invoice from budget data
 */
export const createInvoice = createAsyncThunk(
  "invoices/create",
  async (invoiceData: CreateInvoiceData, { rejectWithValue }) => {
    try {
      const invoice = await createInvoiceService(invoiceData);
      return invoice;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Error desconocido al crear la factura";
      return rejectWithValue(errorMessage);
    }
  },
);
