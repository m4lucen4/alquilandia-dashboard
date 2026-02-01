import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  getBudgets,
  getBudgetById,
  type GetBudgetsParams,
} from "../../services/budgetsServices";

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

// Thunk para obtener un presupuesto por ID
export const fetchBudgetById = createAsyncThunk(
  "budgets/fetchById",
  async (budgetId: string, { rejectWithValue }) => {
    try {
      const budget = await getBudgetById(budgetId);
      return budget;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Error al obtener el presupuesto";
      return rejectWithValue(errorMessage);
    }
  },
);
