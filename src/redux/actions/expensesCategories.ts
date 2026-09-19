import { createAsyncThunk } from "@reduxjs/toolkit";
import type { ApiError } from "@/services/api";
import {
  createExpenseCategory as createExpenseCategoryService,
  deleteExpenseCategory as deleteExpenseCategoryService,
  fetchAllExpensesCategories as fetchAllExpensesCategoriesService,
  fetchExpenseCategoryDetails as fetchExpenseCategoryDetailsService,
  fetchExpensesCategoryOptions as fetchExpensesCategoryOptionsService,
  fetchPaginatedExpensesCategories as fetchPaginatedExpensesCategoriesService,
  updateExpenseCategory as updateExpenseCategoryService,
} from "@/services/expensesCategoriesService";
import type { ExpenseCategoryPayload, ExpensesCategoriesFilters } from "@/types/expensesCategories";

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null && "message" in error) {
    const { message } = error as ApiError;
    if (typeof message === "string") return message;
  }
  return fallback;
};

export const fetchPaginatedExpensesCategoriesThunk = createAsyncThunk("expensesCategories/fetchPaginated", async ({ pageSize, pageToFetch, filters }: { pageSize: number; pageToFetch: number; filters: ExpensesCategoriesFilters }, { rejectWithValue }) => {
  try { return await fetchPaginatedExpensesCategoriesService(pageSize, pageToFetch, filters); }
  catch (error) { return rejectWithValue(getErrorMessage(error, "Error al cargar las categorías")); }
});

export const fetchAllExpensesCategoriesThunk = createAsyncThunk("expensesCategories/fetchAll", async (_, { rejectWithValue }) => {
  try { return await fetchAllExpensesCategoriesService(); }
  catch (error) { return rejectWithValue(getErrorMessage(error, "Error al cargar las categorías")); }
});

export const fetchExpenseCategoryDetailsThunk = createAsyncThunk("expensesCategories/fetchDetails", async (id: string, { rejectWithValue }) => {
  try { return await fetchExpenseCategoryDetailsService(id); }
  catch (error) { return rejectWithValue(getErrorMessage(error, "Error al cargar la categoría")); }
});

export const fetchExpensesCategoryOptionsThunk = createAsyncThunk("expensesCategories/fetchOptions", async (_, { rejectWithValue }) => {
  try { return await fetchExpensesCategoryOptionsService(); }
  catch (error) { return rejectWithValue(getErrorMessage(error, "Error al cargar las opciones")); }
});

export const createExpenseCategoryThunk = createAsyncThunk("expensesCategories/create", async (body: ExpenseCategoryPayload, { rejectWithValue }) => {
  try { return await createExpenseCategoryService(body); }
  catch (error) { return rejectWithValue(getErrorMessage(error, "Error al crear la categoría")); }
});

export const updateExpenseCategoryThunk = createAsyncThunk("expensesCategories/update", async ({ id, body }: { id: string; body: ExpenseCategoryPayload }, { rejectWithValue }) => {
  try { return await updateExpenseCategoryService(id, body); }
  catch (error) { return rejectWithValue(getErrorMessage(error, "Error al actualizar la categoría")); }
});

export const deleteExpenseCategoryThunk = createAsyncThunk("expensesCategories/delete", async (id: string, { rejectWithValue }) => {
  try { await deleteExpenseCategoryService(id); return id; }
  catch (error) { return rejectWithValue(getErrorMessage(error, "Error al eliminar la categoría")); }
});
