import { createAsyncThunk } from "@reduxjs/toolkit";
import { getBudgetDetailsByRecordId } from "@/services/budgetsServices";
import {
  getVisualStockExtras,
  getVisualStockProducts,
} from "@/services/visualStockService";
import type { VisualStockDateRange } from "@/types/visualStock";

export const fetchVisualStockProductsThunk = createAsyncThunk(
  "visualStock/fetchProducts",
  async (range: VisualStockDateRange, { rejectWithValue }) => {
    try {
      return await getVisualStockProducts(range);
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Error al obtener el stock de productos",
      );
    }
  },
);

export const fetchVisualStockExtrasThunk = createAsyncThunk(
  "visualStock/fetchExtras",
  async (range: VisualStockDateRange, { rejectWithValue }) => {
    try {
      return await getVisualStockExtras(range);
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Error al obtener el stock de extras",
      );
    }
  },
);

export const fetchVisualStockBudgetDetailsThunk = createAsyncThunk(
  "visualStock/fetchBudgetDetails",
  async (budgetId: string, { rejectWithValue }) => {
    try {
      return await getBudgetDetailsByRecordId(budgetId);
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Error al obtener el detalle del presupuesto",
      );
    }
  },
);
