import { createSlice } from "@reduxjs/toolkit";
import { fetchBudgets, fetchBudgetById } from "../actions/budgets";
import type { BudgetsState } from "@/types/budgets";

const initialState: BudgetsState = {
  budgets: [],
  total: 0,
  currentBudget: null,
  fetchBudgetsRequest: {
    inProgress: false,
    messages: "",
    ok: false,
  },
  fetchBudgetByIdRequest: {
    inProgress: false,
    messages: "",
    ok: false,
  },
};

const budgetsSlice = createSlice({
  name: "budgets",
  initialState,
  reducers: {
    clearBudgetsErrors: (state) => {
      state.fetchBudgetsRequest = initialState.fetchBudgetsRequest;
    },
    clearBudgetByIdErrors: (state) => {
      state.fetchBudgetByIdRequest = initialState.fetchBudgetByIdRequest;
    },
    clearCurrentBudget: (state) => {
      state.currentBudget = null;
      state.fetchBudgetByIdRequest = initialState.fetchBudgetByIdRequest;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBudgets.pending, (state) => {
        state.fetchBudgetsRequest = {
          inProgress: true,
          messages: "",
          ok: false,
        };
      })
      .addCase(fetchBudgets.fulfilled, (state, action) => {
        state.budgets = action.payload.budgets;
        state.total = action.payload.total || 0;
        state.fetchBudgetsRequest = {
          inProgress: false,
          messages: "",
          ok: true,
        };
      })
      .addCase(fetchBudgets.rejected, (state, action) => {
        state.fetchBudgetsRequest = {
          inProgress: false,
          messages:
            (action.payload as string) || "Error al obtener presupuestos",
          ok: false,
        };
      })
      .addCase(fetchBudgetById.pending, (state) => {
        state.fetchBudgetByIdRequest = {
          inProgress: true,
          messages: "",
          ok: false,
        };
      })
      .addCase(fetchBudgetById.fulfilled, (state, action) => {
        state.currentBudget = action.payload;
        state.fetchBudgetByIdRequest = {
          inProgress: false,
          messages: "",
          ok: true,
        };
      })
      .addCase(fetchBudgetById.rejected, (state, action) => {
        state.fetchBudgetByIdRequest = {
          inProgress: false,
          messages:
            (action.payload as string) || "Error al obtener el presupuesto",
          ok: false,
        };
      });
  },
});

export const {
  clearBudgetsErrors,
  clearBudgetByIdErrors,
  clearCurrentBudget,
} = budgetsSlice.actions;

export default budgetsSlice.reducer;
