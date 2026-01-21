import { createAsyncThunk } from "@reduxjs/toolkit";
import { getBudgets, type GetBudgetsParams } from "../../services/budgetsServices";

// Thunk para obtener presupuestos
export const fetchBudgets = createAsyncThunk(
  "budgets/fetchAll",
  async (params: GetBudgetsParams, { rejectWithValue }) => {
    try {
      const response = await getBudgets(params);
      return response;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Error al obtener presupuestos";
      return rejectWithValue(errorMessage);
    }
  },
);
