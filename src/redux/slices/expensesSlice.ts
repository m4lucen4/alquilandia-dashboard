import { createSlice } from "@reduxjs/toolkit";
import type { IRequest } from "@/types/auth";
import type { ExpensesState } from "@/types/expenses";
import { createExpenseThunk, deleteExpenseThunk, exportExpensesThunk, fetchExpenseDetailsThunk, fetchPaginatedExpensesThunk, updateExpenseThunk } from "../actions/expenses";

const requestIdle: IRequest = { inProgress: false, messages: "", ok: false };
const requestError = (message: unknown, fallback: string): IRequest => ({ inProgress: false, messages: typeof message === "string" ? message : fallback, ok: false });
const initialState: ExpensesState = { expenses: [], total: 0, currentExpense: null, fetchExpensesRequest: requestIdle, fetchExpenseDetailsRequest: requestIdle, createExpenseRequest: requestIdle, updateExpenseRequest: requestIdle, deleteExpenseRequest: requestIdle, exportExpensesRequest: requestIdle };

const expensesSlice = createSlice({
  name: "expenses",
  initialState,
  reducers: {
    clearExpenseDetails: (state) => { state.currentExpense = null; state.fetchExpenseDetailsRequest = requestIdle; },
    resetExpenseMutationRequests: (state) => { state.createExpenseRequest = requestIdle; state.updateExpenseRequest = requestIdle; state.deleteExpenseRequest = requestIdle; },
    clearExpenses: (state) => { state.expenses = []; state.total = 0; state.fetchExpensesRequest = requestIdle; },
  },
  extraReducers: (builder) => builder
    .addCase(fetchPaginatedExpensesThunk.pending, (state, action) => { state.latestFetchRequestId = action.meta.requestId; state.fetchExpensesRequest = { inProgress: true, messages: "", ok: false }; })
    .addCase(fetchPaginatedExpensesThunk.fulfilled, (state, action) => { if (state.latestFetchRequestId === action.meta.requestId) { state.expenses = action.payload.expenses; state.total = action.payload.total ?? 0; state.fetchExpensesRequest = { inProgress: false, messages: "", ok: true }; } })
    .addCase(fetchPaginatedExpensesThunk.rejected, (state, action) => { if (state.latestFetchRequestId === action.meta.requestId) state.fetchExpensesRequest = requestError(action.payload, "Error al cargar los gastos"); })
    .addCase(fetchExpenseDetailsThunk.pending, (state, action) => { state.latestDetailsRequestId = action.meta.requestId; state.fetchExpenseDetailsRequest = { inProgress: true, messages: "", ok: false }; })
    .addCase(fetchExpenseDetailsThunk.fulfilled, (state, action) => { if (state.latestDetailsRequestId === action.meta.requestId) { state.currentExpense = action.payload; state.fetchExpenseDetailsRequest = { inProgress: false, messages: "", ok: true }; } })
    .addCase(fetchExpenseDetailsThunk.rejected, (state, action) => { if (state.latestDetailsRequestId === action.meta.requestId) state.fetchExpenseDetailsRequest = requestError(action.payload, "Error al cargar el gasto"); })
    .addCase(createExpenseThunk.pending, (state) => { state.createExpenseRequest = { inProgress: true, messages: "", ok: false }; })
    .addCase(createExpenseThunk.fulfilled, (state) => { state.createExpenseRequest = { inProgress: false, messages: "", ok: true }; })
    .addCase(createExpenseThunk.rejected, (state, action) => { state.createExpenseRequest = requestError(action.payload, "Error al crear el gasto"); })
    .addCase(updateExpenseThunk.pending, (state) => { state.updateExpenseRequest = { inProgress: true, messages: "", ok: false }; })
    .addCase(updateExpenseThunk.fulfilled, (state) => { state.updateExpenseRequest = { inProgress: false, messages: "", ok: true }; })
    .addCase(updateExpenseThunk.rejected, (state, action) => { state.updateExpenseRequest = requestError(action.payload, "Error al actualizar el gasto"); })
    .addCase(deleteExpenseThunk.pending, (state) => { state.deleteExpenseRequest = { inProgress: true, messages: "", ok: false }; })
    .addCase(deleteExpenseThunk.fulfilled, (state) => { state.deleteExpenseRequest = { inProgress: false, messages: "", ok: true }; })
    .addCase(deleteExpenseThunk.rejected, (state, action) => { state.deleteExpenseRequest = requestError(action.payload, "Error al eliminar el gasto"); })
    .addCase(exportExpensesThunk.pending, (state) => { state.exportExpensesRequest = { inProgress: true, messages: "", ok: false }; })
    .addCase(exportExpensesThunk.fulfilled, (state) => { state.exportExpensesRequest = { inProgress: false, messages: "", ok: true }; })
    .addCase(exportExpensesThunk.rejected, (state, action) => { state.exportExpensesRequest = requestError(action.payload, "Error al exportar los gastos"); }),
});

export const { clearExpenseDetails, resetExpenseMutationRequests, clearExpenses } = expensesSlice.actions;
export default expensesSlice.reducer;
