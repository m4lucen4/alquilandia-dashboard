import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  getAllInvoices,
  createInvoice as createInvoiceService,
} from "@/services/invoicesService";
import type { CreateInvoiceData } from "@/types/invoices";

/**
 * Fetches all invoices with business information
 */
export const fetchAllInvoices = createAsyncThunk(
  "invoices/fetchAll",
  async (
    filters: { businessId?: string; budgetReference?: string } | undefined,
    { rejectWithValue },
  ) => {
    try {
      const invoices = await getAllInvoices(
        filters?.businessId,
        filters?.budgetReference,
      );
      return invoices;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Error desconocido al cargar las facturas";
      return rejectWithValue(errorMessage);
    }
  },
);

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
