import { createSlice } from "@reduxjs/toolkit";
import { fetchBudgets } from "../actions/budgets";
import type { BudgetsState } from "@/types/budgets";

const initialState: BudgetsState = {
  budgets: [],
  total: 0,
  fetchBudgetsRequest: {
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
      });
  },
});

export const { clearBudgetsErrors } = budgetsSlice.actions;

export default budgetsSlice.reducer;
