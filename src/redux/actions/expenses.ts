import { createAsyncThunk } from "@reduxjs/toolkit";
import type { ApiError } from "@/services/api";
import {
  createExpense as createExpenseService,
  deleteExpense as deleteExpenseService,
  exportExpenses as exportExpensesService,
  fetchExpenseDetails as fetchExpenseDetailsService,
  fetchPaginatedExpenses as fetchPaginatedExpensesService,
  updateExpense as updateExpenseService,
} from "@/services/expensesService";
import type { ExpensePayload, ExpensesFilters } from "@/types/expenses";

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null && "message" in error) {
    const { message } = error as ApiError;
    if (typeof message === "string") return message;
  }
  return fallback;
};

export const fetchPaginatedExpensesThunk = createAsyncThunk(
  "expenses/fetchPaginated",
  async ({ pageSize, pageToFetch, filters }: { pageSize: number; pageToFetch: number; filters: ExpensesFilters }, { rejectWithValue }) => {
    try { return await fetchPaginatedExpensesService(pageSize, pageToFetch, filters); }
    catch (error) { return rejectWithValue(getErrorMessage(error, "Error al cargar los gastos")); }
  },
);

export const fetchExpenseDetailsThunk = createAsyncThunk("expenses/fetchDetails", async (id: string, { rejectWithValue }) => {
  try { return await fetchExpenseDetailsService(id); }
  catch (error) { return rejectWithValue(getErrorMessage(error, "Error al cargar el gasto")); }
});

export const createExpenseThunk = createAsyncThunk("expenses/create", async (body: ExpensePayload, { rejectWithValue }) => {
  try { return await createExpenseService(body); }
  catch (error) { return rejectWithValue(getErrorMessage(error, "Error al crear el gasto")); }
});

export const updateExpenseThunk = createAsyncThunk("expenses/update", async ({ id, body }: { id: string; body: ExpensePayload }, { rejectWithValue }) => {
  try { return await updateExpenseService(id, body); }
  catch (error) { return rejectWithValue(getErrorMessage(error, "Error al actualizar el gasto")); }
});

export const deleteExpenseThunk = createAsyncThunk("expenses/delete", async (id: string, { rejectWithValue }) => {
  try { await deleteExpenseService(id); return id; }
  catch (error) { return rejectWithValue(getErrorMessage(error, "Error al eliminar el gasto")); }
});

export const exportExpensesThunk = createAsyncThunk("expenses/export", async (filters: ExpensesFilters, { rejectWithValue }) => {
  try { return await exportExpensesService(filters); }
  catch (error) { return rejectWithValue(getErrorMessage(error, "Error al exportar los gastos")); }
});
